Philosophia social video

Final export: philosophia-69s-with-phone-demo.mp4
Format: 720 × 1280, 9:16, 24 fps, H.264 video and AAC audio.
Duration: 69 seconds.

The app demo at 00:10–00:25 uses seconds 3–18 of the supplied iPhone
recording. The original deployment screenshot and closing URL/hashtag
are retained. The recording is tone-mapped from HDR to SDR.
Other illustrated interface scenes remain labeled as stylized previews.

Latest platform captions are in captions.txt.

Rendering scripts:
  scripts/create-promo.py
  scripts/add-screen-recording.py

These scripts document the local production workflow. They require Python,
Pillow, NumPy, imageio-ffmpeg, and the macOS system fonts specified in code.
imageio-ffmpeg was installed in /tmp/philosophia-video-deps.

Source media is kept locally, not committed:
  User attachment.png
  ScreenRecording_11-24-2026 20-55-19_1.MP4

Run create-promo.py first to generate the 62-second screenshot edit and
ambient soundtrack, then add-screen-recording.py to generate this export.
Full audio/video decoding and representative exported frames were checked.
