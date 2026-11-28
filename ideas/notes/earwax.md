# earwax（耳あか）動画用メモ

元記事：[耳の中には、どうして耳あかがたまるのか…](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/ear-earwax.md)（2026-11-29 作成）
サイト：https://nozomitaguchi.github.io/everyday-trivia/t/ear-earwax/
図：`everyday-trivia/assets/figures-earwax.js`（名前は `ew-` ではじまる。いちばん上の絵は `ear-earwax`）
色の約束：なんこつの ところ＝うすい はだいろ、ほねの ところ＝クリーム、ひふ＝はだいろ、こまく＝あおはいいろ、みみあか＝きいろがかった ちゃいろ（ベタベタは こい ちゃいろ）、あぶらの せん＝きいろ、あせの せんの なかま＝だいだい、インク＝あお

## 問い

耳の中には、どうして耳あかがたまるの？
答えの軸：**耳あかを作る「せん」は、耳の穴の入り口に近い3分の1にしかない。そこから出るあぶらに、はがれた古い皮ふ（重さの約6割）とほこりがまざったものが耳あか。そして耳の穴の皮ふは、ほかの皮ふのように上へはがれるのではなく、鼓膜のまん中から耳の外へ向かって、ベルトコンベアのように少しずつ動いている（つめがのびるくらいの速さ）。皮ふが耳あかをのせて入り口まで運ぶので、耳あかは入り口に「たまって」見え、乾いてぽろっと落ちる。だから耳は自分でそうじできていて、奥までそうじしなくていい。**

## 見せ場

- 予想の3択の例：「みみあかは、どうして いりぐちに たまるの？」（みみの おくから かぜで とばされて くるから／みみの なかの ひふが、みみあかを のせて そとへ うごくから／みみの いりぐちから ほこりが はいって くるだけ だから）。正解は「ひふが のせて そとへ うごく」。正解の番号は cast.py に従う
- **インクの てん**：こまくに インクの てんを つけると、てんが まんなかから スポークの ように そとへ ひろがり、ひが たつと いりぐちへ うごいて いく（`ew-ink-dot`）。ここが一番の見せ場。点が少しずつ動くアニメにする
- **ふつうの ひふは うえへ、みみの ひふは そとへ**（`ew-skin-compare`）。ベルトコンベアに みみあかが のって はこばれる
- **つめと おなじ はやさ**：つめが のびるのと だいたい おなじ。1しゅうかんで やく 1ミリ（`ew-speed`）
- **みみあかの レシピ**：ふるい ひふ ＋ あぶら ＋ ほこり ＝ みみあか（`ew-mix`）。せんは いりぐちがわの 3ぶんの1 だけ（`ew-glands`）
- **カサカサと ベタベタ**：にほんでは 10にんに 7〜8にんが カサカサ。おやから もらう いでんしの 1もじで きまる（`ew-types`、`ew-gene`）。どちらでも だいじょうぶ

## 場面の順番（説明は5場面）

1. みみの あなを のぞくと、いりぐちに みみあか。おくには たまって いない（`ear-earwax`）。みみの あなは おとなで やく 2.5センチ、いちばん おくに こまく（`ew-canal`）
2. みみあかを つくる せんは いりぐちがわ だけ。あぶら ＋ ふるい ひふ ＋ ほこり ＝ みみあか（`ew-glands`、`ew-mix`）
3. こまくに インクの てん → そとへ うごく。みみの ひふは そとへ すべる ベルトコンベア（`ew-ink-dot`、`ew-skin-compare`）。はやさは つめが のびる くらい（`ew-speed`）
4. いりぐちまで はこばれた みみあかは、かわいて ぽろっ。もぐもぐ・おはなしの あごの うごきも てつだう と いわれて いる（`ew-jaw`）。みみあかは ばいきん・カビ・むし（にがい！）・ほこりから みみを まもる（`ew-roles`）
5. カサカサと ベタベタ。にほんでは カサカサが おおい。いでんしの 1もじで きまる（`ew-types`、`ew-gene`、`ew-world`）

みてみよう：おふろあがりに、おとなに みみの いりぐちを のぞいて もらい、カサカサか ベタベタか みる。かぞくと くらべる（`ew-look`）。みるのは いりぐち だけ。

## 注意書き・言いかたの注意

