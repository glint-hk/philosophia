"""Render an original vertical motion-graphics promo, not a screen recording."""
import os, sys, math, wave, subprocess
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFont
sys.path.insert(0, '/tmp/philosophia-video-deps')
import imageio_ffmpeg

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'output' / 'video' / 'screenshot-edit'
OUT.mkdir(parents=True, exist_ok=True)
W, H, FPS = 720, 1280, 24
SERIF='/System/Library/Fonts/Supplemental/Georgia.ttf'
ITALIC='/System/Library/Fonts/Supplemental/Georgia Italic.ttf'
SANS='/System/Library/Fonts/Supplemental/Arial.ttf'
BOLD='/System/Library/Fonts/Supplemental/Arial Bold.ttf'
GREEN='#8debc0'; WHITE='#effbf4'; DIM='#a4beae'; LINE='#315847'
def font(size, path=SANS): return ImageFont.truetype(path,size)
def text(d,xy,s,size=30,color=WHITE,path=SANS,anchor='la'):
    d.text(xy,s,font=font(size,path),fill=color,anchor=anchor)
def lines(d,y,items,size=62,color=WHITE,path=SERIF):
    for s in items:
        text(d,(W/2,y),s,size,color,path,'ma'); y+=size*1.18
def card(d,box,title,sub='',accent=False):
    d.rounded_rectangle(box,22,fill='#16392b' if accent else '#10281e',outline=GREEN if accent else LINE,width=2)
    x,y,x2,y2=box
    text(d,(x+22,y+23),title,27,WHITE,SERIF)
    if sub: text(d,(x+22,y2-43),sub,18,GREEN)
def base(k):
    yy,xx=np.mgrid[0:H,0:W]
    glow=np.exp(-(((xx-380)/500)**2+((yy-570)/650)**2))
    a=np.zeros((H,W,3),dtype=np.uint8)
    for i,(b,g) in enumerate([(5,8),(18,22),(13,14)]):a[:,:,i]=b+g*glow
    im=Image.fromarray(a); d=ImageDraw.Draw(im)
    text(d,(52,75),'φ  PHILOSOPHIA',23,GREEN,BOLD)
    text(d,(668,80),f'{order.index(k)+1:02}',18,DIM,SANS,'ra')
    d.line((52,122,668,122),fill=LINE)
    return im

order=[0,7,2,4,8,9,5,3,6]
durations=[3,7,8,6,8,10,7,7,6]
DEPLOYMENT_SCREENSHOT = Image.open(ROOT / 'User attachment.png').convert('RGB')

def deployment_scene(t):
    im = base(9)
    d = ImageDraw.Draw(im)
    lines(d,205,['One prompt.','A real deployment.'],58)
    if t < 2:
        box=(1340,130,2870,1250)
        caption='The original Codex conversation'
    elif t < 7:
        box=(1810,280,2840,650)
        caption='I pasted the Embarko prompt into Codex.'
    else:
        box=(1350,925,2160,1060)
        caption='Codex returned the live app link.'
    # Camera framing of the supplied evidence; screenshot text is unchanged.
    sx,sy=DEPLOYMENT_SCREENSHOT.width/2880,DEPLOYMENT_SCREENSHOT.height/1800
    shot=DEPLOYMENT_SCREENSHOT.crop(tuple(round(v*(sx if i%2==0 else sy)) for i,v in enumerate(box)))
    shot=shot.resize((660,round(660*shot.height/shot.width)),Image.Resampling.LANCZOS)
    y=round(650-shot.height/2)
    im.paste(shot,(30,y))
    text(d,(360,985),caption,25,GREEN,SANS,'ma')
    text(d,(360,1060),'Initially anonymous. Subsequently claimed permanently.',20,DIM,SANS,'ma')
    text(d,(360,1135),'Original deployment conversation · screenshot',18,DIM,SANS,'ma')
    return im

