# bruise（青あざ）動画用メモ

元記事：[強くぶつけると、どうして青あざができるのか…](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/bruise-color.md)（2026-11-28 作成）
サイト：https://nozomitaguchi.github.io/everyday-trivia/t/bruise-color/
図：`everyday-trivia/assets/figures-bruise.js`（名前は `bz-` ではじまる。いちばん上の絵は `bruise-color`）
色の約束：ち＝あか、あざ＝あか→あおむらさき→みどり→きいろ、ひふ＝はだいろ、あぶら＝うすきいろ、きんにく＝うすあか、ほね＝クリーム、マクロファージ＝うすむらさき、メラニン＝はいいろがかった あお

## 問い

強くぶつけると、どうして青あざができるの？（そして、どうして色が変わっていくの？）
答えの軸：**ぶつけた力で、皮ふの下の細い血管がプチッと切れ、もれた血が皮ふの下にたまる。皮ふは切れていないので血は外に出ない。血は赤いけれど、皮ふが光を散らしたり吸ったりするので、皮ふごしには青っぽく見える。そのあと、集まってきた おそうじの細胞（マクロファージ）が血をこわしていく。血の赤い色のもと（ヘム）は、こわれると緑の「ビリベルジン」、次に黄色の「ビリルビン」に変わるので、あざは 青 → 緑 → 黄色 と色を変えて、たいてい2週間くらいで消える。**

## 見せ場

- 予想の3択の例：「ぶつけた ところが あおく なるのは なぜ？」（ひふが あおく そまるから／ひふの したに ちが たまって いるから／ほねが あおく なるから）。正解は「ひふの したに ちが たまって いるから」。正解の番号は cast.py に従う
- **プチッ → にじむ**：ひふの だんめんで、ほそい ちの くだが きれて、あかい ちが じわっと ひろがる（`bz-vessel-break`）。ひふの おもては きれて いない、を はっきり見せる
- **あかい ちなのに あおい**：ひかりが ひふに はいって、めには あおっぽく とどく（`bz-blue-skin`）。「あかい ちが あおく みえる」が1つめの「へぇ」
- **おそうじやさん登場**：マクロファージが あかい ちの つぶを とりこんで、みどり・きいろの つぶを だす（`bz-macrophage`）→ いろの もとが ヘム → ビリベルジン（みどり）→ ビリルビン（きいろ）と バトンのように かわる（`bz-chem-chain`）→ あざが あか→あおむらさき→みどり→きいろ→もとの いろ（`bz-color-steps`）。ここが一番の見せ場。色が順に変わるアニメにする
- **すねと ひざ**：あるく ように なった こは、すねと ひざに いちばん あざが ある。あざの ほとんどは ほねが ひふの すぐ したに ある ところ（`bz-shin-map`、`bz-walk-bar`）
- **おまけ**：あかちゃんの おしりの あおい「もうこはん」は ちでは ない（`bz-mongolian`）— 時間が足りなければ省く

## 場面の順番（説明は5場面）

1. ゴツン！ 次の日、青あざ（`bruise-color`）。皮ふの下の細い血管が切れて、血がもれてたまる。皮ふは切れていないので外に出ない（`bz-vessel-break`）。もれ口は「けっしょうばん」がふさぐ（`bz-platelet`）
2. 血は赤いのに、どうして青い？ 皮ふが光を散らしたり吸ったりするので、皮ふごしには青っぽく見える（`bz-blue-skin`）。できたばかりはピンクや赤で、少したつと青っぽくなる（`bz-new-red`）
3. おそうじの細胞マクロファージが集まって、血をこわしはじめる（`bz-macrophage`）
4. 赤い色のもとが 緑 → 黄色 に変わるので、あざも 青 → 緑 → 黄色 → 消える（`bz-chem-chain`、`bz-color-steps`）。たいてい2週間くらい（`bz-two-weeks`）
5. 歩くようになった子は、すねとひざにあざができやすい（`bz-shin-map`）。ぶつけたら、タオルでつつんだ氷で冷やす（`bz-ice`）

みてみよう：ぶつけてできたあざを、毎日同じ明るさの場所で見て、まん中とふちのどちらから緑や黄色になるかくらべる（`bz-look`）。**答えは言わない**（資料で確かめていない。「どっちかな？」で終える）。

## 注意書き・言いかたの注意

