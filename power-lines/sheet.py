import sys
from PIL import Image
fs=sys.argv[2:]; out=sys.argv[1]
w,h=960,540; cols=2; rows=(len(fs)+1)//2
S=Image.new('RGB',(w*cols,h*rows),'white')
for i,f in enumerate(fs):
    im=Image.open(f).resize((w,h)); S.paste(im,((i%2)*w,(i//2)*h))
S.save(out,quality=85)
