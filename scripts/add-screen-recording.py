"""Replace the promo's illustrated demo with seconds 3–18 of real phone footage."""
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, '/tmp/philosophia-video-deps')
import imageio_ffmpeg
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'output/video/phone-demo-edit'
OUT.mkdir(parents=True, exist_ok=True)
FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()
SOURCE = ROOT / 'ScreenRecording_11-24-2026 20-55-19_1.MP4'
PROMO = ROOT / 'output/video/screenshot-edit/philosophia-62s-with-screenshot.mp4'
RESULT = OUT / 'philosophia-69s-with-phone-demo.mp4'

frame = Image.new('RGB', (720, 1280), '#07150f')
draw = ImageDraw.Draw(frame)
font = ImageFont.truetype('/System/Library/Fonts/Supplemental/Georgia.ttf', 32)
small = ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial.ttf', 21)
draw.text((360, 55), 'Follow your curiosity.', font=font, fill='#effbf4', anchor='mt')
draw.text((360, 104), 'PHILOSOPHIA · LIVE ON MY PHONE', font=small, fill='#8debc0', anchor='mt')
draw.text((360, 1230), 'Real app. Real exploration.', font=small, fill='#8debc0', anchor='mt')
frame.save(OUT / 'demo-frame.png')

# Decode the iPhone's PQ/BT.2020 video into linear light before tone mapping
# to SDR/BT.709. Keep the whole phone screen visible, without stretching.
filters = (
    '[0:v]trim=0:10,setpts=PTS-STARTPTS,fps=24,setsar=1,format=yuv420p[a];'
    '[0:v]trim=start=18,setpts=PTS-STARTPTS,fps=24,setsar=1,format=yuv420p[c];'
    '[1:v]zscale=t=linear:npl=100,format=gbrpf32le,zscale=p=bt709,'
    'tonemap=tonemap=mobius:desat=0,zscale=t=bt709:m=bt709:r=tv,'
    'scale=-2:1060,fps=24,setsar=1,format=yuv420p[phone];'
    '[2:v]format=yuv420p[bg];'
    '[bg][phone]overlay=(W-w)/2:150:shortest=1,trim=duration=15,'
    'setpts=PTS-STARTPTS[b];'
    '[a][b][c]concat=n=3:v=1:a=0[v];'
    '[3:a]atrim=duration=69,asetpts=PTS-STARTPTS,afade=t=out:st=66:d=3[audio]'
)
command = [FFMPEG, '-y', '-i', str(PROMO), '-ss', '3', '-t', '15', '-i', str(SOURCE),
           '-loop', '1', '-framerate', '24', '-i', str(OUT / 'demo-frame.png'),
           '-stream_loop', '-1', '-i', str(ROOT / 'output/video/screenshot-edit/ambient.wav'),
           '-filter_complex', filters, '-map', '[v]', '-map', '[audio]',
           '-c:v', 'libx264', '-preset', 'fast', '-crf', '19', '-pix_fmt', 'yuv420p',
           '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709',
           '-c:a', 'aac', '-b:a', '128k', '-t', '69', '-movflags', '+faststart', str(RESULT)]
with (OUT / 'render.log').open('w') as log:
    subprocess.run(command, stderr=log, check=True)
print(RESULT)
