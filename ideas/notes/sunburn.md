# sunburn（日焼け）動画用メモ

元記事：[外で遊ぶと、どうして肌が黒く日焼けするのか…](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/sunburn-tan.md)（2026-11-29 作成）
サイト：https://nozomitaguchi.github.io/everyday-trivia/t/sunburn-tan/
図：`everyday-trivia/assets/figures-sunburn.js`（名前は `hy-` ではじまる。いちばん上の絵は `sunburn-tan`）
色の約束：しがいせん＝むらさきの ギザギザ、メラニン＝こげちゃの つぶ、ひょうひ＝うすい はだいろ、しんぴ＝うすい もも、かく（いでんし）＝あお、ちの くだ＝あか、あいず＝きいろの つぶ

## 問い

外で遊ぶと、どうして肌が黒く日焼けするの？
答えの軸：**おひさまの光には、目に見えない「しがいせん」がまざっている。しがいせん（とくに UV-B）は、ひふの細胞の中の大事な設計図（DNA）に傷をつける。すると、ひふのいちばん外の層（表皮）のいちばん下にいる「いろの さいぼう（メラノサイト）」が、メラニンという ちゃいろい つぶを どんどん作って、まわりの細胞に くばる。メラニンをもらった細胞は、つぶを核の上に ぼうしの ように のせて、しがいせんを すいこみ、設計図を守る。だから日焼けで肌が黒くなる。日焼けは「げんきの しるし」ではなく、ひふが自分を守ろうとしている しるし。**

## 見せ場

- 予想の3択の例：「ひやけで はだが くろく なるのは なぜ？」（おひさまの ひかりで ひふが こげるから／ひふが ちゃいろい つぶで ひがさを つくるから／よごれが つくから）。正解は「ちゃいろい つぶで ひがさを つくるから」。正解の番号は cast.py に従う
- **メラニンの ぼうし**（`hy-cap`）：しがいせんが ギザギザで ふってくる → ぼうし なしの細胞は かくに ×、ぼうしの ある細胞は ぼうしが すいこむ。ここが一番の見せ場。メラニンの つぶが かくの上に集まって ぼうしになるアニメにする
- **いろの さいぼうが くばる**（`hy-melanocyte` → `hy-transfer`）：表皮の いちばん下で、うでを のばした いろの さいぼうが、ふくろに入れた メラニンを まわりの細胞に手わたし。「1つで まわりの やく36こと くみ」は字幕か図だけでよい
- **あかい → くろい の順番**（`hy-three-kinds`、`hy-timeline`）：あかく ひりひり するのは すうじかん あと（8〜24じかんで いちばん）、あかみが きえた すうにち あとから くろっぽく、すうしゅうかん〜すうかげつ つづく。「あそんだ日には まだ黒くない」が2つめの「へぇ」
- **くもりでも、ひかげでも とどく**（`hy-clouds`、`hy-shade`、`hy-reflect`）：くもりでも はれの やく6わり、ひかげでも ひなたの やく半分、しんせつは 80% はねかえす
- **そでの あと**（`sunburn-tan`、`hy-look`）：そでの なかと そとの いろの ちがいを、入口とみてみように使う

## 場面の順番（説明は5場面）

1. 夏に外で遊んだ子の うでが、何日かたって くろっぽい。そでの なかは もとの いろ（`sunburn-tan`）。おひさまの ひかりには、目に見えない しがいせんが 3しゅるい。地面まで とどくのは UV-B と UV-A（`hy-uv-kinds`）。UV-B は ひふの うえの そう（表皮）で とまり、UV-A は もっと おくまで（`hy-uv-depth`）
2. UV-B は ひふの さいぼうの かくの中の 設計図に きずを つける（`hy-dna`）。きずの ついた細胞が「メラニンを ふやして」と あいずを出す（`hy-signal`）
3. 表皮の いちばん下の いろの さいぼうが、メラニンを どんどん作って、ふくろに入れて まわりに くばる（`hy-melanocyte`、`hy-transfer`）
4. もらった細胞は、メラニンを かくの上に ぼうしの ように のせて、しがいせんを すいこむ（`hy-cap`）。だから はだが くろっぽく なる。あかく ひりひりは すうじかん あと、くろく なるのは すうにち あと（`hy-timeline`）
5. 日焼けは げんきの しるしではなく、ひふを まもろうとする しるし（`hy-not-healthy`）。くもりでも ひかげでも しがいせんは くる（`hy-clouds`、`hy-shade`）。ぼうし（つば7センチで やく6わり カット）と えりつき・ながそで（`hy-hat`）