- **あざは見るだけ。押したり、たたいたりしない。わざとぶつけてためさない**。動画の「みてみよう」で必ず言う
- **冷やすのは大人といっしょに。氷はタオルでつつんで、直接はだにつけない**（MedlinePlus：1時間に15分まで、できれば心臓より高く）。ナレーションでは「タオルで つつんだ こおりで ひやして もらおう」
- お医者さんの目安（`bz-doctor`）：ぶつけていないのにできた／ひどくはれて痛い／2週間たっても消えない。こわがらせないよう、「ふつうの あざは しばらく すると きえる」と言ってから、の順にする
- 「色を見れば何日目かわかる」とは言わない（色から日にちを当てるやり方には科学的根拠がない、と2005年のまとめ論文）。「きいろが あれば 18じかん いじょう たって いた」は1991年の写真の研究で、言うなら字幕か図だけ
- 「深いと青、浅いと赤」とは言わない（向きを確かめていない）。「茶色になる（ヘモジデリン）」も言わない（一次資料で確かめていない）
- 「骨にはさまれるから すねに できる」と理由を言わない。言えるのは「すねと ひざに いちばん おおかった」「ほねが ひふの すぐ したに ある ところに できて いた」まで
- 子どもの研究（シュガーさんら 1999年）は3歳未満の子どもで、「つたい あるきの まえ 2.2％・つたい あるき 17.8％・あるく こ 51.9％」。ナレーションは「あるく ように なると ぐんと ふえる」でよく、数字は図だけ。虐待の話には触れない
- 吹き出しの例：おとうと「ゴツン！ いたい！」／おねえちゃん「あれ？ あおく なってる！」／カメレオン（ルーペで みどり→きいろに かわる あざを のぞく）

## 出典

- MedlinePlus「Bruise」（アメリカ国立医学図書館、2025）https://medlineplus.gov/ency/article/007213.htm
- MedlinePlus「Bruises」（2025）https://medlineplus.gov/bruises.html
- NIH News in Health「Bruising Questions」（2022）https://newsinhealth.nih.gov/2022/01/bruising-questions
- Cleveland Clinic「Bruises (Ecchymosis)」（2023）https://my.clevelandclinic.org/health/diseases/15235-bruises
- Mayo Clinic「Easy bruising: Why does it happen?」（2025）https://www.mayoclinic.org/healthy-lifestyle/healthy-aging/in-depth/easy-bruising/art-20045762
- Nebraska Medicine「Bruising 101」（2022）https://www.nebraskamed.com/primary-care/bruising-101
- Kienle ほか「Why do veins appear blue? A new look at an old question」Applied Optics 35(7)（1996）https://opg.optica.org/abstract.cfm?URI=ao-35-7-1151
- Marin ほか「Pulsed Photothermal Radiometric Depth Profiling of Bruises…」Sensors 23(4): 2196（2023）https://pmc.ncbi.nlm.nih.gov/articles/PMC9965129/
- StatPearls「Biochemistry, Biliverdin」（2023）https://www.statpearls.com/point-of-care/18284
- Canesin ほか「Heme-Derived Metabolic Signals Dictate Immune Responses」Frontiers in Immunology 11: 66（2020）https://pmc.ncbi.nlm.nih.gov/articles/PMC7005208/
- Langlois ほか「Heme oxygenase-1 and heme oxygenase-2 expression in bruises」Forensic Sci Med Pathol 11(4)（2015）https://pubmed.ncbi.nlm.nih.gov/25772118/
- Langlois & Gresham「The ageing of bruises」Forensic Science International 50(2)（1991）https://pubmed.ncbi.nlm.nih.gov/1748358/
- Maguire ほか「Can you age bruises accurately in children?」Arch Dis Child 90(2)（2005）https://pmc.ncbi.nlm.nih.gov/articles/PMC1720275/
- Sugar ほか「Bruises in Infants and Toddlers: Those Who Don't Cruise Rarely Bruise」Arch Pediatr Adolesc Med 153: 399–403（1999）https://www.thecapcenter.org/medical/pdf/toolkit/NonCruisersRarelyBruiseSugar1999.pdf
- 舟橋ひとみ「小児を対象としたレーザー治療：異所性蒙古斑」日本レーザー医学会誌 42(1)（2021）https://www.jstage.jst.go.jp/article/jslsm/42/1/42_jslsm-42_0002/_html/-char/ja
