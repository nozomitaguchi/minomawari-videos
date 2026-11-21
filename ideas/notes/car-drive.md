# car-drive（車の仕組み）動画用メモ

元記事：[アクセルを踏むと、どうやってタイヤまで力が届くのか](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/car-drivetrain.md)（公開ページ https://nozomitaguchi.github.io/everyday-trivia/t/car-drivetrain/ ）
図はすべて `everyday-trivia/assets/figures-car5.js`（2026-11-21 作成）。ピストン→回転だけは既存の `engine-crank`（`figures-car-train.js`）。

## 問い

アクセルを踏むと、どうやってタイヤまで力が届くの？
（つかみ：止まった車のアクセルを踏む。ペダルは足もと、タイヤは車のすみっこ。離れているのに、何が間をつないでいる？）

## 見せ場

- **力のリレー**：ペダル → エンジン → 変速機 → デフ → タイヤ → 道路 を、順に色をつけて追う（`car-drivetrain`）。各場面の最後に「つぎはだれにバトンを渡す？」でつなぐと流れが見える
- **自転車のギアとくらべる**：坂道で軽いギアにするとペダルが軽くなる、を子どもの体験から入り、車の歯車（小さい歯車が大きい歯車を回すと、ゆっくり・つよく）へ移す
- **カーブで外のタイヤがたくさん回る**：上から見た車がカーブを曲がり、外の線が長い。デフが外を速く、内をゆっくり回す
- **最後に押すのは道路**：タイヤが道路を後ろへ押す（赤）→ 道路がタイヤを前へ押し返す（緑）。かけっこで地面を後ろへけるのと同じ。ここが「へぇ」の山場

## 説明の順番（6場面）

1. ペダルが伝えるのは「空気をどれだけ入れるか」。昔はワイヤで弁を引っぱって開いた／いまはセンサーとコンピューターとモーターで開く　図：`drive-pedal-wire`、`drive-pedal-electronic`
2. エンジンの中で、上下の動きが回転になる（くわしくは既存のエンジン記事。動画では1カットで）　図：`engine-crank`
3. 止まっていてもエンジンは止めない：エンジンはゆっくりすぎると「プスン」と止まる。マニュアル車はクラッチで切り離す／オートマ車は油の流れで伝える（トルクコンバーター）　図：`drive-clutch`、`drive-torque-converter`
4. 変速機は自転車のギアと同じ考え：歯10個と5個 → ペダル1回で後輪2回。坂は「前小・後ろ大」で軽く。車も歯車で回る速さと力の割合を変える　図：`drive-bike-gear-count`、`drive-bike-hill`、`drive-gear-slow-strong`（オートマの中の遊星歯車 `drive-at-planetary` は使わなくてよい）
5. デフ：カーブでは外のタイヤが長い道のりを進むので、外を速く・内をゆっくり。デフから左右へドライブシャフト　図：`drive-diff-curve`、`drive-shaft`
6. 最後に押すのは道路：タイヤが道路を後ろへ押し、道路がタイヤを前へ押し返す。人が走るのも同じ。タイヤが道路にさわっているのは手のひら1枚分ほど　図：`drive-tire-push`、`drive-run-same`、`drive-tire-palm`

（入れるなら短く）電気自動車：アクセル → インバーターに合図 → モーターの電気が増える。変速機のかわりに減速機。モーターは回りはじめから大きな力　図：`drive-ev-signal`、`drive-ev-compare`、`drive-ev-start`
（使わなくてよい）FFとFR `drive-ff-fr`

予想の3択の案：車を前へ押しているのは、さいごはだれ？（正解：道路。タイヤが道路を後ろへ押すと、道路がタイヤを前へ押し返す）。ほかの選択肢は「エンジンが車体を直接押す」「タイヤの中の空気が押す」など。

## 言い方の注意

- 例は「エンジンを前に積んだ、ふつうのガソリン車」。電気自動車やハイブリッドは別と言う
- マニュアル車（クラッチ）とオートマ車（トルクコンバーター）を混ぜない
- 「ゆっくり回ると力が弱いので変速機が要る」は GAZOO（トヨタ）の説明。エンジンの回転数やギア比の数字は確かめていないので言わない
- 歯10個と5個の例は自転車の例（MONOist）。車のギアの歯の数ではない
- 「手のひら1枚分」はブリヂストンの言い方。面積の数字は言わない
- 雪道で空回りする理由、片方のタイヤが滑るとデフで力が逃げる話は確かめられていないので言わない
- EV の「回りはじめから大きな力」は日産・GAZOO の説明。グラフ `drive-ev-start` は形だけのイメージ（数字なし）

## みてみよう と注意書き

- おもちゃの車（ぜんまいやプルバック）を、床に置いた紙の上で走らせる。どのタイヤが回されているか、紙が前と後ろのどちらへずれるかを予想してから見る　図：`drive-look-toy`
- **注意**：本物の車は、エンジンがかかっているときや動いているときに近づかない。タイヤのまわりはのぞきこまない　図：`drive-look-safe`

## 出典（概要欄用）

- 日立評論 1995年2月号「最適な駆動トルクを実現するエンジン吸気量制御システム」 https://www.hitachihyoron.com/jp/pdf/1995/02/1995_02_04.pdf
- Honda R&D Technical Review Vol.14 No.2「適応制御を用いた電子制御スロットルの開発」 https://global.honda/jp/technical-review/PDF/014-2/014-2_77.pdf
- 日本機械学会 メカライフ ガソリンエンジンのしくみ https://www.jsme.or.jp/mechalife/jp/student/mechaland/0503.pdf
- GAZOO よくわかる自動車歴史館 第94話（トヨタ自動車） https://gazoo.com/feature/gazoo-museum/car-history/15/07/24_1/
- コトバンク「トルクコンバーター」（日本大百科全書） https://kotobank.jp/word/%E3%83%88%E3%83%AB%E3%82%AF%E3%82%B3%E3%83%B3%E3%83%90%E3%83%BC%E3%82%BF%E3%83%BC-586173
- MONOist いまさら聞けないクルマの仕組み（3） https://monoist.itmedia.co.jp/mn/articles/2408/28/news007.html
- MONOist 身近なモノから学ぶ機構設計“超”入門（8） https://monoist.itmedia.co.jp/mn/articles/2101/21/news002_3.html
- 新潟大学 工学部 実習書「自動車用トランスミッションと駆動系」 https://www.eng.niigata-u.ac.jp/~tmfact001/01/tm01.PDF
- コトバンク「差動歯車装置」（日本大百科全書） https://kotobank.jp/word/%E5%B7%AE%E5%8B%95%E6%AD%AF%E8%BB%8A%E8%A3%85%E7%BD%AE-69331
- JTEKT ENGINEERING JOURNAL No.1019 https://www.jtekt.co.jp/engineering-journal/assets/1019/1019_09.pdf
- 岩手県立総合教育センター 物理基礎 https://www1.iwate-ed.jp/07tantou/kagaku/buturiiso/buturikiso/05.pdf
- ブリヂストン タイヤカタログ2026 https://tire.bridgestone.co.jp/pdf/tire-catalogue2026_p03-04.pdf
- 日産 EVパワートレイン https://www.nissan-global.com/JP/INNOVATION/TECHNOLOGY/ARCHIVE/E_POWERTRAIN_ZE1/
- 日産 電動パワートレイン制御技術 https://www.nissan-global.com/JP/INNOVATION/TECHNOLOGY/ARCHIVE/E_POWERTRAIN/