def scene(k):
    if k==9: return deployment_scene(3)
    im=base(k); d=ImageDraw.Draw(im)
    if k==0:
        lines(d,300,['One question','can change','your world.'],72)
        text(d,(360,635),'Follow it.',58,GREEN,ITALIC,'ma')
        text(d,(360,1010),'A new way to explore philosophy.',29,DIM,SANS,'ma')
    elif k==1:
        lines(d,215,['Ideas don’t','exist alone.'],70)
        for x,y,label in [(155,560,'FREEDOM'),(565,560,'MEANING'),(155,890,'ETHICS'),(565,890,'KNOWLEDGE')]:
            d.line((360,730,x,y),fill=LINE,width=3)
            d.ellipse((x-13,y-13,x+13,y+13),fill=GREEN)
            text(d,(x,y+34),label,19,DIM,BOLD,'ma')
        d.ellipse((280,650,440,810),fill='#204e39',outline=GREEN,width=2)
        text(d,(360,665),'φ',95,GREEN,SERIF,'ma')
        text(d,(360,1080),'400 ideas. 1,506 connections.',31,WHITE,SANS,'ma')
    elif k==2:
        lines(d,205,['Start with','your curiosity.'],65)
        card(d,(65,450,655,535),'Search concepts…','',True)
        for y,title,sub in [(575,'How should I live?','Start with Virtue Ethics'),(735,'Am I really free?','Explore free will and determinism'),(895,'What gives life meaning?','Start with Existentialism')]:
            card(d,(65,y,655,y+135),title,sub)
    elif k==3:
        lines(d,200,['See the threads','between ideas.'],62)
        card(d,(155,435,565,570),'Existentialism','YOUR STARTING POINT',True)
        for x,y,title,rel in [(65,700,'The Absurd','EXPLORE'),(385,700,'Freedom','QUESTION')]:
            d.line((360,570,x+135,y),fill=GREEN,width=2)
            card(d,(x,y,x+270,y+150),title,rel)
        text(d,(360,950),'Read. Connect. Keep exploring.',28,DIM,SANS,'ma')
        text(d,(360,1040),'Every idea opens another door.',30,GREEN,ITALIC,'ma')
    elif k==4:
        lines(d,220,['Keep the ideas','that stay with you.'],57)
        card(d,(65,450,655,970),'My Constellation','Export your collection to Obsidian',True)
        for y,s in [(555,'Virtue Ethics'),(655,'Stoic Ethics'),(755,'Existentialism')]:
            d.polygon([(112,y+5),(120,y+17),(112,y+29),(104,y+17)],outline=GREEN)
            text(d,(150,y),s,31,WHITE,SERIF)
            d.line((100,y+65,620,y+65),fill=LINE)
    elif k==5:
        lines(d,195,['Built with AI.','Live on Embarko.'],59)
        for n,y,title,sub in [('01',440,'Packaged the app','React source, ready to ship'),('02',625,'Deployed anonymously','Uploaded directly to Embarko'),('03',810,'Claimed the live link','Made Philosophia permanent')]:
            text(d,(70,y),n,27,GREEN,BOLD)
            text(d,(135,y-3),title,31,WHITE,SERIF)
            text(d,(135,y+48),sub,23,DIM)
        text(d,(360,1050),'From an idea to a shareable world.',28,GREEN,ITALIC,'ma')
    elif k==7:
        lines(d,240,['Hi, I’m','Hrishikesh.'],72)
        text(d,(360,485),'I built Philosophia with AI.',35,GREEN,SERIF,'ma')
        lines(d,655,['A place for curious people','to explore big questions,','one connected idea','at a time.'],35,DIM,SANS)
    elif k==8:
        lines(d,235,['From a prompt','to a public link.'],62)
        lines(d,475,['I pasted Embarko’s deployment','prompt into my AI conversation.'],31,WHITE,SANS)
        lines(d,665,['The AI packaged the source,','uploaded it, and checked','the deployment status.'],31,DIM,SANS)
        text(d,(360,1000),'The workflow, without the guesswork.',28,GREEN,ITALIC,'ma')
    elif k==9:
        lines(d,210,['The prompt','that put it online.'],60)
        d.rounded_rectangle((55,430,665,920),24,fill='#10281e',outline=LINE,width=2)
        lines(d,475,['“Put this online with Embarko','and give me the link to share.'],28,WHITE,SANS)
        lines(d,610,['Read the quickstart','and follow it.'],30,GREEN,SANS)
        lines(d,745,['Deploy anonymously first,','then give me the live URL.”'],28,WHITE,SANS)
        text(d,(360,980),'Excerpt from the prompt used in this project',21,DIM,SANS,'ma')
    else:
        text(d,(360,245),'φ',140,GREEN,SERIF,'ma')
        lines(d,465,['Where will your','curiosity take you?'],57)
        text(d,(360,695),'Explore Philosophia',38,WHITE,SERIF,'ma')
        text(d,(360,785),'philosophia-atlas.embarko.app',27,GREEN,BOLD,'ma')
        text(d,(360,960),'#DeployWithEmbarko',34,WHITE,BOLD,'ma')
    if k in [2,3,4]: text(d,(360,1135),'Stylized interface preview',17,DIM,SANS,'ma')
    if k in [8,5]: text(d,(360,1135),'The deployment story',17,DIM,SANS,'ma')
    return im

