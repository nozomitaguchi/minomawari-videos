# supermarket-egg-chick（スーパーのたまご）動画用メモ

元記事：[スーパーのたまごを温めたら、ひよこは生まれるのか](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/egg-supermarket-chick.md)（2026-11-23 作成）
サイト：https://nozomitaguchi.github.io/everyday-trivia/i/egg/
図：`everyday-trivia/assets/figures-egg.js`（名前はすべて `eg-` ではじまる。いちばん上の絵は `egg-supermarket-chick`）
色の約束：黄身＝黄、胚（白い点）＝白、おんどり＝赤いとさか・緑のしっぽ、受精の場所＝赤い点線の丸、温める＝オレンジ・温度計の赤

## 問い

スーパーのたまごを温めたら、ひよこは生まれる？
答えの軸：**ほとんど生まれない。めんどりは、おんどりがいなくても たまごを産む（1日に約1個）。スーパーのたまごは、めんどりだけの農場で産まれた「受精していないたまご（むせいらん）」がほとんど。ひよこになるたまご（しゅらん）は、おんどりとめんどりをいっしょに飼う別の農場で産まれ、ふ化場で21日間・約37度で温められる。受精はたまごの殻ができる前、めんどりの体の中の入り口で起きる。だから、あとから温めても、むせいらんは育たない。**

## 見せ場

- つかみの「ふしぎ」：パックのたまごを あたためる → 「ひよこ？」（`egg-supermarket-chick`）
- 予想の3択の例：「スーパーの たまごを あたためたら どうなる？」（1. 21にちで ひよこが うまれる／2. ほとんど うまれない／3. れいぞうこから だせば すぐ うまれる）。正解の番号は cast.py に従って入れかえる。または「めんどりは、おんどりが いないと たまごを うめる？」（うめない／うめる／たまに うめる）でもよい
- いちばんの見せ場：めんどりは、おんどりがいなくても たまごを産む（`eg-hen-alone`）。1週間のカレンダーで「1にち だいたい 1こ、うまない ひも ある」（`eg-one-a-day`）
- 農場の流れ：しゅけいの のうじょう（おんどり＋めんどり）→ ふかじょう（21にち・37ど）→ そだてる のうじょう → せいけいの のうじょう（めんどりだけ）→ スーパーへ（`eg-farm-flow`、`eg-breeder-farm`）
- 受精はたまごが「黄身だけ」のとき、卵管の入り口で。白身・殻はそのあと（`eg-fertilize-where`、`eg-oviduct`）
- 黄身の上の白い点「胚」はむせいらんにもある。むせいらんは ぎざぎざの まっしろな点、受精したたまごは うすい わっか（`eg-germ-spot`、`eg-disc-compare`）。見え方はたまごごとにちがう、と添える
- 温めて10日ほどで光を当てると、むせいらんは明るくすけ、育っているたまごは暗い（`eg-candle`）
- 「有精卵」と書いたたまご：めす20羽に おす1羽以上。全部が受精しているとはかぎらない（`eg-label-ratio`）。入れるなら説明の最後に短く

## 場面の順番（説明は5場面）

1. めんどりは、おんどりがいなくても たまごを産む。1日に約1個、1年で300個ほど（`eg-hen-alone`、`eg-one-a-day`）
2. 1個のたまごは、体の中で黄身 → 白身 → 膜 → 殻の順に、25〜26時間ほどでできる（`eg-oviduct`）。受精するなら、いちばん最初の入り口で（`eg-fertilize-where`）
3. スーパーのたまごは、めんどりだけの農場のもの。ひよこになるたまご（しゅらん）は、おんどりもいる別の農場で産まれ、ふ化場で21日・約37度、向きをかえながら温める（`eg-farm-flow`、`eg-breeder-farm`、`eg-incubate`）
4. 黄身の上の白い点「胚」。むせいらんにもあるが、形がちがう（`eg-germ-spot`、`eg-disc-compare`）。黄身のはしの白いひも「カラザ」は胚ではない（`eg-chalaza`）
5. 温めても、むせいらんは中で育つものがない（`eg-candle`、`eg-store-eggs`）。「有精卵」でも全部とはかぎらない（`eg-label-ratio`）

みてみよう：大人がたまごを割ったら、黄身のてっぺんの小さな白い点を見る。ぎざぎざの点か、わっかか。黄身のはしの白いひも（カラザ）と見くらべて、どれが「胚」か予想する（`eg-look-spot`）。

## 注意書き・言いかたの注意

- **たまごを割るのは大人。生のたまごをさわったら手をあらう。たまごを温めてためさない（暑い所ではすぐ悪くなる）。ひよこが生まれるところは本や動画、動物園や学校で見る**（`eg-look-safe`）。「みてみよう」で必ず言う
- 「スーパーのたまごは ぜったいに生まれない」とは言わない。記事は「ほとんど」（農林水産省）。有精卵の表示のあるたまごもあるので「ほとんど」で統一
- 有精卵を温めたら生まれるか、は言わない（記事は保存温度で育ちが止まる・日数がたつとふ化しにくい、まで。家で試させない）
- 白い点の見分けは「見え方はたまごごとにちがう」と添える。「これで必ずわかる」と言わない
- 「生理的ゼロ点」「賞味期限」「保存日数」は動画では入れなくてよい
- 吹き出しの例：おとうと「あたためたら ひよこ でるかな？」（つかみ）／おねえちゃん「おんどり いなくても うむの！？」（場面1）／カメレオン（ルーペで黄身の白い点をのぞく）／おねえちゃん「ぎざぎざ だった！」（みてみよう）

## 出典（概要欄用）

- 農林水産省「新鮮なたまごを届けてくれるニワトリ」（aff 2024年4月号） https://www.maff.go.jp/j/pr/aff/2404/spe1_03.html
- 農林水産省「疑問解消！ たまごのヒミツQ&A」（aff 2024年4月号） https://www.maff.go.jp/j/pr/aff/2404/spe1_01.html
- 鶏卵公正取引協議会「鶏卵の表示に関する公正競争規約及び施行規則」 https://www.jfftc.org/kiyaku/pdf/c12_H_egg.pdf
- ケンタッキー大学 Jacob J.「Avian Reproductive System — Female」 https://poultry.extension.org/articles/poultry-anatomy/avian-reproductive-female/
- Australian Eggs「How does a rooster fertilize an egg?」 https://australianeggs.org.au/questions/how-does-a-rooster-fertilize-an-egg
- オクラホマ州立大学「Artificial Incubation」 https://extension.okstate.edu/fact-sheets/artificial-incubation
- アルバータ州農業省「Hatching Egg Breakout: Is it Fertile?」 https://www1.agric.gov.ab.ca/$department/deptdocs.nsf/ba3468a2a8681f69872569d60073fde1/467a4357eef48d5d87256b9d005f8e68!OpenDocument
- Pas Reform「Establishing true fertility in hatching eggs」 https://www.pasreform.com/en/knowledge/44/establishing-true-fertility-in-hatching-eggs
- メリーランド大学「Hatching Eggs at Home」 https://extension.umd.edu/resource/hatching-eggs-home-fs-1114
