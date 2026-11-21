# sea-salty（海の水はなぜしょっぱい）動画用メモ

元記事：[海の水はなぜしょっぱいのか、塩は陸の岩から雨と川が運んできた](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/sea-salty.md)（公開ページ https://nozomitaguchi.github.io/everyday-trivia/t/sea-salty/ 、もの https://nozomitaguchi.github.io/everyday-trivia/i/sea/ ）
図はすべて `everyday-trivia/assets/figures-sea.js`（2026-11-21 作成）。

## 問い

海の水は、どうしてしょっぱいの？
（つかみ：海で遊んで口に入るとしょっぱい。でも、海に流れこむ川の水も、空から降る雨もしょっぱくない。しょっぱくない水が集まっているのに、なぜ？）

## 見せ場

- **しょっぱくない水が集まって、しょっぱくなる**：川の水のコップと海の水のコップを並べる（`sea-salty`）。答えは「海からは水だけが空へ出ていき、塩は残る」（`sea-salty-evaporate`）
- **塩のふるさとは山の岩**：雨が岩をほんの少しずつとかし、川が海へ運ぶ。世界の川が運ぶとけた塩は1年におよそ40億トン（NOAAの見積もり）
- **海の水1キログラムをかわかすと、塩など約35グラム**（重さの約3.5%）。海の塩を全部陸にならすと厚さ166メートル以上、40階建てのビルくらい、という見積もり（USGS・UNESCO。「見積もり」と言う）
- **もうこれ以上しょっぱくならない**：入ってくる塩と、海の底に積もって出ていく塩が、だいたいつり合っていると考えられている（`sea-salty-balance`）
- 最後の「みてみよう」：塩水を小皿でかわかすと白いつぶが残る＝海で起きていることを台所で見られる

## 説明の順番（5場面）

1. 海の水には塩がとけている。1キログラムに約35グラム。いちばん多いのは食塩のもと（塩化物イオンとナトリウム）　図：`sea-salty-35g`、`sea-salty-ions`
2. 塩はどこから？ 雨には空気の二酸化炭素が少しとけていて弱い酸性。岩をほんの少しずつとかす　図：`sea-salty-rain-rock`
3. とけたものは川に乗って海へ（1年におよそ40億トン）。海の底の割れ目からふき出す熱い水（熱水噴出孔）や海底火山からも加わる　図：`sea-salty-river`、`sea-salty-vent`
4. なぜ川はしょっぱくない？ 雨が新しい真水をいつも足すから。海は全部の川から塩を集め、水だけが蒸発して空へ（雲→雨→川へもどる）。塩は残る　図：`sea-salty-river-fresh`、`sea-salty-evaporate`
5. どんどんしょっぱくなる？ できたばかりの海は少ししょっぱい程度 → 長い時間でしょっぱく → 今は入る塩と海の底に積もる塩がだいたい同じ　図：`sea-salty-history`、`sea-salty-balance`

（入れるなら短く）場所でこさがちがう：大きな川が流れこむ黒海・バルト海はうすい、蒸発の多い地中海はこい、海につながっていない死海はとてもこい　図：`sea-salty-places`、`sea-salty-seas`
（入れるなら短く）日本には岩塩がないので、海の水から塩を作ってきた（塩田で水を蒸発させ、こい塩水を煮つめる。今は電気を使うイオン交換膜の方法が多い）　図：`sea-salty-salt-making`

予想の3択の案：海の水は、どうしてしょっぱい？（正解：山の岩からとけた塩を川が運び、水だけが空へ出ていくから）。ほかの選択肢は「海の生きものが塩を出しているから」「海の底に大きな塩のかたまりがあるから」など。cast.py の番号に合わせて並べる。

## 言い方の注意

- 塩のおもなもとは「陸の岩」。海の底の熱い水や海底火山は「〜からも加わる」と脇役で言う
- 塩化物イオンとナトリウムの割合は資料で85〜90%以上と幅があるので、数字は言わずに「ほとんど」「いちばん多い」と言う
- 「もうしょっぱくならない」は「〜と考えられている」と言う（NOAAも probably）
- 死海で人が浮くことは今回の出典で確かめていないので言わない（言うなら「水がとてもこい」まで）
- 166メートル・40億トン・5京トンは「見積もり」。35グラムは「平均」
- 洗濯物や汗など、出典にない身近な例で「塩が残る」と言わない。言うなら「塩水をかわかすと塩が残る」

## みてみよう と注意書き

- 大人といっしょに、水に食塩をとかした塩水を小皿に少し入れ、日の当たる窓辺に置く。水がなくなったら何が残るか予想してから、毎日見る（白い塩のつぶが残る）　図：`sea-salty-look`
- 地図や地球儀で、川が海に流れこむところ（河口）を探し、山から海まで指でたどる　図：`sea-salty-map`
- **注意（必ず入れる）**：海の水は飲まない（海で遊ぶときも）。塩水は口に入れない。小さい子の手が届かないところに置く

## 出典（概要欄用）

- USGS Water Science School「Why is the ocean salty?」 https://www.usgs.gov/water-science-school/science/why-ocean-salty
- NOAA National Ocean Service「Why is the ocean salty?」 https://oceanservice.noaa.gov/facts/whysalty.html
- NOAA National Ocean Service「Why is the ocean salty, but rivers flowing into it are not?」 https://oceanservice.noaa.gov/facts/riversnotsalty.html
- Woods Hole Oceanographic Institution「What makes the ocean salty?」 https://www.whoi.edu/ocean-learning-hub/ocean-facts/what-makes-the-ocean-salty/
- Stedmon & Visser (2023)「Why is the Sea Salty and Does it Matter?」Frontiers for Young Minds https://kids.frontiersin.org/articles/10.3389/frym.2023.1097831
- Scripps Institution of Oceanography「Voyager: What makes the ocean salty and how much salt is in the ocean?」 https://scripps.ucsd.edu/news/voyager-what-makes-ocean-salty-and-how-much-salt-ocean
- UNESCO Ocean Literacy「The reason why the Ocean is salty」 https://oceanliteracy.unesco.org/ocean-salty
- 気象庁「水温・塩分について」 https://ds.data.jma.go.jp/kaiyou/db/vessel_obs/description/obs_expr.html
- 長谷川正巳「受け継がれる塩づくりの歴史と文化」Ocean Newsletter 第355号（笹川平和財団） https://www.spf.org/opri/newsletter/355_3.html
- 観光庁 多言語解説文データベース「The History of Salt Production in Japan」 https://www.mlit.go.jp/tagengo-db/en/R4-00550,html
