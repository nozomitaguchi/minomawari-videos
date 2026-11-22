#!/bin/sh
# 仕上げ：本物のナレーションで4Kを書き出す（lines/N_*.wav がそろってから）。 nohup ./finish.sh > finish.log 2>&1 &
set -e
cd "$(dirname "$0")"
slug=$(basename "$(pwd)")
python3 build_timeline.py | tail -2
grep -q audio timeline_mode.txt || { echo "ナレーションがそろっていません"; exit 1; }
./build_scenes.sh
python3 mix.py
rm -rf parts2x && SCALE=2 python3 render.py
n=$(python3 -c "import json,re;print(len(json.loads(re.sub(r'^window.TL = |;\s*$','',open('timeline.js').read()))['scenes']))")
i=0; : > list2x.txt; while [ $i -lt $n ]; do printf "file 'parts2x/part%02d.mp4'\n" $i >> list2x.txt; i=$((i+1)); done
ffmpeg -y -v error -f concat -safe 0 -i list2x.txt -c copy video4k_noaudio.mp4
ffmpeg -y -v error -i video4k_noaudio.mp4 -i mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -shortest -movflags +faststart "${slug}_mimawari_4k.mp4"
echo "done ${slug}_mimawari_4k.mp4"
