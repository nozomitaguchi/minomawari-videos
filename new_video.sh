#!/bin/sh
# 新しい動画のフォルダを sora/ の道具から作る。 ./new_video.sh <slug>
set -e
cd "$(dirname "$0")"
slug="$1"
[ -n "$slug" ] || { echo "usage: ./new_video.sh <slug>"; exit 1; }
[ ! -e "$slug" ] || { echo "$slug already exists"; exit 1; }
mkdir -p "$slug/lines" "$slug/raw" "$slug/brand"
for f in head.js helpers.js opening.js characters.js video.html thumb.html build_scenes.sh build_timeline.py split2.py mix.py render.py snap.py sheet.py review.py review_video.py preview.sh finish.sh narration.json; do
  cp "sora/$f" "$slug/"
done
# 中身は書きかえる前提の見本
cp sora/scenes2.js "$slug/scenes2.example.js"
printf '' > "$slug/scenes2.js"
echo "created $slug/"
