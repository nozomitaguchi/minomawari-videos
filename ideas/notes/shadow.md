# shadow（かげ）動画用メモ

元記事：[かげは、どうして自分と同じ形になるのか](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/shadow-shape.md)（サイト：https://nozomitaguchi.github.io/everyday-trivia/i/shadow/）
図は `everyday-trivia/assets/figures-shadow.js`（`window.AHA_SHADOW` に たいよう・でんきゅう・かいちゅうでんとう・じめん・こども・ねた かげ（`lying`）・たった かげ（`standing`）・ひかりの せん の部品あり）。かげは灰色（#4f565b、うすく重ねる）、光は黄色の線。

## 問い

かげは、どうして自分と同じ形になるの？（手をふると、かげも手をふるのはなぜ？）

## 見せ場

- **かげは「光がとどかない場所」**。何かが「ある」のではなく、光が「ない」。光の線を1本ずつ体に当てて、体にぶつかった線だけ止まり、ふちをかすめた線は地面までとどく → とどかない場所のふちが体のふちになる（星形の紙で見せると一目でわかる）
- かげには**顔も服の色もない**。りんかくだけ（自分とかげを並べる）
- 「同じ形」でも、**のびたりちぢんだり**する：朝・夕は長い、お昼は短い。懐中電灯に近づけると大きい。お皿は上から照らすと丸、横からだと細い棒
- ふちは少しぼやけている。太陽は「点」ではなく大きさのある光だから（手を地面からはなすと、かげがぼんやりする）

## 場面の順番（説明3〜6場面）

1. つかみ：晴れた日の公園。子どもが手をふると、かげも手をふる。「かげは、どうしてじぶんとおなじかたち？」（`shadow-shape`）
2. 光はまっすぐ進む：電球から光の線が四方へまっすぐ（`shadow-light-straight`）
3. さえぎると、とどかない：箱の後ろに光がとどかない場所 → それがかげ。かげはいつも太陽の反対がわ（`shadow-block` `shadow-between`）
4. ふちをなぞる（答えの場面）：星形の紙のふちをかすめる光がかべまでとどき、かべに星のかげ。顔も色もうつらず、りんかくだけ（`shadow-outline-rays` `shadow-no-face`）
5. 形は同じでも、長さ・大きさは変わる：朝・お昼・夕方の長さ／懐中電灯に近いと大きい／お皿の上からと横から（`shadow-length-day` `shadow-size-distance` `shadow-angle-shape`）。時間があれば、朝は西・お昼は北・夕方は東へのびる（`shadow-move`）
6. ふちがぼやけるわけ：太陽は大きさのある光。手を地面に近づけるとくっきり、はなすとぼんやり（`shadow-penumbra` `shadow-blur-distance`）

予想の3択の例：「〇番．光がまっすぐ進んで、体にさえぎられたところだけ光がとどかないから」「〇番．地面が、かがみみたいに体をうつしているから」「〇番．かげが、体のまねをして動いているから」（正解は「光がまっすぐ進んで…とどかないから」。番号は cast.py に従って並べかえる）

みてみよう：晴れた日に同じ場所に立って、朝とお昼の自分のかげの長さと向きをくらべる。かげの先がどこまでのびるか、予想してから見る（`shadow-look-day`）。手を地面に近づけたり上げたりして、かげのふちを見る（`shadow-look-hand`）。

## 注意書き（必ず入れる）

- **太陽そのものは見ない**。「かげを見る」のであって太陽は見ない、を絵（太陽に×）とナレーションの両方で。国立天文台：肉眼で直接太陽を見ると、短い時間でも目をいためる
- 懐中電灯の光を人の目に向けない（実演の場面で、光は手やボールに当てる）※記事には書いていない一般的な注意なので、ナレーションでは「ひかりは めに むけないでね」程度にとどめる
- 道路のそばでかげを見るときは、車に気をつけて大人といっしょに

## 数字（記事の出典にあるものだけ）

- 東京の2005年12月22日12時（冬至のころのお昼）：太陽の高度30.7°、1mの棒のかげは1.7m（国立天文台の計算例）。「冬のお昼でも、かげは自分の背の1.7倍くらい」と言える
- 太陽の見かけの大きさ：約0.5°（シェルドン、米国光学会の会誌）。ナレーションでは数字は出さなくてよい
- お昼のかげは冬至でいちばん長く、夏至でいちばん短い（国立天文台）

## 言いかたのメモ

- 「かげは黒いものが地面にあるのではなく、光がとどいていない場所」と1回はっきり言う
- 「同じ形」＝りんかくが同じ。のびる・ちぢむは「光が来る向きから見た形になる」とまとめる（お皿の場面）
- 光が2つでかげが2つ、は確かめられる資料が見つからなかったので**入れない**（everyday-trivia の inbox.md に保留）
- 「太陽のかげは大きさが変わらない」も資料が見つからなかったので言い切らない

## 出典（概要欄用）

- 文部科学省「小学校学習指導要領（平成29年告示）解説 理科編」 https://www.mext.go.jp/content/20211020-mxt_kyoiku02-100002607_05.pdf
- Science Learning Hub（ワイカト大学／ニュージーランド教育省の教材）"Shadows: Effects of the absence of light" https://www.sciencelearn.org.nz/image_maps/77-shadows-effects-of-the-absence-of-light
- 国立天文台 暦計算室「太陽の高度，方位角および影の位置の概略値の求め方」 https://eco.mtk.nao.ac.jp/koyomi/topics/html/topics2005.html
- 国立天文台 暦計算室 暦Wiki「圭表儀」 https://eco.mtk.nao.ac.jp/koyomi/wiki/B7BDC9BDB5B7.html
- University of Kentucky "The Physics of Light -- Shadows" https://www.pa.uky.edu/sciworks/courses/light/sh3.htm
- University of Illinois, Physics Van "Umbras and Penumbras" https://van.physics.illinois.edu/ask/listing/2068
- Christopher S. Baird (West Texas A&M University) "How does diffraction make a tree's shadow blurry?" https://wtamu.edu/~cbaird/sq/2014/07/02/how-does-diffraction-make-a-trees-shadow-blurry/
- NASA Science "Why Do Eclipses Happen?" https://science.nasa.gov/eclipses/geometry/
- 国立天文台「2023年4月20日 日食（金環皆既日食）解説資料」 https://www.nao.ac.jp/contents/astro/sky/2023/04/partial-eclipse-factsheet.pdf
