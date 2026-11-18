# みのまわり図鑑 動画づくりの手順

YouTube「みのまわり図鑑」（@minomawari-zukan、親子で見る雑学・横型4分前後のアニメ）の動画を、このリポジトリで1本ずつ作る。
見本は `sora/`（いちばん新しい作り方）。`shingou/` は古い作り方（時間の伸び縮みあり）なので、まねしない。

## 決まりごと

- 見る人は6歳と3歳の子と親。ことばはやさしく、漢字は字幕だけ。画面の文字はひらがな中心。
- 話すのはナレーターだけ。キャラクター（おねえちゃん6歳ポニーテール・おとうと3歳・ルーペを持ったカメレオン）は**声なしの吹き出し**だけ。1本に3〜4回まで。
- 内容は、サイト「みのまわり図鑑」（GitHub `nozomitaguchi/everyday-trivia` の `trivia/*.md`）に書いてあることだけ。書いていない数字や話は足さない。出典は記事の「出典」から概要欄に入れる。
- 流れ：オープニング → つかみ（ふしぎ）と題名 → 予想（3択、読み上げ中の選択肢に枠）→ 説明3〜6場面 → 正解と「みてみよう」（実物のどこを見るか。危ないことは必ず注意を入れる）→ おわり。
- ナレーションは30〜36行、全体で3分半〜4分。
- YouTube へのアップロード・公開・YouTube Studio の操作はしない（ユーザーがやる）。

## 手順

### 1. ネタを決める
`VIDEOS.md` の「つぎに作る候補」の上から順に1つ選ぶ。`everyday-trivia/trivia/` の関連する記事をぜんぶ読んで、いちばん「へぇ」となる問いを1つ決める。

### 2. フォルダを作る
`./new_video.sh <slug>`（例 `./new_video.sh dangomushi`）。`sora/` から道具一式がコピーされる。

### 3. 台本
- `<slug>/script.md` に場面ごとの台本を書く。
- `<slug>/narration.json` の `lines` に全行を書く（`who`: N=ナレーター、S/B/K=吹き出し）。
- `python3 - <<EOF` で N の行だけを ` <long pause> ` でつないだ `n_text.txt` を作る（`sora/` と同じ）。
- 予想の選択肢は「1番。〜」「2番。〜」「3番。〜」の3行。正解がわかりやすく、ほかの2つももっともらしく。

### 4. ナレーション（Gemini TTS / Google AI Studio、Claude in Chrome）
1. `tabs_context_mcp`（createIfEmpty: true）→ 新しいタブで `https://aistudio.google.com/generate-speech` を開く。
2. Speaker 1 が **Hali**、スタイルが「やさしく落ち着いた…」になっているのを確認（ちがえば Hali を選び、スタイルに narration.json の voices.N.prompt を入れる）。
3. 「Speech block text」の欄をクリック → cmd+a → `n_text.txt` の中身を type。
4. 右下の Run を押す。3分ほどで生成が終わる（Stop が Run にもどる）。
5. 下のバーのダウンロードボタンを押す。ファイルは **MacBook の `/Users/nozomitaguchi/Downloads`** に `Generated Audio <日付> - <時刻>.wav` で入る。
6. `device_list_dir` でそのフォルダを見て、いちばん新しい `Generated Audio` の wav を `device_stage_files` で取りこみ、`<slug>/raw/narration.wav` にコピー。
7. 「今日の上限」などで生成できないときは、そこで止めて、ここまでの台本をコミットし、ユーザーに `SendUserMessage` で知らせる。
8. 開いたタブは最後に閉じる。

### 5. 1行ずつに切る
`python3 split2.py raw/narration.wav N`。表示される (実際の秒, 予想の秒) の比がだいたいそろっていて、`cuts` がどれも長い無音（50以上）なら OK。ずれていたら、無音の位置を見て切り直す。

### 6. タイムラインと絵
- `build_timeline.py` の `SCN` を場面ごとに書きかえる（行の順番は narration.json と同じ）。`python3 build_timeline.py`。
- `scenes2.js` に場面を書く。`sora/scenes2.js` の書き方をまねる：`cue(k)`（場面の中の k 番目の行の開始秒）に合わせて絵を出す。`helpers.js` の `topBadge` の文字（`みのまわり図鑑 ｜ <題>`）、おわりの場面のサイトのページ名も変える。
- 字幕は下（y 850〜1050）に出るので、大事な絵や人物は y 850 より上に置く。
- `./build_scenes.sh` で `scenes.js` を作る。
- `python3 snap.py 場面:秒 ...` と `python3 sheet.py out.jpg snaps/*.jpg` で見て直す。
- 最後に `python3 review.py 3.0` で全体の一覧（`review_sheet_*.jpg`）をぜんぶ見て、重なり・はみ出し・空白・字幕とのかぶりを直す。

### 7. 音
`mix.py` の効果音の部分（`add(sfx, cue('場面id', k, 秒), ...)`）を新しい場面に合わせて書きかえ、`python3 mix.py`。

### 8. 4K で書き出す
- `SCALE=2 nohup python3 render.py > render4k.log 2>&1 &` をバックグラウンドで動かし、`sleep` で待ちながら `grep done render4k.log` で進み具合を見る（4分の動画で40分ほど）。
- 終わったら `parts2x/part*.mp4` を concat（`-c copy`）→ `mix.wav` をのせて（aac 256k、`-movflags +faststart`）`<slug>_mimawari_4k.mp4`。
- 何コマか取り出して、ちゃんと出ているか見る。

### 9. サムネイルと概要欄
- `thumb.html` の `drawThumb()` を新しい題にあわせて書きかえ、`sora/` と同じ方法で `brand/thumb.jpg`（1280×720）を作る。大きな題（2行）＋おねえちゃんかおとうと＋「みのまわり図鑑」のバッジ。
- `youtube-description.txt`：タイトル案、説明、チャプター（timeline.js から計算）、サイトのURL、出典、`#みのまわり図鑑` などのタグ。

### 10. 保存して届ける
- `VIDEOS.md` を更新（作った動画を「できた動画」へ）。
- コミットして push（コミットメッセージの最後に、セッションで指示されたクレジット行をつける）。
- `SendUserFile`（status: proactive）で mp4 とサムネイルを送り、`SendUserMessage` で題名と見どころを2〜3行で知らせる。
