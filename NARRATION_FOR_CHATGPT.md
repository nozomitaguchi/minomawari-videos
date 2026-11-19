# ナレーションづくり（ChatGPT 担当）

みのまわり図鑑の動画は、下書き（Claude）→ **ナレーション（ChatGPT）** → 仕上げ（Claude）の順に作っている。
ここではナレーションの手順だけを書く。全体の決まりは `CLAUDE.md`、状態の一覧は `VIDEOS.md`。

## 1回の作業（2本ずつ）

1. `git pull --rebase`。`VIDEOS.md` で状態が `ナレーション待ち` のものを上から2本選ぶ（1本しかなければ1本）。
   その2行を `ナレーション中（YYYY-MM-DD HH:MM）` にして、すぐ commit・push（Claude と取りあわないため）。
2. 読ませる文を作る：
   `python3 split_batch.py text <slug1> <slug2> > batch.txt`
   （Python が使えなければ、それぞれの `<slug>/n_text.txt` を ` <long pause> ` でつないでもよい。順番は slug1 → slug2）
3. Google AI Studio の音声生成 `https://aistudio.google.com/generate-speech`（モデル Gemini 3.8 Flash TTS）。
   - 声：`VOICES.md` の「最後に使った声」の次の声（状態が NG のものはとばす）。
   - スタイルの欄：`VOICES.md` の「スタイルの指示」から、その声の性別・スタイルに合うものを入れる。
   - Speech block に batch.txt の中身をそのまま入れて Run。2本分で6〜7分。最後まで読めているか（途中で切れていないか）確認。
   - 1回の生成の上限は8分半くらいなので、**3本以上はまとめない**。
4. ダウンロードした wav を1行ずつに切る：
   `python3 split_batch.py split <ダウンロードしたwav> <slug1> <slug2>`
   表示される (実際の秒, 予想の秒) の比が 0.6〜1.8 くらいにそろっていれば OK（必要なもの：python3 と numpy）。
   それぞれの `<slug>/lines/N_00.wav …` ができる。
5. それぞれの `<slug>/voice.txt` に声の名前（例 `Elio`）を書く。`VOICES.md` の「最後に使った声」を更新。
6. `VIDEOS.md` の2行を `仕上げ待ち` にする。`lines/`・`voice.txt`・`VOICES.md`・`VIDEOS.md` を commit・push。
   コミットメッセージ例：`moon, tummy-rumble: ナレーション（Elio）`

### 切るのがむずかしいとき
手順4ができない（Python がない、比がそろわない など）ときは、wav を `incoming/<slug1>__<slug2>.wav` に置いて commit・push し、`VIDEOS.md` の2行を `仕上げ待ち` にする。Claude が仕上げのときに切る。

## してはいけないこと
- 台本（`narration.json` / `n_text.txt`）の文を変えない。読み方がおかしいときは、そのまま `VIDEOS.md` のその行に「読みまちがい：〜」とメモする。
- YouTube の操作はしない（ユーザーがやる）。
- `仕上げ中` や `下書き中` のものにはさわらない。
