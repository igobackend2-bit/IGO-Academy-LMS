#!/usr/bin/env python3
"""
compress_video.py — re-encodes a video to a normal web-streaming bitrate.

Same settings validated by hand on production this session (see
server/src/scripts/reencode-module-video.js): H.264, CRF 23 with a 2.5 Mbps
hard cap, capped at 1080p (never upscales), AAC 128k audio, +faststart so
the moov atom sits at the front for progressive playback. This is what
brought a 1.4GB / 9m19s module video (~21 Mbps) down to 142MB (~2 Mbps)
with no visible quality loss.

ffmpeg does the actual encoding — this script is just a thin, reusable
wrapper so both the manual reencode script and the automatic
compress-on-upload endpoint call the exact same settings in one place.

Usage: python3 compress_video.py <input_path> <output_path>
Exits non-zero (with ffmpeg's own stderr already printed) on failure.
"""
import subprocess
import sys


def compress_video(input_path: str, output_path: str) -> None:
    cmd = [
        "ffmpeg", "-y",
        "-i", input_path,
        "-vf", "scale='min(1920,iw)':-2",
        "-c:v", "libx264", "-preset", "medium", "-crf", "23",
        "-maxrate", "2500k", "-bufsize", "5000k",
        "-c:a", "aac", "-b:a", "128k",
        "-movflags", "+faststart",
        output_path,
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        sys.stderr.write(result.stderr)
        raise RuntimeError(f"ffmpeg exited with code {result.returncode}")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python3 compress_video.py <input_path> <output_path>", file=sys.stderr)
        sys.exit(1)
    compress_video(sys.argv[1], sys.argv[2])
    print("OK")
