#!/bin/sh
# 下書き動画（1080p、ナレーションがなければ声なし）を作る。 ./preview.sh  → <フォルダ名>_preview.mp4
set -e
cd "$(dirname "$0")"
slug=$(basename "$(pwd)")
python3 build_timeline.py | tail -2
./build_scenes.sh
python3 mix.py
rm -rf parts && python3 render.py
n=$(python3 -c "import json,re;print(len(json.loads(re.sub(r'^window.TL = |;\s*$','',open('timeline.js').read()))['scenes']))")
i=0; : > list1x.txt; while [ $i -lt $n ]; do printf "file 'parts/part%02d.mp4'\n" $i >> list1x.txt; i=$((i+1)); done
ffmpeg -y -v error -f concat -safe 0 -i list1x.txt -c copy video_noaudio.mp4
ffmpeg -y -v error -i video_noaudio.mp4 -i mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart "${slug}_preview.mp4"
echo "done ${slug}_preview.mp4"
