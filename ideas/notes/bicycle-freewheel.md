# bicycle-freewheel（自転車はペダルを止めても進む）動画用メモ

元記事：[自転車は、ペダルを止めてもどうして前へ進めるのか](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/bicycle-freewheel.md)（公開ページ https://nozomitaguchi.github.io/everyday-trivia/t/bicycle-freewheel/ ）
図はすべて `everyday-trivia/assets/figures-bicycle.js`（2026-11-29 作成、16枚。自転車・歯車・チェーン・ラチェットの部品は `window.AHA_BICYCLE` から使える）。図鑑の「もの」は `bicycle`（じてんしゃ、のりもの）。
色は、ペダルといっしょに回る部品はオレンジ、タイヤといっしょに回る部品は青、爪は赤でそろえてある。

## 問い

自転車は、ペダルを止めてもどうして前へ進めるの？
（つかみ：こいだあと足を止めると、ペダルは止まっているのに後ろのタイヤはくるくる。耳をすますと「チッチッチッ」）

## 見せ場

- **一方通行のしかけ**：後ろのタイヤのまん中に「ラチェット」。ばねで押された爪が、タイヤがわの歯にひっかかる
- **こぐと／止めると**：こぐと爪が歯にかかってタイヤがいっしょに回る。足を止めると、歯が爪を押し上げて爪はすべるだけ → タイヤだけ回る（同じ断面図を2枚並べて、オレンジだけ止まる・青だけ回る、をアニメにしやすい）
- **チッチッチッの正体**：爪が歯の上をすべって、ばねで谷に落ちるたびに鳴る音
- **ないとどうなる？**：下り坂でペダルも足もぐるぐる。競輪の自転車（ピスト）は本当にそう：ペダルが空回りせず、ブレーキもなく、止まるまでペダルも回る
- 意外な一言：1860年代の自転車はペダルが前のタイヤにじかについていて、下り坂では足を「足のせ」に上げて進んだ。前輪の大きいオーディナリーではハンドルの上に足を投げ出した

## 説明の順番（5場面）

1. 足の力はチェーンで後ろのタイヤへ（ペダル → 前の歯車 → チェーン → 後ろの歯車 → タイヤ）　図：`bicycle-freewheel`、`bicycle-drive-path`（入れるなら `bicycle-gear-ratio`）
2. 後ろのタイヤのまん中に一方通行のしかけ（ラチェット：歯・爪・ばね）　図：`bicycle-ratchet-parts`
3. こぐと爪がかかる／止めると爪がすべる、そのとき「チッチッチッ」　図：`bicycle-ratchet-pedal`、`bicycle-ratchet-coast`、`bicycle-ratchet-sound`
4. 動いているものは動きつづけようとする（空気の抵抗などでだんだんおそく）　図：`bicycle-inertia`
5. ラチェットがなかったら：下り坂でペダルぐるぐる、競輪のピスト、むかしの自転車　図：`bicycle-no-ratchet`、`bicycle-keirin-fixed`、`bicycle-velocipede`（`bicycle-ordinary`、`bicycle-history-timeline`）

（入れなくてよい）ラチェットのいろいろな形 `bicycle-freewheel-types`

予想の3択の案：足を止めても自転車が進めるのは、どうして？（正解：後ろのタイヤのまん中に、こぐ力だけを伝える「一方通行」のしかけがあるから）。ほかの選択肢は「タイヤの中にばねが入っているから」「チェーンがのびて引っぱるから」など。

## みてみよう（注意書きは必ず入れる）

- 大人が自転車をこいで足を止めたときに、はなれたところから耳をすまして「チッチッチッ」を聞き、ペダルが止まっているのに後ろのタイヤが回っているか見る　図：`bicycle-look-listen`
- 止めてある自転車の後ろのタイヤのまん中を横から見て、重なった歯車とチェーンをたどる　図：`bicycle-look-hub`
- **注意**：走っている自転車には近づかない。歯車やチェーンには指を入れない（さわるのは大人）

## 言い方の注意

- ラチェットの形は自転車によってちがう（爪と歯の形のほか、みぞを切った2枚を押し合わせる形もある。MONOist）。「どの自転車も爪が2つ」とは言わない（爪2つ・歯15は、シェルドン・ブラウンが分解した一例）
- 「チッチッチッ」は爪式の音。シマノには音の出ないころ（ローラー）式もある
- 歯10と5でペダル1回転にタイヤ2回転は、MONOist の説明用のわかりやすい数字（実物の歯の数ではない）
- ミショーの自転車は「1860年代」と言う（1861年とする資料と、1867年のパリ万博が出てくる資料がある）
- フリーホイールの発明者・年、コースターブレーキの発明者は確かめていないので言わない（1900年の車に「コースターブレーキ」つきのハブがあった、までは言える）
- 競輪のピストは「ブレーキがないので公道は走れない」（いわき市の資料）。まねして乗る話にしない

## 出典（概要欄用）

- MONOist 身近なモノから学ぶ機構設計“超”入門(5) ラチェット機構 https://monoist.itmedia.co.jp/mn/articles/2005/12/news001.html
- MONOist 同(8) 巻き掛け伝動機構とギアチェンジ https://monoist.itmedia.co.jp/mn/spv/2101/21/news002_3.html
- Sheldon Brown「Traditional Thread-on Freewheels」https://www.sheldonbrown.com/freewheels.html
- NASA Glenn「Newton's Laws of Motion」https://www.grc.nasa.gov/WWW/K-12/rocket/BottleRocket/journey_newtona1.htm
- いわき市「競輪のしくみ」（PDF）https://www.city.iwaki.lg.jp/www/contents/1569302427058/files/keirinnosikumi.pdf
- Museo Galileo「The "boneshaker"」https://brunelleschi.imss.fi.it/biciclette/escuotiossa.html
- Ingenium「A ride through the evolution of the bicycle (Part 2)」https://ingeniumcanada.org/channel/articles/a-ride-through-the-evolution-of-the-bicycle-part-2
