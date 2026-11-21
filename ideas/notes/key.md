# key（鍵）動画用メモ

元記事：[鍵を回すと、ドアの中で何が動いて開くのか](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/key-lock.md)（公開ページ https://nozomitaguchi.github.io/everyday-trivia/t/key-lock/ ）
図はすべて `everyday-trivia/assets/figures-key.js`（2026-11-21 作成）。

## 問い

鍵を回すと、ドアの中で何が動いて開くの？
（つかみ：形のよく似た2本の鍵。片方は回って、片方は差しこめても回らない。ちがいはギザギザの谷1つだけ）

## 見せ場

- **同じ断面・同じ向きで3コマ**：鍵を差す前（ピンが境目をまたいで止める）→ 合う鍵（6本の切れ目が赤い点線＝境目にそろう）→ 回したあと（上のピンは外の筒に残り、中の筒だけが回る）。ここを動きでつなぐのが一番の見せ場
- 合わない鍵：谷が1つ浅いだけで、そのピン1本が境目より上へ出て止まる（赤丸）
- 「鍵はかんぬきにさわっていない」：鍵が回すのは筒まで。筒のうしろのカムがかんぬきを押す
- 最後はドアを外から見た透かし図で、カムが回ってかんぬき（デッドボルト）がドア枠の受け金具の穴へ出る

## 説明の順番（5場面）

1. 鍵穴の中は二重の筒（内筒と外筒）。境目が「シアライン」。ピンは上下2本（下のタンブラーピンは長さが1本ずつちがう、上のドライバーピンはばねで押される）　図：`kl-plug-shell`、`kl-pin-pair`
2. 鍵を差す前：ピンが境目をまたいで回らない。合う鍵：谷がピンを押し上げ、6本とも切れ目がそろうと回る。「タンブラーピンの長さ＋谷の深さ＝6本とも同じ」　図：`kl-no-key`、`kl-right-key`、`kl-sum-rule`
3. 合わない鍵：1本でもずれると止まる（似た2本の鍵のちがい）　図：`kl-wrong-key`、`kl-two-keys`
4. 回したあと：中の筒だけが回り、うしろのカムが回る。カムがかんぬきを押し出す／引きこむ　図：`kl-turned`、`kl-cam`、`kl-chain`
5. かんぬきは2種類（斜めでばねで出るラッチボルト／四角いデッドボルト）。デッドボルトが受け金具の穴に入ると、引いても開かない。内側はサムターンで同じかんぬきを動かす　図：`kl-deadbolt-latch`、`kl-strike`、`kl-thumbturn`、`key-lock`

（入れるなら短く）古代エジプトの木の錠はピンが1本の棒だった → 1865年のイェールの特許でピンが2つに分かれ、回る筒の腕がボルトを押す形に　図：`kl-egypt`、`kl-yale-1865`
（使わなくてよい）ディンプルキー `kl-dimple`、マスターキー `kl-master`、ピンを使わない錠 `kl-ward-lever`、電気を切りかえる鍵穴 `kl-switch-keys`、ドアの部品の名前 `kl-door-parts`、取り付けの例 `kl-tailpiece`

予想の3択の案：鍵を回すと、ドアの中では何が動く？（正解：鍵穴の中の筒が回り、そのうしろの部品がかんぬきを押す）。ほかの選択肢は「鍵の先がかんぬきを直接押す」「鍵穴の中で電気のスイッチが入る」など。

## 言い方の注意

- 例は「ピンタンブラー錠」（日本でいちばん一般的、ALSOK）。すべての錠が同じではないので「たとえば、いちばん多いピンの鍵では」と言う
- 図の例は6本のピン（ALSOK の図の例）。「どの鍵も6本」とは言わない
- 回す角度（何度回すか）や、鍵の組み合わせの数は確かめられていないので言わない
- レバーハンドルでラッチが動くしくみは記事に書いていない（扱わない）

## みてみよう と注意書き

- 大人がドアを開けたまま押さえ、ドアの側面の「斜めの金具（ラッチボルト）」と「四角い金具（デッドボルト）」を見る。大人が内側のつまみ（サムターン）を回すと、どちらが出入りするか予想してから見る（答え：四角いデッドボルト）
- **注意（必ず入れる）**：ドアのすき間や金具、受け金具の穴に指を入れない。鍵やサムターンを回すのは大人。デッドボルトを出したままドアを閉めない
- 図：`kl-look`

## 出典（概要欄用）

- 警察庁「住まいる防犯110番」用語 https://www.npa.go.jp/safetylife/seianki26/theme_b/b_b_1_main.html
- ALSOK「鍵ものがたり Vol.9 ピンタンブラー錠」（取材協力：金庫と鍵の博物館）https://www.alsok.co.jp/person/keystory/09/
- ALSOK「鍵ものがたり vol.14 マスターキー」https://www.alsok.co.jp/person/recommend/always/key/key14.html
- ALSOK「鍵ものがたり Vol.3 古代エジプト錠」https://www.alsok.co.jp/person/keystory/03/
- NBS Special Publication 480-22（1977年）https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nbsspecialpublication480-22.pdf
- 米国特許 US48475（Linus Yale Jr.、1865年）https://patents.google.com/patent/US48475
- ウエスト「錠前の取扱上の注意事項」https://west-lock.co.jp/west/wp-content/uploads/2024/10/189_191.pdf
- 長沢製作所「GOAL製シリンダー取付手順」https://www.nagasawa-mfg.co.jp/cms/wp-content/themes/nagasawa/assets/keylex/pdf/3100_GOAL_install.pdf
