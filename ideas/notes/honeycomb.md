# honeycomb（ハチの巣）動画用メモ

元記事：[ハチの巣はなぜ六角形なのか](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/bee-honeycomb-hexagon.md)（サイト：https://nozomitaguchi.github.io/everyday-trivia/t/bee-honeycomb-hexagon/ ）
図：`everyday-trivia/assets/figures-bee.js`（`F['名前']`）

## 問い

ハチの巣は、どうして六角形なの？

## 見せ場

- **まるを並べると、すき間ができる → 六角形ならぴったり**。丸い部屋を並べて、すき間に色をつけてから、丸が六角形に変わってすき間が消える（`bee-tile-gaps`、`bee-round-to-hex`）
- **同じ広さで、壁の長さくらべ**。三角・四角・六角の部屋の広さをそろえて、まわりの長さを棒グラフで比べる（約4.56／4／約3.72）。壁＝ろう＝はちみつ、なので短いほどお得（`bee-perimeter`）
- **となりが5つだと五角形**。まわりの部屋の数と角の数が同じになる。子どもが数えて確かめられる（`bee-neighbors`）

## 説明の順番（5場面）

1. **部屋は何に使う？** 赤ちゃんを育てる部屋、はちみつ・花粉をためる部屋。いっぱいになるとろうでふた（`bee-comb-rooms`）
2. **壁は何でできてる？** 働きバチのおなかの下（4対）から出るろうの白いかけら。あしではがして、口でかんで壁にする（`bee-wax-scales`、`bee-wax-build`）。ろうははちみつから作る＝大事な材料（`bee-wax-honey`）
3. **すき間なく並ぶ形は3つだけ** 丸はすき間ができる。三角・四角・六角はぴったり、五角はすき間（`bee-tile-gaps`、`bee-tile-three`）
4. **3つのうち壁がいちばん短いのが六角形** 同じ広さで長さくらべ（`bee-perimeter`）。2000年以上前から言われていて、数学で証明されたのは1999年（`bee-history`、`bee-proof`）
5. **ハチはどうやって六角形にしている？** 作りたての部屋は丸く、少したつと六角形（`bee-round-to-hex`）。ろうがあたたまってひっぱられる説と、並べ方で決まる説があって「まだ研究中」（`bee-debate`、`bee-neighbors`）。わかっていないことは「わかっていない」と言う

予想の3択の例：「じょうぶだから」「すき間なく並べられて、壁が少なくてすむから」「ハチの体が六角形だから」など（正解の番号は cast.py に従う）。

## みてみよう

- 図鑑や写真で、ミツバチの巣とアシナガバチの巣をくらべる。六角形の部屋のまわりに、となりがいくつあるか数える。はしっこに六角形でない部屋がないか探す（`bee-look-photo`）
- アシナガバチの巣も六角形。材料はろうではなく、植物のせんいをかんでだ液とまぜた紙のようなもの（`bee-wasp-nest`）

## 注意書き（必ず入れる）

- **本物のハチの巣には近づかない。つついたり、石を投げたりしない。** 見るのは図鑑や写真で（横浜市・堺市の案内）
- 「45℃まであたためる」はカリハロらの説で、反論がある。断定しない
- 「ハチは数学がわかっている」とは言わない。六角形になるしくみは研究中

## 使える図の名前

`bee-honeycomb-hexagon`（つかみ・題名）、`bee-comb-rooms`、`bee-wax-scales`、`bee-wax-build`、`bee-wax-honey`、`bee-tile-gaps`、`bee-tile-three`、`bee-perimeter`、`bee-history`、`bee-proof`、`bee-cell-bottom`（むだのない形ではない底、使わなくてよい）、`bee-round-to-hex`、`bee-debate`、`bee-neighbors`、`bee-wasp-nest`、`bee-look-photo`

## 出典（概要欄用）

- Thomas C. Hales, The Honeycomb Conjecture（arXiv:math/9906042） https://arxiv.org/abs/math/9906042
- Philip Ball, How honeycombs can build themselves, Nature（2013） https://www.nature.com/articles/nature.2013.13398
- F. Nazzi, Scientific Reports 6（2016） https://www.nature.com/articles/srep28341
- John Skinner（テネシー大学）, How do honey bees make wax? https://bee-health.extension.org/?p=803
- Clarence Collison, Beeswax, Wax Glands, Bee Culture https://beeculture.com/?p=10571
- アリゾナ大学, The Honey Bee Body https://cales.arizona.edu/pubs/insects/ahb/inf2.html
- 愛知県農業総合試験場「知ってとくとく ミツバチの管理法」 https://www.pref.aichi.jp/uploaded/attachment/320294.pdf
- 堺市「アシナガバチの巣の観察」 https://www.city.sakai.lg.jp/kenko/kenko/sodan/gaichu/mijika/ashinagabachi.files/asinagaitinen.pdf
- 横浜市泉区「アシナガバチの駆除方法」 https://www.city.yokohama.lg.jp/izumi/kurashi/sumai_kurashi/seikatsu/soudan/gaityueisei/ashinagabachi.html
