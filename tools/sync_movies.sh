#!/bin/sh
# 完成した動画（4KのMP4とサムネイル）を、GitHub Actions の実行結果から手元のフォルダに取りこむ。
#   sh tools/sync_movies.sh [保存先フォルダ]      （既定: ~/minomawari-zukan-movies）
# GitHub CLI (gh) でログインずみのMacで実行する。もうあるファイルは取りなおさない。
# Actions の保存期間は14日。
set -eu
REPO=nozomitaguchi/minomawari-videos
DEST="${1:-$HOME/minomawari-zukan-movies}"
mkdir -p "$DEST"
TMP=$(mktemp -d); trap 'rm -rf "$TMP"' EXIT
gh api "repos/$REPO/actions/artifacts?per_page=100" --paginate \
  --jq '.artifacts[] | select(.expired == false) | select(.name | startswith("movie-")) | "\(.id) \(.name)"' |
while read -r id name; do
  slug=${name#movie-}
  [ -f "$DEST/${slug}_mimawari_4k.mp4" ] && continue
  if gh api "repos/$REPO/actions/artifacts/$id/zip" > "$TMP/$slug.zip" && unzip -oq "$TMP/$slug.zip" -d "$TMP/$slug" \
     && [ -f "$TMP/$slug/${slug}_mimawari_4k.mp4" ]; then
    mv "$TMP/$slug"/* "$DEST"/
    echo "取りこみ: $slug"
  fi
done
