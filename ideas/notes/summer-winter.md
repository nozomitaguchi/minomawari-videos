# summer-winter（夏は暑くて冬は寒い）動画用メモ

元記事：[どうして夏は暑くて、冬は寒いのか](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/seasons-summer-winter.md)（公開ページ https://nozomitaguchi.github.io/everyday-trivia/t/seasons-summer-winter/ ）
図はすべて `everyday-trivia/assets/figures-seasons.js`（2026-11-29 作成、15枚。太陽・懐中電灯・こども・かげは `figures-shadow.js` の部品を使っている）。図鑑の「もの」は `seasons`（きせつ（なつと ふゆ）、そらと けしき）。
色は、夏は赤・オレンジ、冬は青、光は黄でそろえてある。地球は北極の先に赤い点、日本は黄色の点、オーストラリアは白い点。

## 問い

どうして夏は暑くて、冬は寒いの？
（つかみ：同じ公園の夏と冬。夏のお日さまは高くてかげが短い、冬は低くてかげが長い。「夏は太陽に近いから？」と思わせておいて、じつは1月のほうが近い、でひっくり返す）

## 見せ場

- **ひっくり返し**：地球が太陽にいちばん近いのは1月（日本は冬）、いちばん遠いのは7月（日本は夏）。「近いから暑い」ではない
- **懐中電灯**：まっすぐ照らすと光はせまいところに集まって強い、ななめだと同じ光が広がって弱い。夏のお昼の太陽は高い（東京77.8°）、冬は低い（30.9°）
- **約1.9倍**：同じ太さの光のたばが地面に当たる広さは、冬至のお昼は夏至のお昼の約1.9倍（＝同じ広さに当たる光は約半分）。光の束がのびて地面の帯が長くなるアニメにしやすい
- **昼の長さ**：東京の夏至は4:25〜19:00で14時間35分、冬至は6:47〜16:32で9時間45分。夏は高い空を長い道のりで通る
- **地球のかたむき**：軸は約23.4°かたむいて、いつも同じ向きのまま太陽のまわりを回る。北がわが太陽を向くと日本は夏、反対がわに行くと冬
- **南半球は反対**：日本が冬のころ、オーストラリアは夏
- 意外な一言：いちばん暑いのは夏至（6月）ではなく8月。地面・海・空気があたたまるのに時間がかかる

## 説明の順番（5場面）

1. 夏のお日さまは高い、冬は低い（お昼の高さ77.8°と30.9°）　図：`seasons-summer-winter`、`seasons-noon-height`
2. 高い光はせまく強い、低い光は広がって弱い（懐中電灯 → 光のたばの広さ約1.9倍）　図：`seasons-flashlight`、`seasons-spread-ratio`
3. 夏は昼も長い（14時間35分と9時間45分、太陽の通り道）　図：`seasons-daylength`、`seasons-sun-path`
4. どうして高さが変わる？ 地球がかたむいたまま回るから。北が太陽を向くと日本は夏。南半球は反対　図：`seasons-orbit-tilt`、`seasons-north-tilt`、`seasons-south`（必要なら `seasons-no-tilt`）
5. 「近いから」ではない（1月がいちばん近い）、いちばん暑いのは8月　図：`seasons-distance`、`seasons-lag-graph`、`seasons-lag-why`

（場面5の「近いから？」は、予想の3択で出して、ここで回収すると流れがよい）

予想の3択の案：どうして夏は暑いの？（正解：お日さまが高く、光がまっすぐ当たるから）。ほかの選択肢は「地球が太陽に近づくから」「夏は太陽が大きくなるから」など。「近づくから」はよくある誤解なので、場面5で「じつは1月のほうが近い」と回収する。

## みてみよう（注意書きは必ず入れる）

- 晴れた日のお昼に、同じ場所で自分のかげの長さを見ておき、季節がかわったらくらべる（夏は短く、冬は長い）　図：`seasons-look-shadow`
- 暗い部屋で、大人といっしょに懐中電灯で紙を照らし、まっすぐとななめで明るいところの広さと明るさをくらべる　図：`seasons-look-flashlight`
- **注意**：太陽はまぶしいので、じかに見ない。懐中電灯の光は人の目に向けない

## 言い方の注意

- 太陽の高さ・日の出入りは「東京の2026年」の数字（国立天文台 暦計算室）。ほかの町や年では少しちがう
- 「約1.9倍」「約半分」は太陽の高さからの計算。空気で光が弱まる分は入れていない。「熱が半分」とは言わない（「同じ広さに当たる光が約半分」）
- 近日点・遠日点の距離は NASA のマイルの数字を km に直したもの（約1億4700万km・約1億5200万km）。日付は「1月」「7月（はじめごろ）」までにする
- かたむきは「約23.4°」（国立天文台）。NOAA は23.45°
- 8月がいちばん暑い・1月がいちばん寒いは、東京の月平均気温の平年値（1991〜2020年、気象庁）。おくれるわけは「地面も海も空気もすぐにはあたたまらない」まで。海と陸のちがいは確かめていないので言わない
- `seasons-lag-why` の2本の線はイメージ（数字ではない）。画面でも「イメージ」と出す

## 出典（概要欄用）

- 国立天文台 暦計算室「季節はなぜ変化するのか？」https://eco.mtk.nao.ac.jp/koyomi/wiki/B5A8C0E12FB5A8C0E1A4CFA4CAA4BCCAD1B2BDA4B9A4EBA4CEA4ABA1A9.html
- 国立天文台 暦計算室「昼や夜の長さの季節変化」https://eco.mtk.nao.ac.jp/koyomi/wiki/C6FCA4CEBDD0C6FEA4EAA4C8C6EEC3E62FC3EBA4E4CCEBA4CEC4B9A4B5A4CEB5A8C0E1CAD1B2BD.html
- 国立天文台 暦計算室「日の出入り＠東京」2026年6月 https://eco.mtk.nao.ac.jp/koyomi/dni/2026/s1306.html ・12月 https://eco.mtk.nao.ac.jp/koyomi/dni/2026/s1312.html
- NASA Space Place「What Causes the Seasons?」https://spaceplace.nasa.gov/seasons/en/
- NOAA NESDIS「Why does Earth have Seasons?」https://www.nesdis.noaa.gov/about/k-12-education/understanding-our-planet/why-does-earth-have-seasons
- ペンシルベニア州立大学 METEO 3「Seasonal Tides of Solar Heating」https://courses.ems.psu.edu/meteo3/node/1966
- 気象庁 ClimatView 東京 https://www.data.jma.go.jp/cpd/monitor/climatview/graph_mkhtml.php?m=09&n=47662&y=2026
