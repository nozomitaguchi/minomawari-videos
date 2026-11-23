# banana-seeds（バナナの種と吸芽）動画用メモ

元記事：[バナナには種が見当たらないのに、次のバナナはどうやって育つのか](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/banana-seeds.md)（2026-11-24 作成）
図：`everyday-trivia/assets/figures-banana.js`（名前はすべて `bn-` ではじまる。いちばん上の絵は `banana-seeds`）

## 問い

バナナには種が見当たらないのに、次のバナナはどうやって育つの？
答えの軸：まんなかの黒いつぶは種ではなく「種になれなかったもの（胚珠のあと）」 → 食べるバナナは花粉がつかなくても実だけが太るので種ができない → 次のバナナは種ではなく、**親の根もと（土の中のくき）から出てくる子ども「吸芽（きゅうが）」**から育つ。

## 見せ場

- つかみ：輪切りのまんなかの黒いつぶ。「これ、種？」→ 種じゃない（`banana-seeds`、`bn-black-dots`）
- 野生のバナナとの見くらべ：同じ輪切りなのに、野生は黒くてかたい種がぎっしり（実1本に300こまで）。たべるバナナは小さな点だけ（`bn-wild-seeds`、`bn-seed-size`）
- 「バナナの木」は木じゃない。幹に見えるのは葉のつけねがぐるぐる重なったもの（にせの幹）。花のくきが幹の中をのぼって、てっぺんから出てくる（`bn-pseudostem`、`bn-shoot-up`）
- 1本のくきが実をつけるのは一生に一度。実がなると上はかれる → でも土の中のくきは生きていて、わきから子どもが「にょきっ」（`bn-once`、`bn-sucker`）。親 → 子 → 子が実をつける、のくりかえし（`bn-follower`）
- 予想の3択の例：「次のバナナは、どこから育つ？」 1. まんなかの黒いつぶをまく／2. 根もとから出てくる子どもを植える（正解）／3. 実を土にうめる。cast.py の番号に正解を置く

## 場面の順番（説明は5場面）

1. バナナの実は、めばなが育ったもの。花のくきの根もと側にめばな、先におばなのつぼみ（`bn-flowers`）。めばなの根もと（子房）は3つの部屋に分かれ、種のもと（胚珠）が200〜300こ（`bn-ovary`）
2. 黒いつぶは種になれなかった胚珠のあと（`bn-black-dots`）。野生のバナナは受粉すると種が育ち、実が太る。種は300こまで、1センチより小さく、黒くてかたい（`bn-wild-seeds`、`bn-seed-size`）
3. 食べるバナナは、花粉がつかなくても実だけが太る（単為結果）。だから種がほとんどできない（`bn-no-pollen`）。わけは1つではなく、いくつも重なっている（`bn-three-reasons`、必要なら `bn-triploid`：設計図の入れものが3組・33本）
4. では次は？ バナナは木ではなく大きな草。幹は葉のつけねの重なり（`bn-pseudostem`、`bn-shoot-up`）。実をつけるのは一生に一度、上はかれても土の中のくきは生きている（`bn-once`）
5. 土の中のくきのわきの芽から子ども（吸芽）が出て、それが育って次のバナナがなる。農家の人はこの子どもを親からはなして植える（株分け）。大きな農園では芽の先を小さく切ってびんで育てる方法も（`bn-sucker`、`bn-follower`、`bn-sword-water`、`bn-tissue`）

みてみよう：大人に輪切りにしてもらい、まんなかの黒いつぶを見る。野生のバナナの種の絵と大きさをくらべる（`bn-look-slice`）。植物園の温室などでバナナの株を見かけたら、根もとに小さな子どもがいないか見る（`bn-look-sucker`）。

おまけ（入れるなら最後に短く）：昔の輸出用バナナ「グロスミッチェル」は土のカビの病気に弱く、1950年代の終わりにいまのキャベンディッシュにかわった（`bn-history`）。こわがらせない言い方で。

## 注意書き・言いかたの注意

- 包丁は大人が使う。子どもは切らない（みてみようの場面で必ず言う）
- 植物園のバナナは見るだけ。葉や実を引っぱらない
- 黒いつぶは「種」と言わない。「種になれなかったもの」「種のもとのあと」
- 「クローン」とは言わない（記事でも使っていない）。「親から分かれた子ども」「種を使わない増え方」と言う
- 吸芽を植えてから実がなるまでの期間は資料で食いちがうので言わない（記事にも書いていない）
- 「同じ品種ばかりだから病気に弱い」とは言いきらない（記事では、グロスミッチェルが病気に弱くてキャベンディッシュにかわった事実と、別の型のカビが広がっている事実だけ）
- バナナの栽培が始まった場所・時代、日本で売っているバナナの品種の割合は確かめていないので言わない

## 出典（概要欄用）

- ProMusa「Banana flowers」https://promusa.org/Banana+flowers
- ProMusa「The banana seed」https://promusa.org/The+banana+seed
- ProMusa「Morphology of banana plant」https://promusa.org/Morphology+of+banana+plant
- ProMusa「Banana sucker」https://promusa.org/Banana+sucker
- ProMusa「Gros Michel」https://promusa.org/Gros+Michel ／「Cavendish subgroup」https://promusa.org/Cavendish+subgroup
- フロリダ大学 IFAS「Banana Growing in the Florida Home Landscape」https://ask.ifas.ufl.edu/publication/MG040
- 日本植物生理学会 植物Q&A「バナナは種子がないのに、どうやって増やすのか？」（講談社 現代ビジネス）https://gendai.media/articles/-/126017
- Heslop-Harrison「Genomics, Banana Breeding and Superdomestication」Acta Horticulturae 897（2011）https://www.le.ac.uk/bl/phh4/openpubs/BananaSuperdomesticationISHSChinaAsia.pdf
