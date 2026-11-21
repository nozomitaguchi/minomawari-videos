# soap-bubble（シャボンだま）動画用メモ

元記事：[シャボン玉はなぜ丸くなるのか](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/soap-bubble-round.md)（公開ページ https://nozomitaguchi.github.io/everyday-trivia/t/soap-bubble-round/ 、もののページ https://nozomitaguchi.github.io/everyday-trivia/i/soap-bubble/ ）
図はすべて `everyday-trivia/assets/figures-soap-bubble.js`（2026-11-21 作成）。図鑑の「もの」は `soap-bubble`（おうちのなか）。
となりの回：`soap`（石けんでよごれが落ちる）とは、同じ「石けんの分子」が出てくる。シャボン玉の回では、よごれ落としには入らない。

## 問い

シャボン玉は、どうして丸くなるの？
（つかみ：ほしの形の輪でふいたら、ほしの形のシャボン玉が出る？　ふいている間はぐにゃっとのびるのに、輪からはなれたとたん、まんまる）

## 見せ場

- **ほしの輪でも、まんまる**：四角・三角・三日月・星の枠でためしても、丸いシャボン玉しかできなかった（大阪市立科学館）。予想の3択にぴったり（`soap-bubble-round`、`sb-star-wand`）
- **膜はゴムのように縮みたがる**：糸をわたした輪で片がわの膜をわると、糸がぴんと引っぱられる（`sb-thread`）
- **同じ空気を包むなら、まるがいちばん小さい**：表面積くらべの棒グラフ。円すい16.09・立方体15.59・球12.56（北海道大学の資料の数。子どもには数を言わず「たまがいちばんみじかい」）（`sb-area`）
- **くっつくと平らな壁、小さいほうがおしだす**、膜は120度で出会い、泡がそろうとハチの巣のような六角形（`sb-two`、`sb-120`）

## 説明の順番（5場面）

1. 膜のつくり：うすい水の層を、石けんの分子が両がわからはさむ（頭は水がわ、しっぽは空気がわ）　図：`sb-film`
2. 表面は縮みたがる（表面張力）：表面の水の粒は中へ引っぱられる → 糸の実験　図：`sb-tension`、`sb-thread`
3. いちばん小さい面になる：さいころの枠では、まん中に小さな四角ができる膜。輪からはなれて口が閉じると、空気の量はそのままで縮む → まる　図：`sb-cube-frame`、`sb-shrink`、`sb-area`
4. だから、ほしの輪でもまる：輪の形は、膜が輪にくっついているあいだだけ　図：`sb-star-wand`、（縮む力と空気がおし返す力のつり合い `sb-balance`）
5. 2つくっつくと：同じ大きさなら壁は平ら、ちがうと小さいほうがふくらむ。120度、ハチの巣　図：`sb-two`、`sb-120`

（入れるなら短く）水だけではできない：石けんは引っぱる力を「強める」のではなく、水の約3分の1に「弱める」。水だけだとすぐかわいてわれる　図：`sb-water-only`、`sb-evaporate`
（入れるなら短く）やがてわれる：水が下へ流れて上からうすくなる。てっぺんが黒っぽく見えたら、もうすぐパチン　図：`sb-drain`、`sb-pop`

予想の3択の案：ほしの形の輪でシャボン玉をふくと、どんな形の玉が出る？（正解：まるい玉）。ほかの選択肢は「ほしの形の玉」「ほしと まるが まざった形の玉」など。cast.py の番号に合わせて並べかえる。

## 言い方の注意

- 「石けんは表面張力を強くする」は誤り（よくある誤解）。弱める。約3分の1は Exploratorium の数字
- 「まるは、いちばん かわが すくなくて すむ形」と言う。「いちばんじょうぶな形」「空気がおすから」とだけは言わない
- 膜の厚さは「数ナノメートル（水の分子数十個分）になると消える」まで（甲南大学）。「黒い膜は5.5nm」は出版元が確かめられず使わない
- ふいた直後にぷるぷるゆれてから丸になるようす、プラトーやボイズの歴史は、記事で確かめていないので話さない（絵の動きとして見せるのはよい）
- 120度は「膜が3枚出会うところ」。シャボン玉の形そのものが120度なのではない

## みてみよう と注意書き

- モールで丸・四角・星の輪を作り、どんな形の玉が出るか予想してからふく。2つがくっついたときの壁が平らか、小さいほうがふくらむかも見る　図：`sb-look`
- **注意（必ず入れる）**：石けん水は口に入れない。ストローは吸わずにふく。人の顔に向けてふかない。目に入ったら、こすらずに水道の水でよく洗う。部屋の中では床に跡がつくので、庭など外で遊ぶ（伊勢崎市）

## 出典（概要欄用）

- Exploratorium（Ron Hipschman）「The Shape of Bubbles」https://annex.exploratorium.edu/ronh/bubbles/shape_of_bubbles.html
- Exploratorium「Soap」https://annex.exploratorium.edu/ronh/bubbles/soap.html
- Exploratorium「Bubble Meets Bubble」https://annex.exploratorium.edu/ronh/bubbles/bubble_meets_bubble.html
- Exploratorium「Bubble Colors」https://annex.exploratorium.edu/ronh/bubbles/bubble_colors.html
- イリノイ大学 Physics Van「Bubble Shapes」https://van.physics.illinois.edu/ask/listing/2222
- バージニア工科大学「Bubble Physics: Properties of Bubbles」https://www1.phys.vt.edu/bubble/properties-of-bubbles.html
- 北海道大学 数学博物館「シャボン玉の形」https://www.math.sci.hokudai.ac.jp/museum/doc/wente.pdf
- 小野昌弘「ふわふわキラキラ！シャボン玉大実験」（大阪市立科学館研究報告29、2019年）https://www.sci-museum.jp/wp-content/themes/scimuseum2021/pdf/study/research/2019/pb29_103-110.pdf
- 甲南大学 村上良「最強のシャボン玉づくりに挑戦しよう」https://www.konan-u.ac.jp/news/wp/wp-content/uploads/2023/05/faculty-of-science-and-engineering/1a03dca95a1c71f48f8e6a7620bd9fa6.pdf
- 伊勢崎市「シャボン玉液を作って遊ぼう（家庭用）」https://www.city.isesaki.lg.jp/material/files/group/79/12soapbubbles.pdf