みてみよう：夏の おわりに、Tシャツの そでを すこし めくって、そでの なかと そとの うでの いろを くらべる（`hy-look`）。くつしたの あとも見る。

## 注意書き・言いかたの注意

- **おひさまを ちょくせつ 見ない。日焼けを ためすために ひなたに ながく いない**。動画の「みてみよう」で必ず言う
- 予防は「ぼうし・ひかげ・ふく」を中心に。日焼け止めを言うなら「おうちの ひとと いっしょに ぬろう」（塗り直しは環境省で2、3時間おき、元記事には書いていないので言うなら字幕だけにせず元記事に足してから）
- 「日焼けは健康的」とは言わない（環境省マニュアルで「間違い」）。ただ、こわがらせない：「すこしの おひさまで ビタミンDも できるよ」（`hy-vitamin-d`、7月のつくばの正午なら顔と手の甲で3.5分）。長く日なたにいる必要はない、まで
- 皮ふがんの話はしない（子ども向け動画の範囲外。元記事にも書いていない）
- 「メラニンが こげる」「ひふが こげる」とは言わない。黒く見えるのは メラニンが ふえるから
- 「日焼けが さめるのは ひふが 入れかわるから」とは言わない（一次資料で確かめていない。inbox.md）。「黒いのは すうしゅうかんから すうかげつ つづく」まで
- 「くろく なる ひと・あかく なる ひと」（`hy-types`）は、肌の色のちがいを良い・悪いで言わない。時間が足りなければ省く
- 数字は図と字幕だけで十分：UV-A の波長、90〜95%、36こ、8〜24じかん、反射率。ナレーションは「やく6わり」「はんぶん」くらいにする
- 吹き出しの例：おとうと「あれ？ うでが ちゃいろ！」／おねえちゃん「そでの なかは しろいよ」／カメレオン（ルーペで メラニンの ぼうしを のぞく）

## 出典

- 環境省「紫外線環境保健マニュアル2020」（2020年3月改訂）https://www.env.go.jp/content/900410651.pdf
- D'Orazio J ほか「UV Radiation and the Skin」Int J Mol Sci 14(6): 12222–12248（2013）https://pmc.ncbi.nlm.nih.gov/articles/PMC3709783/
- Williams R「Tanning with p53」J Cell Biol 177(1): 5b（2007）https://rupress.org/jcb/article/177/1/5b/34575/Tanning-with-p53
- Casalou C ほか「Loss of 'Epidermal Melanin Unit' Integrity in Human Skin During Melanoma-Genesis」Front Oncol（2022）https://www.frontiersin.org/journals/oncology/articles/10.3389/fonc.2022.878336/full
- Lan Y ほか「Opsin 3 mediates UVA-induced keratinocyte supranuclear melanin cap formation」Commun Biol 6: 238（2023）https://www.nature.com/articles/s42003-023-04621-8
- Sklar LR ほか「Effects of ultraviolet radiation, visible light, and infrared radiation on erythema and pigmentation: a review」Photochem Photobiol Sci（2013）https://pubs.rsc.org/en/content/articlehtml/2013/pp/c2pp25152c
- MedlinePlus「Tanning」https://medlineplus.gov/tanning.html
- 国立環境研究所 地球環境研究センター（Miyauchi ほか J Nutr Sci Vitaminol 59: 257–263, 2013）https://cger.nies.go.jp/ja/about/results/2013/13030.html
- 気象庁「雲と紫外線」https://www.jma.go.jp/jma/kishou/know/env/uvhp/3-73uvindex_mini.html
- 気象庁「紫外線の性質」https://www.jma.go.jp/jma/kishou/know/env/uvhp/3-70uvindex_mini.html
- 日本臨床皮膚科医会・日本小児皮膚科学会「学校生活における紫外線対策に関する統一見解」（2025年5月）https://jspd.umin.jp/pdf/school_shishin.pdf
