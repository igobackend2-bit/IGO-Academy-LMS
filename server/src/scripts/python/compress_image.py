#!/usr/bin/env python3
"""
compress_image.py — resizes + re-encodes an uploaded image as WebP.

Course thumbnails only ever need to display at a few hundred px wide (see
the same "actual display size vs. source size" audit done for the site
logo earlier this session) — a phone photo straight off a camera is
routinely 4000px+ wide and several MB, none of which the browser ever
shows. This caps the longer side at 1600px (plenty for a hero-sized
thumbnail on a 4K display) and re-encodes as WebP, which typically comes
out 70-90% smaller than the original JPEG/PNG with no visible quality
loss at these dimensions.

Animated GIFs are passed through untouched — Pillow would otherwise only
grab the first frame, silently breaking the animation, and course
thumbnails are never GIFs by convention anyway.

Usage: python3 compress_image.py <input_path> <output_path> [max_dim] [quality]
Prints the output format used ("webp" or "copied") to stdout on success.
"""
import sys
import shutil
from PIL import Image, ImageOps


def compress_image(input_path: str, output_path: str, max_dim: int = 1600, quality: int = 82) -> str:
    with Image.open(input_path) as img:
        if getattr(img, "is_animated", False):
            shutil.copyfile(input_path, output_path)
            return "copied"

        # Respects the EXIF orientation tag (phone photos are stored
        # unrotated with an orientation flag, not pre-rotated pixels) then
        # strips EXIF on save — nothing in this app reads image EXIF, and
        # dropping it is itself a small, free size reduction.
        img = ImageOps.exif_transpose(img)

        # Only ever downscale — an already-small thumbnail shouldn't be
        # blown up (that would both bloat the file and look worse).
        w, h = img.size
        if max(w, h) > max_dim:
            scale = max_dim / max(w, h)
            img = img.resize((round(w * scale), round(h * scale)), Image.LANCZOS)

        # WebP handles both opaque and transparent (RGBA) source images in
        # one format, unlike JPEG (no alpha) vs PNG (large for photos) —
        # matches the .webp conversion already done for other site images.
        if img.mode not in ("RGB", "RGBA"):
            img = img.convert("RGBA" if "transparency" in img.info else "RGB")

        img.save(output_path, "WEBP", quality=quality, method=6)
        return "webp"


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python3 compress_image.py <input_path> <output_path> [max_dim] [quality]", file=sys.stderr)
        sys.exit(1)
    in_path, out_path = sys.argv[1], sys.argv[2]
    max_dim = int(sys.argv[3]) if len(sys.argv) > 3 else 1600
    quality = int(sys.argv[4]) if len(sys.argv) > 4 else 82
    try:
        fmt = compress_image(in_path, out_path, max_dim, quality)
        print(fmt)
    except Exception as e:
        print(str(e), file=sys.stderr)
        sys.exit(1)
