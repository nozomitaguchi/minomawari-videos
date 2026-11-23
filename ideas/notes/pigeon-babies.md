# pigeon-babies：公園にハトはあんなにいるのに、赤ちゃんはどこにいるの？

元記事：https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/bird-pigeon-babies.md
（サイト：https://nozomitaguchi.github.io/everyday-trivia/i/bird/#t-bird-pigeon-babies 、図は `assets/figures-pigeon.js`）

## 問い

公園や駅前には、ハトが何羽も歩いている。でも、ふわふわの小さな「赤ちゃんのハト」は見たことがない。赤ちゃんは、どこにいるの？

## 答え（ひとことで）

赤ちゃんは、雨のかからない建物のすき間や橋の下の巣の中で、1か月ほど親からごはんをもらって育つ。巣を出るころには、もう親と同じ大きさで、羽も大人と同じ。だから公園で見ても、赤ちゃんだとわからない。

## 見せ場

- **巣は、地面からは見えにくい「雨のかからないすき間」**。ビルのでっぱりの下、橋の下、ベランダの室外機の下や裏、建物の穴やすき間（仙台市・農林水産省・堺市・京都市動物園）。もとはがけの岩だなに巣をつくる鳥（カワラバト）だった。「公園の地面」から「見上げた建物のすき間」へカメラを上げる場面が、いちばんの「へぇ」。
- **オスが枝を1本ずつ運び、メスが座って組む**。卵はふつう2つ。オスは朝のなかごろ〜夕方、メスは夕方〜夜〜次の朝、交代であたためる（約18日）。
- **親ののどから出る「ピジョンミルク」**。のどの下の「そのう」の内側からミルクのような液が出て、口うつしであげる。オスもメスも出せる（鳥でミルク！ がおどろきどころ）。
- **巣を出るころには、親と同じ大きさ**（巣の中に25〜32日）。並べると見分けがつかない。でも、よく見ると若いハトは目が黒っぽく、くちばしのつけ根の白いこぶが小さくピンクっぽい、首があまり光らない。

## 3〜6場面で説明する順番

1. つかみ：公園の地面にハトがたくさん。赤ちゃんはいない？（図 `bird-pigeon-babies`）。町のハトはもとは がけにすむカワラバト（`pb-origin`、`pb-cliff-building`）
2. 巣はどこ？：雨のかからないすき間（`pb-nest-sites`）。オスが枝を1本ずつ運び、メスが組む皿の形の巣（`pb-twig-relay`）。同じ巣を何度も使い、だんだん盛り上がる（`pb-nest-mound`、入れなくてもよい）
3. 卵と交代：卵はふつう2つ・白い（`pb-eggs`）、オスとメスが時間を分けてあたためる（`pb-shift`）
4. 赤ちゃんのごはん：生まれたては目が見えずうぶ毛がまばら（`pb-hatchling`）→ のどの「そのう」から出るミルクを口うつし（`pb-crop-milk`）→ 3日目まではミルクだけ、だんだん穀物のつぶに（`pb-milk-to-grain`）
5. 巣を出るとき：卵18日＋巣の中25〜32日＝約1か月半、ずっと巣の中（`pb-timeline`）→ 巣を出るころには親と同じ大きさ（`pb-same-size`）
6. 正解と「みてみよう」：若いハトの見分け方（`pb-juvenile-vs-adult`）、子育ては1年中（春〜夏にさかん、`pb-year-round`）。はなれたところから目の色とこぶを見くらべる（`pb-look-eyes`）、雨のかからないすき間を見上げる（`pb-look-ledge`）。巣はそっとしておく（`pb-law`）

## 予想の3択の案

「ハトの赤ちゃんは、どこにいるの？」
- 建物のすき間や橋の下の巣の中（正解）
- 公園の木の上の巣の中
- 地面にほった穴の中
（正解の番号は cast.py に従う。木の上は「ドバトは木にはつくらない」とは言わない。記事の資料は建物・橋・がけのすき間だけ、という範囲で「正解は建物のすき間」と見せる）

## 注意書き（動画に入れる）

- **ハトに近づかない・追いかけない・エサをあげない**（仙台市・堺市がエサやりをやめるよう呼びかけている）。
- **巣を見つけても、さわらない・のぞきこまない、そっとはなれる**。巣・卵・ヒナは法律（鳥獣保護管理法）で守られていて、許可なく取ったり動かしたりできない（大人向けの説明として。子どもには「さわらないでね」でよい）。
- 橋の下・ベランダなどを見上げるときは大人といっしょに。ベランダの手すりから身を乗り出さない。

## 言ってよいこと・言わないこと

- 数字は記事にあるものだけ：卵はふつう2個（1〜3個のことも）、あたためる日数16〜19日（コーネルは18日、堺市は約16〜18日）、巣の中25〜32日（堺市は約30日）、巣の直径40センチくらい、ミルクだけは3日目まで、子育ては1年に1〜6回、巣立ったヒナも約6か月で子育てできる、日本には奈良時代に。
- 「卵から巣立ちまで約1か月半」は 18日＋25〜32日 の足し算として言う。
- 「ドバトは木に巣をつくらない」「巣立ったあと何日エサをもらう」は確かめていないので言わない。ヒナの体重も出さない。
- ピジョンミルクの成分（たんぱく質約64％・脂肪30％、乾かした重さで）は飼育ハトの研究のまとめ。子ども向けには「えいようたっぷり」までで十分。
- 若いハトの見分けは「よく見ると、ちがうことがある」。アメリカ地質調査所は「大人と若い鳥は似ている」としているので、「かならず見分けられる」とは言わない。

## 出典（概要欄用）

- コーネル大学鳥類学研究所「Rock Pigeon Life History」 https://blog.allaboutbirds.org/guide/Rock_Pigeon/lifehistory
- オーデュボン協会「Rock Pigeon」 https://www.audubon.org/field-guide/bird/rock-pigeon
- BirdNote「Why Do We Never See Baby Pigeons?」（2013年） https://www.audubon.org/magazine/why-do-we-never-see-baby-pigeons
- 仙台市「ドバト対策について」 https://www.city.sendai.jp/kankyochose/kurashi/shizen/petto/yase/higai/dobato.html
- 農林水産省 ハト類の被害対策資料 https://www.maff.go.jp/j/seisan/tyozyu/higai/manyuaru/pdf/r5_tyourui_2_7.pdf
- 堺市「カワラバト（ドバト）でお困りの方へ」 https://www.city.sakai.lg.jp/kurashi/gomi/kankyo_hozen/yaseichoju/komaru/dobato.html
- 京都市動物園 巣の特徴の資料 https://zoo.city.kyoto.lg.jp/zoo/uploads/image/4bd3666026df0c651bfcf9cef96f6251.pdf
- 岡山県鳥獣保護センター「ドバト」 https://ikedazoo.jp/wp-content/themes/ikedazoo/pdf/hatonoesa.pdf
- Wang ほか（2023）Life 13(9): 1866 https://doi.org/10.3390/life13091866
- Higgins・Davies 編『Handbook of Australian, New Zealand & Antarctic Birds』第3巻（1996年） https://www.nzbirdsonline.org.nz/assets/95597/1691914350-273_rock-20pigeon.pdf
- アメリカ地質調査所「Rock dove」 https://www.mbr-pwrc.usgs.gov/id/framlst/Idtips/h3131id.html