slides=[scene(i) for i in order]
sheet=Image.new('RGB',(3*270,3*480),'#07150f')
for i,s in enumerate(slides):sheet.paste(s.resize((270,480)),((i%3)*270,(i//3)*480))
sheet.save(OUT/'preview.jpg')
for index,t in enumerate([0,3,8]): deployment_scene(t).save(OUT/f'deployment-frame-{index+1}.jpg')
ffmpeg=imageio_ffmpeg.get_ffmpeg_exe()
silent=OUT/'promo-silent.mp4'
p=subprocess.Popen([ffmpeg,'-y','-f','rawvideo','-vcodec','rawvideo','-s',f'{W}x{H}','-pix_fmt','rgb24','-r',str(FPS),'-i','-','-an','-c:v','libx264','-preset','fast','-crf','20','-pix_fmt','yuv420p','-movflags','+faststart',str(silent)],stdin=subprocess.PIPE,stderr=subprocess.DEVNULL)
elapsed=0
for k,(slide,duration) in enumerate(zip(slides,durations)):
    for f in range(duration*FPS):
        t=f/FPS
        frame=deployment_scene(t) if order[k]==9 else slide.copy()
        d=ImageDraw.Draw(frame)
        # Slow moving sparks and a reading-progress line add life without shaking text.
        for j in range(0 if order[k]==9 else 10):
            x=35+(j*79)%650; y=160+((j*113-t*13)%900)
            d.ellipse((x,y,x+2,y+2),fill='#41745a')
        d.line((52,1190,52+616*(elapsed+t)/sum(durations),1190),fill=GREEN,width=3)
        fade=min(1,t/.25,(duration-t)/.25)
        if fade<1: frame=Image.blend(Image.new('RGB',(W,H),'#07150f'),frame,max(0,fade))
        p.stdin.write(frame.tobytes())
    elapsed+=duration
    print(f'Rendered scene {k+1}/{len(slides)}',flush=True)
p.stdin.close()
if p.wait()!=0:raise RuntimeError('Video encode failed')
# Original synthesized ambient bed, no licensed samples.
sr=44100; length=sum(durations); t=np.arange(sr*length)/sr
music=np.zeros_like(t)
for freq in [130.81,196,261.63,329.63]:music+=.025*np.sin(2*np.pi*freq*t)*(0.65+.35*np.sin(2*np.pi*.07*t+freq))
music*=np.minimum(t/2,1)*np.minimum((length-t)/3,1)
wav=OUT/'ambient.wav'
with wave.open(str(wav),'wb') as f:
    f.setnchannels(1);f.setsampwidth(2);f.setframerate(sr);f.writeframes((music*32767).astype(np.int16).tobytes())
result=subprocess.run([ffmpeg,'-y','-i',str(silent),'-i',str(wav),'-c:v','copy','-c:a','aac','-b:a','128k','-shortest','-movflags','+faststart',str(OUT/'philosophia-62s-with-screenshot.mp4')],capture_output=True)
if result.returncode:raise RuntimeError(result.stderr.decode())
print('Finished: '+str(OUT/'philosophia-62s-with-screenshot.mp4'))
