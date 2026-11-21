# white-breath-steam（湯気と白い息）動画用メモ

元記事：[寒いとき、湯気や白い息が見えるのはなぜか…](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/steam-white-breath.md)（2026-11-22 作成）
サイト：https://nozomitaguchi.github.io/everyday-trivia/i/steam/
図：`everyday-trivia/assets/figures-steam.js`（名前は `st-` ではじまる。いちばん上の絵は `steam-white-breath`）
色の約束：すいじょうき（見えない気体）＝みずいろの小さな輪、みずの つぶ＝あおの丸、白い湯気・息＝しろいもや（灰色のふち）、あたたかい＝オレンジ、つめたい＝あお

## 問い

寒いとき、湯気や白い息が見えるのはなぜ？
答えの軸：**白いのは水蒸気（見えない気体）ではなく、水蒸気が冷えてできたとても小さな水のつぶ。空の雲と同じもの。空気がもてる水蒸気の量は温度で決まっていて、冷たい空気は少ししかもてない。あたたかくしめった息が冷たい空気とまざると、もちきれなくなった水蒸気が水のつぶになって白く見える。まわりのかわいた空気にまざると、つぶはまた水蒸気にもどって消える。**

## 見せ場

- 予想の3択の例：「しろい ゆげの しょうたいは なに？」（けむり／ちいさな みずの つぶ／みえない すいじょうき → 正解は ちいさな みずの つぶ）。「すいじょうき」を選ばせる罠がいちばん面白い。正解の番号は cast.py に従う
- **やかんの口のすぐ上は透明**：口から少しはなれたところから急に白くなる。ルーペで寄ると、透明な所には みずいろの輪（すいじょうき）、白い所には あおい丸（みずの つぶ）（`st-kettle-gap`、`st-vapor-droplet`）
- 光の当たり方：すいじょうきは光がまっすぐ通りぬける、みずの つぶは光をあちこちへはね返して白く見える（`st-light`）
- 棒グラフがのびる：0度・10度・20度・30度の空気がもてる水蒸気（4.85・9.4・17.3・30.4グラム）。あたたかいほど急にふえる（`st-capacity`）
- 香港天文台の「曲線と直線」：息（あたたかく、ほとんどいっぱい）とまわりの冷たい空気を結ぶまっすぐな線のまん中が、曲線より上に出る → そこが雲（白）になる（`st-mixing-curve`）。動画では線を引くアニメにして、はみ出た所が白くもくもくする
- 白い息が、すぐ消える：もやがうすくなり、あおい丸がみずいろの輪にもどっていく（`st-fade`）

## 場面の順番（説明は5場面）

1. 白いものの正体は「すいじょうき」ではない。すいじょうきは見えない気体、白いのは小さな水のつぶ（`steam-white-breath`、`st-vapor-droplet`）。見えない・見えるのちがいは、光をはね返すかどうか（`st-light`）
2. やかんの口のすぐ上は透明。そこはまだ冷えていないすいじょうき。少しはなれて冷えたところから白くなる（`st-kettle-gap`）
3. 空気がもてるすいじょうきの量は温度で決まる。冷たい空気は少ししかもてない（`st-capacity`）。だから冷やされると水のつぶが出てくる。空の雲も、冷たいコップのまわりの水も同じしくみ（`st-cloud-same`、`st-cold-cup`）
4. 白い息：肺の中はしっとりしていて、息はあたたかく水蒸気がいっぱい（`st-breath-moist`）。冷たい空気とまざると、もちきれなくなって白くなる（`st-mixing-curve`）。冬の朝は湯気も息もよく見え、夏の暑い昼はあまり見えない（`st-winter-summer`）
5. すぐ消えるのは、まわりのかわいた空気にまざって、つぶがまたすいじょうきにもどるから（`st-fade`）

みてみよう：寒い朝、外と部屋の中で「はー」と息をはいて、どちらで白くなるか予想してからくらべる（`st-look-breath`）。大人がわかしたやかんを、はなれたところから見て、口のすぐ上の透明なすきまを探す（`st-look-kettle`）。

