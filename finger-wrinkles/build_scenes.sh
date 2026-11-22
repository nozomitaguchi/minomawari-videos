#!/bin/sh
# scenes.js は head.js（色・絵の道具）+ helpers.js + opening.js + scenes2.js をつなげたもの
cd "$(dirname "$0")" && cat head.js helpers.js opening.js scenes2.js > scenes.js
