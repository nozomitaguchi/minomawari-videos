# airplane（飛行機）動画用メモ

元記事：[飛行機は、あんなに重いのに、どうして空を飛べるのか](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/airplane-lift.md)（公開ページ https://nozomitaguchi.github.io/everyday-trivia/t/airplane-lift/ ）
図はすべて `everyday-trivia/assets/figures-airplane.js`（2026-11-22 作成）。

## 問い

飛行機は、あんなに重いのに、どうして空を飛べるの？
（つかみ：旅客機は人や荷物をのせると約255トン。止まっているときは浮かないのに、滑走路を走ると、ふわっと浮く。だれが持ち上げている？）

## 見せ場

- **持ち上げているのは「空気」**：つばさが前から来た空気を下へ曲げると、その反動で上へ押される（JAXA「前からきた空気を翼で下にうごかすことで飛行機は飛んでいます」）。同じことを圧力で見ると、つばさの上は圧力が低く、下は高い
- **よく聞く説明はまちがい**：「上と下に分かれた空気が後ろで同時に出会う」は NASA が「いちばん広まっているまちがいの一つ」としている。ケンブリッジ大学の煙の実験では、上の空気は下より先に後ろの端に着いてしまう（`ap-smoke` をアニメにすると強い：縦にならんだ煙の点が、上だけ先へ流れていく）
- **紙飛行機の平らなつばさでも飛ぶ**：上と下の道のりが同じでも飛ぶ。さかさまでも飛べる（NASA）
- 浮くには速さがいる：「動かなければ揚力はない」（NASA）。滑走路で時速270キロまで速くなる（JAXA）。揚力が重さを上回ったとき浮く（JAL の機長）

## 説明の順番（5場面）

1. 旅客機の重さ：ボーイング787-9は、いちばん重い状態で約255トン、290人のれる（ボーイングの空港向け資料）　図：`ap-heavy`
2. 飛んでいる飛行機の4つの力（重さ・揚力・推力・抵抗）。前へ進めるのはエンジン、持ち上げるのはつばさ（推力の約8割はエンジンの前の大きなファンが空気を後ろへ押し出して作る）　図：`ap-forces`、`ap-engine`
3. 浮くには空気が流れることが必要。止まっていると揚力はない → だから滑走路を時速270キロまで走る　図：`ap-no-motion`、`ap-takeoff`
4. つばさは空気を下へ曲げる → 反動で上へ。上は圧力が低く下は高い。2つは同じことを別の側から見た説明で、どちらも正しい　図：`ap-turn`、`ap-pressure`、`ap-both`（いちばん上の絵は `airplane-lift`）
5. よくあるまちがい「同時に出会う」→ 煙の実験で上が先に着く。紙飛行機の平らなつばさ・さかさま飛行・ヨットの帆　図：`ap-wrong`、`ap-smoke`、`ap-flat`、`ap-sail`

予想の3択の案：飛行機を空に持ち上げているのは？（正解：つばさが空気を下へ曲げる力）。ほかの選択肢は「エンジンが下へ風をふいている」「飛行機の中に空気より軽いガスが入っている」など。正解の番号は cast.py に従う。

## 言い方の注意

- 「上と下の空気が同時に後ろに着く」「上のほうが道のりが長いから」は**正解として言わない**。出すなら「まちがった説明」としてだけ
- 「ベルヌーイが正しい／ニュートンが正しい」と片方だけにしない。「空気を下へ曲げる反動」と「上下の圧力の差」は同じことの2つの見方（NASA）
- 揚力の大きさが「速さの2乗に比例」、迎え角・失速・フラップの話は確かめていないので言わない（inbox.md に保留）
- 「上の空気は速い」は正しい（NASA・ケンブリッジ）。まちがいなのは「同時に着くから速い」という理由
- 「紙に息を吹きかけると上がる」実験は、揚力の実演として使わない（Babinsky 2003 が「ベルヌーイの実演にならない」と書いている）
- 重さの数字は「ボーイング787-9で約255トン」「大きい飛行機では600トンにもなる（JAXA）」まで

## みてみよう と注意書き

- 紙飛行機を作って、つばさを横から見る。上と下は同じ形なのに飛ぶ
- 空港の展望デッキから、旅客機が浮き上がるまでに滑走路をどのくらい走るか、どこで車輪が地面からはなれるかを見る
- **注意（必ず入れる）**：紙飛行機は人の顔に向けて飛ばさない。空港では決められた場所（展望デッキなど）から見る
- 図：`ap-look`

## 出典（概要欄用）

- NASA Glenn Research Center「What is Lift?」 https://www.grc.nasa.gov/WWW/K-12/VirtualAero/BottleRocket/airplane/lift1.html
- NASA Glenn Research Center「Four Forces on an Airplane」 https://www.grc.nasa.gov/WWW/K-12/VirtualAero/BottleRocket/airplane/forces.html
- NASA Glenn Research Center「Incorrect Lift Theory #1」 https://www.grc.nasa.gov/WWW/K-12/VirtualAero/BottleRocket/airplane/wrong1.html
- NASA Glenn Research Center「Bernoulli and Newton」 https://www.grc.nasa.gov/WWW/K-12/VirtualAero/BottleRocket/airplane/bernnew.html
- ケンブリッジ大学「How wings really work」（2012） https://www.cam.ac.uk/research/news/how-wings-really-work
- Babinsky 2003「How do wings work?」Physics Education 38(6) https://www3.eng.cam.ac.uk/outreach/Project-resources/Wind-turbine/howwingswork.pdf
- JAXA「JAXAキッズ 航空機」 https://www.jaxa.jp/projects/pr/brochure/pdf/08/kids_05-a.pdf
- ボーイング「787 Airplane Characteristics for Airport Planning」 https://www.boeing.com/content/dam/boeing/v2/airports/acaps/787_ACAP_Rev_Q.pdf
- OnTrip JAL「そもそも飛行機はなぜ飛ぶの？その仕組みと秘密をパイロットが解説！」 https://ontrip.jal.co.jp/_ct/17824119
