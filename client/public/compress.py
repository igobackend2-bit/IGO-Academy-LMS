import imageio_ffmpeg
import subprocess
import sys

ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
input_file = sys.argv[1]
output_file = sys.argv[2]

print(f"Compressing {input_file} to {output_file} using {ffmpeg_exe}...")

# Compress to 720p, 24fps, H264, reduced bitrate for web, no audio since it's muted
cmd = [
    ffmpeg_exe,
    "-y",
    "-i", input_file,
    "-vf", "scale=-2:720",
    "-vcodec", "libx264",
    "-crf", "28",
    "-preset", "fast",
    "-an",  # remove audio
    output_file
]

subprocess.run(cmd, check=True)
print("Done!")
