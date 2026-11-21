# morning-glory（あさがお）動画用メモ

元記事：[アサガオのつるは、どうやって棒に巻きつくのか](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/morning-glory-twining.md)（公開ページ https://nozomitaguchi.github.io/everyday-trivia/t/morning-glory-twining/ ）
図はサイトの `assets/figures-morning-glory.js`（名前は下の各場面に書いた）。

## 問い

あさがおのつるは、どうやって棒に巻きつくの？（だれも巻いてあげていないのに）

## 見せ場

- **つるの先が、宙でぐるぐる輪をかいている**（目では見えないくらいゆっくり。早送りで見せる）。答えの核心はここ
- 棒に当たったところは止まり、先だけ回りつづける → 自然にらせんになる、という「止まる＋回る」の組み合わせ。2つの動きだけで巻きつきができるのがいちばんの「へぇ」
- 上から見ると、いつも同じ向き（時計の針と反対）
- 重力を感じられない「しだれアサガオ」は、回らず、巻きつかずにたれさがる（比べる絵が作りやすい）

## 予想の3択の案

「あさがおのつるは、どうやって棒を見つけて巻きつく？」
- つるの先が ぐるぐる回って、棒に当たるのを待つ（正解）
- 棒の においを かいで、近づく
- 棒に さわると、ぎゅっと 巻きつく（巻きひげの植物はこれに近いが、アサガオのくきは「さわっても動かない」とダーウィンが確かめた。ひっかけとして使える）

正解の番号は cast.py に従う。

## 説明の順番（5場面）

1. **つるの先が回る**：横に曲がった先が、ゆっくり輪をかく。のびるほど輪は大きい（`mg-tip-circle`、`mg-tip-wider`）。マルバアサガオでひとまわり2時間42分・2時間47分（ダーウィンの記録、`mg-one-turn-time`）。「日本のアサガオの時間」としては言わない
2. **棒に当たる → 止まる → 先は回りつづける → らせん**（`mg-wind-1`、`mg-wind-2`、`mg-wind-3`）。アニメの中心。先端の回転と、止まった点（赤い点）を分けて見せる
3. **さわって巻くのではない**：キュウリの巻きひげ（こすると動く）とくらべる（`mg-vs-tendril`）
4. **重力が大事**：しだれアサガオは重力の向きを感じる細胞が作れず、回らず、巻きつかない（`mg-shidare`）。2005年、東北大学などのグループ。1880年にダーウィン親子が「大事だろう」と言ってから証拠まで125年（`mg-darwin-1880`）。重力がどうやって回る動きを起こすかは「まだわかっていない」と言う
5. **向き**：上から見ると時計の針と反対（`mg-direction-top`）。ホップは反対向き（`mg-hop-opposite`）。「右巻き・左巻き」の呼び方は人によって逆になるので、ナレーションでは「時計の針と反対」と言う

（時間があれば）太い柱は苦手（`mg-thin-thick`）。モールの実験は「横から光が当たる部屋で」という条件つき。

## みてみよう

- 支柱のつるを上からのぞいて、時計の針と同じ向きか反対か（`mg-look-direction`）
- まだ巻いていないつるの先の向きを覚えて、1〜2時間あとにもう一度見る（`mg-look-tip`）
- **注意**：つるを引っぱったり、むりに巻いたりしない。**アサガオの種は口に入れない**（強い下剤の材料。食べ物には使えない）（`mg-seed-no`）。この注意は必ず入れる

## 言わないこと

- 日本のアサガオの1周の時間（資料なし）
- 茎の毛（逆毛）が支柱をつかむ、という話（未確認）
- 宇宙実験の結果（未確認）
- 「さわると巻く」（アサガオのくきについてはまちがい）

## 出典（概要欄用）

- Charles Darwin『The Movements and Habits of Climbing Plants』第2版（1875）第1章 https://darwin-online.org.uk/content/contentblock?basepage=1&itemID=F836&hitpage=1&viewtype=text
- Kitazawa D. ほか（2005）PNAS 102(51):18742–18747 https://pmc.ncbi.nlm.nih.gov/articles/PMC1310508/
- 東北大学 プレスリリース（2005年11月30日）https://www.tohoku.ac.jp/japanese/press_release/pdf2005/20051206.pdf
- 白瀧義明（2021）New Food Industry 63(8)（上から見て左巻き）https://libir.josai.ac.jp/il/user_contents/02/G0000284repository/pdf/JOS-05470277-63%288%29-610.pdf
- 名古屋市東山植物園 セルフガイド「よじのぼる植物」https://www.higashiyama.city.nagoya.jp/document/education/selfguide_botanical_climbing.pdf
- 医薬基盤・健康・栄養研究所 アサガオ（種子は下剤、食品に使えない）https://www.nibiohn.go.jp/eiken/info/pdf/k712.pdf