- **みみの あなに ぼうや ゆびを いれない。おくまで いじると みみあかを おしこんで ふさがる**（`ew-push`）。動画の「みてみよう」とおわりで必ず言う
- **みみそうじは おとなが、いりぐちの みえる ところを そっと ふく くらいで いい。めんぼうや みみかきは ちいさな こが とどかない ところに**（`ew-safe`。学会・消費者庁）。東京では 5ねんで 200にん いじょうが みみそうじの けがで きゅうきゅうしゃに、4さい いかが いちばん おおい（`ew-accident`）— こわがらせないよう、言うなら図と字幕だけでもよい
- 「みみそうじは いらない」と言いきらない。言えるのは「みみは じぶんで そとへ はこぶので、むりに とらなくて いい」「きに なったら みみの おいしゃさんへ」まで
- **あごの うごきが みみあかを はこぶ**は、資料に「助ける」とあるだけで測った研究は見つかっていない。「てつだう と いわれて いる」にとどめ、主役は ひふの うごき にする
- 速さの数字は「つめが のびる くらい」（モザファリさんら）と「1にちに やく 0.14ミリ（外耳道の平均 144.75μm、プレパゲランさんら）→ 1しゅうかんで やく 1ミリ（計算）」。こまくの上の速さは言わない（確かめられていない）
- 「みみあかに リゾチームが あって ばいきんを やっつける」とは言わない（確かめていない）。言えるのは「ばいきんや カビが ふえるのを ふせぐ」「にがくて むしが はいるのを ふせぐ」（日本耳鼻咽喉科頭頸部外科学会）
- カサカサの割合は「にほんでは 7〜8わり」（学会・JST）、「ひがしアジア 80〜95％、ヨーロッパ・アフリカ 0〜3％」（佐藤さんら 2009年）。湿性の割合の別の数字（約15％）もあるので、ほかの数字は足さない
- 子どもの耳の穴の長さは資料がないので言わない（25ミリは大人）
- 吹き出しの例：おとうと「みみあか、どこから くるの？」／おねえちゃん「いりぐちに しか ないね！」／カメレオン（ルーペで いりぐちの カサカサの みみあかを のぞく）

## 出典

- 日本耳鼻咽喉科頭頸部外科学会「耳垢」（2022）https://www.jibika.or.jp/modules/disease_kids/index.php?content_id=2
- 日本耳鼻咽喉科頭頸部外科学会「耳垢をほっておくと、認知症のリスクを高める!?」（2019）https://www.jibika.or.jp/owned/hwel/news/012/
- Mozaffari, Nash, Tucker「Anatomy and Development of the Mammalian External Auditory Canal」Front Cell Dev Biol 8: 617354（2021）https://www.frontiersin.org/articles/10.3389/fcell.2020.617354/full
- Frumm ほか「A hierarchy of proliferative and migratory keratinocytes maintains the tympanic membrane」Cell Stem Cell 28(2)（2020）https://pmc.ncbi.nlm.nih.gov/articles/PMC8962966/
- Prepageran ほか「The rate and pattern of otic epithelial migration: systematic review」J Laryngol Otol 136(10)（2021）https://www.cambridge.org/core/product/7C3A88C73C6905D65EE87282CCD76B14
- StatPearls「Cerumen Impaction Removal」（2023）https://www.ncbi.nlm.nih.gov/books/NBK448155/
- ENT Health「Earwax (Cerumen Impaction)」（AAO-HNS財団、2018）https://www.enthealth.org/conditions/earwax-cerumen-impaction/
- Cleveland Clinic「Earwax」（2025）https://my.clevelandclinic.org/health/body/24624-earwax
- NHS「Earwax build-up」（2024）https://www.nhs.uk/conditions/earwax-build-up/
- 科学技術振興機構・長崎大学「ヒトの耳垢型がABCC11遺伝子の一塩基の変化で決定されることを発見」（2006）https://www.jst.go.jp/pr/info/info248/index.html
- Yoshiura ほか「A SNP in the ABCC11 gene is the determinant of human earwax type」Nature Genetics 38(3)（2006）https://doi.org/10.1038/ng1733
- Sato ほか「Allele frequencies of the ABCC11 gene for earwax phenotypes among ancient populations of Hokkaido, Japan」J Hum Genet 54（2009）https://www.nature.com/articles/jhg200956
- Nakano ほか「A strong association of axillary osmidrosis with the wet earwax type…」BMC Genetics 10: 42（2009）https://nagasaki-u.repo.nii.ac.jp/record/16340/files/BMC10_42.pdf
- 消費者庁「Vol.620 耳掃除中のけがに注意!」（2023）https://www.caa.go.jp/policies/policy/consumer_safety/child/project_001/mail/20230228/
