# みのまわり図鑑 動画

YouTube「みのまわり図鑑」（@minomawari-zukan）の動画のソース。サイト：https://nozomitaguchi.github.io/everyday-trivia/

| フォルダ | 動画 |
|---|---|
| `shingou/` | 緑なのに、どうして「青信号」？ |
| `sora/` | 昼は青いのに、どうして夕やけは赤い？（制作中） |

## しくみ

- `video.html` + `scenes.js` + `characters.js`：SVGで1コマずつ描くアニメーション（`show(場面, 秒)`）
- `narration.json` → Gemini TTS（Google AI Studio）で音声 → `split2.py` で1行ずつ `lines/*.wav` に分割
- `build_timeline.py` → `timeline.js`（ナレーションに合わせて場面の長さを決める）
- `mix.py` → `mix.wav`（ナレーション・BGM・効果音）
- `render.py`（`SCALE=2` で4K）→ 場面ごとのmp4 → `ffmpeg` の concat で結合して音をのせる

mp4・wavなどの生成物は git に入れない（スクリプトから作り直せる）。ただし `lines/*.wav`（分割済みナレーション）は作り直しに手間がかかるので入れる。