## 注意書き・言いかたの注意

- **湯気の出口はとても熱い。手や顔を近づけない、さわらない。お湯をわかすのも、ふたを開けるのも大人**。動画の「みてみよう」で必ず言う（`st-hot-caution`）。国民生活センター：炊飯器・ポット・ケトル・スチーム式加湿器の蒸気で0〜5歳のやけど事故、数秒ふれただけでやけどのおそれ
- 「湯気は水蒸気」と言わない（いちばんの誤解）。ナレーションでは「すいじょうきは めに みえない。しろいのは ちいさな みずの つぶ」とはっきり言う
- 白い息に「口のすぐ前の透明なすきま」があるとは言わない（確かめられていない。透明なすきまは、やかんの話だけ）
- 「何度より寒いと白くなる」という数字は言わない（資料がない）。「さむいほど、しめっているほど」くらいにする。香港天文台は「しめり気が足りないと雲はできない」と説明
- 息の温度や湿度の数字は言わない（確かめられなかった）。「あたたかく、ほとんど いっぱい」まで
- グラフの数字（4.85・9.4・17.3・30.4グラム）は字幕だけにしてもよい。ナレーションは「あたたかい くうきは、つめたい くうきより、ずっと たくさん もてる」
- 吹き出しの例：おとうと「はー！ しろい！」／おねえちゃん「くちの すぐ うえは とうめいだよ」（やかんを遠くから見ながら）／カメレオン（ルーペで湯気をのぞくと、あおい つぶ）

## 出典

- 岳川有紀子「湯気と水蒸気の認識」大阪市立科学館研究報告 20号（2010）https://www.sci-museum.jp/wp-content/themes/scimuseum2021/pdf/study/research/2010/pb20_129-132.pdf
- 岳川有紀子「サイエンスショー「水の科学」実施報告」大阪市立科学館研究報告 25号（2015）https://www.sci-museum.jp/wp-content/themes/scimuseum2021/pdf/study/research/2015/pb25_077-080.pdf
- 仙台管区気象台 教材「雲ができる仕組み」https://www.data.jma.go.jp/sendai/knowledge/kyouiku/yoho/kumo.pdf
- 気象庁「はれるんランド」どうやって雲ができるの？ https://www.jma.go.jp/jma/kids/kids/faq/a1_12.html
- NSTA Science and Children 2020年1月号「Why can I see my breath on cold days?」https://www.nsta.org/science-and-children/science-and-children-january-2020/q-why-can-i-see-my-breath-cold-days
- デルフト工科大学 ShowingPhysics「Can it be air?」https://interactivetextbooks.tudelft.nl/showthephysics/demos/demo09/demo09.html
- ウェストテキサスA&M大学 Baird（2013）https://www.wtamu.edu/~cbaird/sq/2013/12/13/how-can-there-be-clouds-in-winter-when-it-is-too-cold-for-water-to-stay-a-vapor/
- Scientific American（ミシガン大学 Merte 名誉教授）https://www.scientificamerican.com/article/how-does-bathwater-give-off-steam/
- HyperPhysics（ジョージア州立大学）https://www.hyperphysics.gsu.edu/hbase/Kinetic/watvap.html
- イリノイ大学 Physics Van「Seeing Your Breath」https://van.physics.illinois.edu/ask/listing/738
- 香港天文台「Mixing Cloud in Winter」https://www.hko.gov.hk/en/education/edu06nature/ele_mixing.htm
- カンザス州立大学 Weather Data Library（2017年10月）https://secondary.climate.ksu.edu/news/stories/2017/10/ww_oct_18
- アメリカ国立気象局 訓練資料「How do clouds dissipate?」https://www.weather.gov/source/zhu/ZHU_Training_Page/clouds/clouds_dissipation/cloud_dissipation.htm
- イギリス気象庁 Met Office「What is fog?」https://weather.metoffice.gov.uk/learn-about/weather/types-of-weather/fog
- 国民生活センター「家電から出る蒸気による乳幼児のやけどにご注意！」（2021年）https://www.kokusen.go.jp/news/data/n-20210902_3.html
