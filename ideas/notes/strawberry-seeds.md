# strawberry-seeds（いちごのつぶつぶ）動画用メモ

元記事：[いちごのつぶつぶ、一粒だけ割ったら中には何があるのか](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/strawberry-seeds.md)（2026-11-28 作成）
サイト：https://nozomitaguchi.github.io/everyday-trivia/i/strawberry/
図：`everyday-trivia/assets/figures-strawberry.js`（名前はすべて `sb-` ではじまる。いちばん上の絵は `strawberry-seeds`）

## 問い

いちごのつぶつぶ、一粒だけ割ったら中には何があるの？
答えの軸：つぶつぶは種ではなく、**1つぶ1つぶが本当の「実」**（そう果） → 一粒割ると中には**小さな種が1つ** → 赤くてあまいところは実ではなく**花のつけね（花托）がふくらんだもの** → その赤いところをふくらませているのは、つぶの中の種が出す「おおきくなれ」の合図。つぶを取ると、いちごは大きくならない。

## 見せ場

- つかみ：いちごの表面のつぶを1つ、ルーペで大きくして「パカッ」と割る。中から小さな種がひとつ（`strawberry-seeds` → `sb-inside`）。「つぶ＝種」だと思っていたら、つぶは「実」で、種はその中
- 「いちご1こ」は、何百もの実の集まり。とちおとめ1こで平均およそ450こ（`sb-count`）
- 赤いところは「めしべを乗せていた台」。花のまんなかの緑のもりあがりに、めしべが何百本もならび、めしべ1本がつぶ1つになる（`sb-flower` → `sb-pistil-to-achene` → `sb-receptacle`）
- いちばんの見せ場：つぶを全部取ると、いちごは大きくならない。1つだけ残すとそこだけぷくっ、たての輪で平たいいちご、横の輪でずんぐりいちご（`sb-remove-all`、`sb-shapes`）。アニメで「つぶが消える→ふくらまない」「つぶ1つ→そこだけふくらむ」を見せやすい
- 予想の3択の例：「いちごのつぶを一粒わったら、中には何がある？」 1. 何もない（からっぽ）／2. 小さな種がひとつ（正解）／3. あまいいちごのしる。cast.py の番号に正解を置く

## 場面の順番（説明は5場面）

1. つぶつぶは種じゃなくて「実」。名前は「そうか」。いちごは、たくさんの小さな実の集まり（`sb-achene-fruit`）。とちおとめ1こに平均およそ450こ（`sb-count`）
2. つぶの中には種が1つ。かたい皮（実のかべ）の中に種があり、種の中に芽の赤ちゃん（胚）（`sb-inside`）
3. いちごの花：まんなかにめしべが何百本。花粉がついて受精すると、めしべ1本の根もとがつぶ1つになる（`sb-flower`、`sb-pollen`、`sb-pistil-to-achene`）
4. 赤くてあまいところは、めしべを乗せていた台（花托）がふくらんだもの（`sb-receptacle`）。ふくらませるのは、つぶの中の種が出す「おおきくなれ」の合図（オーキシン）（`sb-auxin`）
5. むかしの実験（1951年、アメリカのニッチ）：つぶを全部取ると大きくならない、残したつぶのまわりだけふくらむ（`sb-remove-all`、`sb-shapes`）。つぶの代わりに合図の薬をまぜたクリームをぬると、ふつうに育って赤くなった（`sb-paste`）。だから、うまく受粉できなかったつぶがあると、いちごがゆがむ（`sb-misshapen`）

正解の場面：「一粒わったら中には小さな種がひとつ」。種は生きていて、まけば芽が出る。でも元のいちごとはちがういちごになるので、畑のいちごは「ランナー」（地面をはうつる）の先の子どもで増やす（`sb-sprout`、`sb-runner`）。種から育てるための品種「よつぼし」もある（`sb-yotsuboshi`。入れるなら一言）。

みてみよう：小さいいちごと大きいいちごをならべて、つぶの数を見くらべる。先に予想してから（小さいほうがつぶが少ない）（`sb-look-count`）。大人にたてに切ってもらい、つぶが赤いところの外がわのふちにならんでいるのを見る（`sb-look-cut`）。

## 注意書き・言いかたの注意

- 包丁は大人が使う。子どもは切らない（みてみようで必ず言う）
- つぶは小さくてかたいので、割ろうとしない（動画の「割る」はルーペで拡大した絵で見せる）。つぶを鼻や耳に入れない
- 「つぶ＝種」とは言わない。「つぶは実。種はその中」
- 赤いところを「実」と言わない。「花のつけね」「めしべを乗せていた台」と言う
- 「オーキシン」は言ってもよいが、子ども向けには「おおきくなれの合図」で十分
- つぶの数は品種や大きさでちがう。言うなら「とちおとめで平均およそ450こ」と品種をつける（UC の解説は「ごくおおまかに200こ」、ニッチの8こは76〜232こ）
- 種の中のつくり（子葉の形、胚乳がどのくらい残るか）は確かめていないので、「芽の赤ちゃん（胚）がいる」までにする
- 種から育てたいちごは「元のいちごとちがう性質になる」まで。「おいしくならない」と断定しない（栃木県は「買ったようなおいしいいちごはできない」と書いている）
- 実験は「つぶを取ったら大きくならなかった」という事実だけ言う。いちごがかわいそう、などの言い方はしない

## 出典（概要欄用）

- 栃木県農業総合研究センターいちご研究所「Q&A」https://www.pref.tochigi.lg.jp/g61/q-and-a/q-and-a.html
- Nitsch JP「The Role of Plant Hormones in Fruit Development」（カリフォルニア工科大学 博士論文、1951年）https://thesis.library.caltech.edu/10130/1/Nitsch_JP_1951.pdf
- Kang C ほか（2013）The Plant Cell 25:1960–1978 https://doi.org/10.1105/tpc.113.111732
- Hollender CA ほか（2014）Plant Physiology 165:1062–1075 https://pmc.ncbi.nlm.nih.gov/articles/PMC4081322
- UC ANR「Growth of the Strawberry Fruit Related to Flower Ovule Number and Auxin Production」（2025年）https://ucanr.edu/blog/strawberries-and-caneberries/article/growth-strawberry-fruit-related-flower-ovule-number-and
- Frontiers for Young Minds「What Is a Fruit?」（2020年）https://kids.frontiersin.org/articles/10.3389/frym.2020.00027
- 稲葉幸雄「イチゴ「とちおとめ」の花粉と雌ずいの受精能力」栃木県農業試験場研究報告50（2001年）https://www.agrinet.pref.tochigi.lg.jp/nousi/kenpou/kp_050/kp_050_05.pdf
- 生研支援センター「種子繁殖型イチゴ「よつぼし」の栽培と育苗の省力化」（2023年）https://www.naro.go.jp/brain/contents/ep_053.pdf
- （ほかの出典は元記事の「出典」に）
