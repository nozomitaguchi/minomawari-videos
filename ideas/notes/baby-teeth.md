# baby-teeth（子どもの歯の生えかわり）動画メモ

元記事：[子どもの歯はなぜぬけて生えかわるのか](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/baby-teeth.md)（図鑑の「は（こどもの はと おとなの は）」 `items/teeth.md`、公開ページ https://nozomitaguchi.github.io/everyday-trivia/i/teeth/ ）
絵：`everyday-trivia/assets/figures-teeth.js`（`bt-` で始まる名前）

## 問い

子どもの歯は、どうしてぬけて生えかわるの？

（つかみの「ふしぎ」：ぐらぐらしてぬけた歯を見ると、根っこがほとんどない。根っこはどこへ行った？）

## 見せ場

- **同じ断面で4段を並べる**：乳歯の下であごの骨の中に、もう大きなおとなの歯がいる → おとなの歯が上へ動くと、乳歯の根が短くなる → 根がなくなって歯ぐきだけで止まり、ぐらぐら → ぬけて、あいたところからおとなの歯。断面の位置と向きを最後まで変えないで、根の長さとおとなの歯の高さだけを動かす（`baby-teeth` → `bt-step-grow` → `bt-step-melt` → `bt-step-wobble` → `bt-step-out` がそのままコマになる）
- **何も追い出さない奥歯**：6歳ごろ、いちばん奥の乳歯のさらに奥に、6歳臼歯が乳歯をどれも追い出さずに生えてくる（`bt-six-molar`）。正解のあとの「みてみよう」につなげやすい

## 予想（3択の案）

ぐらぐらしてぬけた乳歯に、根っこがほとんどないのはなぜ？

- 下で育つおとなの歯が上へ来ると、乳歯の根っこがとけるから（正解）
- 乳歯には、はじめから根っこがないから（ちがう：乳歯にも根がある。おとなの歯の根より細くて短い）
- 歯をみがくと、根っこがへっていくから（ちがう）

※ 正解の番号は cast.py に従う。

## 説明の順番（4〜5場面）

1. **下にもう1本いる**：乳歯のすぐ下、あごの骨の中で、おとなの歯が育っている。おとなの歯づくりは、生まれたころにもう始まっている（`bt-step-grow`）
2. **根がとける**：おとなの歯が上へ動いてくると、乳歯の根が少しずつとけて体に吸収され、短くなる。とかすのは「歯のかたいところをとかす細胞」。とかしはじめる合図は、おとなの歯をつつむふくろのほうから出ると考えられている（`bt-step-melt`、`bt-cells`、`bt-signal`）
3. **ぐらぐら → ぬける**：根がなくなると、歯ぐきだけで止まっているのでぐらぐらし、ぬけると、そこからおとなの歯が出てくる（`bt-step-wobble`、`bt-step-out`）
4. **なぜ2組？**：小さい顔には小さな歯がちょうどいい。顔が大きくなると、大きくて数の多い歯（20本 → 28〜32本）に入れかわる。サメやワニは何度でも生えかわるけれど、ヒトは1回だけ（`bt-face-size`、`bt-count`、`bt-animals`）
5. **順番と6歳臼歯**：最初にぬけるのはふつう下のまん中の前歯（6〜7歳ごろ）。同じころ、奥に6歳臼歯が何も追い出さずに生える（`bt-order`、`bt-six-molar`）

## みてみよう

- 鏡の前で口を大きくあけて、いちばん奥の歯のさらに奥に、新しい大きな奥歯が出ていないか見る（`bt-look-molar`）
- ぬけた乳歯をとってあったら、根もとを見て、おとなの歯の絵の長い根とくらべる（`bt-look-root`）

## 注意書き（必ず入れる）

- ぐらぐらの歯は、むりに引っぱらない。ふつうは自然にぬけるのを待てばよく、なかなかぬけないときは歯医者さんに相談（`bt-wait`）
- 口の奥を見るときは、指を口の奥まで入れない。見るだけ
- 「ぬけるからむし歯はそのままでいい」とは言わない（乳歯はおとなの歯の場所をとっておく）

## 言わないこと（記事で確かめられていない）

- 下の前歯で乳歯の内側からおとなの歯が生える「二枚歯」の話、根が全部とけるまでの期間（「半年」など）、乳歯をなくすと隣の歯が動く話は、出典で確かめられていないので使わない（`everyday-trivia/inbox.md`）
- 「最初に生えるおとなの歯は6歳臼歯」と言い切らない。下の前歯と6歳臼歯のどちらが先かは子どもによってちがう

## 出典（概要欄用）

- American Academy of Pediatrics（HealthyChildren.org）「When Do Children Start Losing Their Baby Teeth?」 https://www.healthychildren.org/English/healthy-living/oral-health/Pages/When-Children-Begin-to-Lose-their-Baby-Teeth.aspx
- Harokopakis-Hajishengallis E. Physiologic root resorption in primary teeth. Journal of Oral Science 49(1):1-12, 2007 https://www.jstage.jst.go.jp/article/josnusd/49/1/49_1_1/_article
- MSDマニュアル家庭版「歯の生物学」 https://www.msdmanuals.com/ja-jp/home/18-口と歯の病気/口と歯の生物学/歯の生物学
- Better Health Channel「Teeth development in children」 https://www.betterhealth.vic.gov.au/health/ConditionsAndTreatments/teeth-development-in-children
- HealthHub（シンガポール保健省）「When Do Baby Teeth Start Falling Out?」 https://www.healthhub.sg/well-being-and-lifestyle/pregnancy-and-infant-health/when-do-baby-teeth-start-falling-out
- The Scientist「Why Do We Have Baby Teeth and Adult Teeth?」 https://www.the-scientist.com/why-do-we-have-baby-teeth-and-adult-teeth-73746
- Monash Lens「Why do humans grow two sets of teeth?」 https://lens.monash.edu/why-do-humans-grow-two-sets-of-teeth-these-marsupials-are-rewriting-the-story-of-dental-evolution
- 東京都保健医療局「永久歯を大事にしよう」 https://www.hokeniryo.metro.tokyo.lg.jp/documents/d/hokeniryo/leaflet4
