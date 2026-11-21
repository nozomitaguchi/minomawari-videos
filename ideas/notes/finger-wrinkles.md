# finger-wrinkles（指のしわしわ）動画用メモ

元記事：[おふろに入ると、どうして指がしわしわになるのか](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/finger-wrinkles.md)（公開ページ https://nozomitaguchi.github.io/everyday-trivia/t/finger-wrinkles/ ）
図はすべて `everyday-trivia/assets/figures-finger-wrinkles.js`（2026-11-22 作成、14枚）。図鑑の「もの」は `fingers`（ゆび、からだ）。
水は青、神経は黄色の線と稲妻、血管は赤い帯でそろえてある。

## 問い

おふろに入ると、どうして指がしわしわになるの？
（つかみ：おふろに入ったばかりの指と、しばらくたった指を並べる。「水を吸ってふやけたのかな？」）

## 見せ場

- **「ふやけるだけ」ではない、の逆転**：皮ふのいちばん外側の細胞は、たしかに水を吸ってふくらむ（うでの細胞で厚み・体積が約50％ふえた）。でも、神経がはたらかなくなった指は、水につけてもしわにならない。だから、しわは体が自分でつくっている
- **神経がない指はしわにならない**：1930年代の報告（手首の神経がまひした人）と、つなぎなおした指の研究（ふつうの指は血の流れが約28％減ってしわができ、つなぎなおした指は約23％ふえてしわができなかった）
- **しわができる順番（4コマ）**：水が汗の出口からしみこむ → 神経が合図を出す → 指先の血管がちぢんで中身が少し減る → 上の皮ふが下へ引っぱられてしわになる。同じ断面図を4枚並べて切りかえるのが映える
- **わかっていないこと**：「水がどうやって神経を動かすのか」は「おそらく」の段階。しわが何のためにあるのかも、つかみやすくなったという研究（2013年、ぬれたビー玉が12％早い）と、変わらなかったという研究（2014年）があり、まだ決まっていない。動画ではここをはっきり「まだ わかっていない」と言う
- 意外な一言：しわは毎回同じ形になる（30分つけて、1日以上あとにもう一度つけても同じもよう。ビンガムトン大学）

## 説明の順番（5場面）

1. 皮ふの外側は水を吸ってふくらむ。でも、それだけではない（昔の考え → 今の考え）　図：`wrinkle-corneocyte-swell`、`wrinkle-old-vs-new`
2. 神経がはたらかない指は、しわにならない　図：`wrinkle-nerve-palsy`、`wrinkle-replanted`
3. しわができる順番①②：汗の出口から水がしみこむ → 神経が合図を出す　図：`wrinkle-step-sweat`、`wrinkle-step-nerve`
4. しわができる順番③④：血管がちぢんで指先が少ししぼむ → 皮ふが下へ引っぱられてしわ　図：`wrinkle-step-vessel`、`wrinkle-step-pull`、全体図 `finger-wrinkles`
5. 何のため？ つかみやすくなるという研究と、変わらないという研究。まだわかっていない　図：`wrinkle-marbles`、`wrinkle-no-difference`

（入れなくてよい）しわができるまでの時間は2〜37分と人によってちがい、あたたかい水で早く、氷水や油ではできない `wrinkle-speed-conditions`、毎回同じ形 `wrinkle-same-pattern`

予想の3択の案：指がしわしわになるのは、なにがはたらいているから？（正解：神経の合図で、指の中の血管がちぢむから）。ほかの選択肢は「水を吸って、皮ふがふくらむだけ」「お湯の熱で、皮ふがとける」など。cast.py の番号に合わせて並べる。
※「水を吸ってふくらむ」も一部は本当なので、正解のときに「ふくらむのも本当。でもそれだけではしわにならない」と添える。

## みてみよう（注意書きは必ず入れる）

- おふろで、指先のはら（指紋のあるところ）と手のこうをくらべ、どこが先にしわしわになるか見る。入ってすぐと、少したってからで見くらべる　図：`wrinkle-look-bath`
- **注意**：おふろは大人といっしょに入る。熱いお湯に長く入りすぎず、のぼせる前に出る。しわしわを早く作ろうとして長湯しない

## 言い方の注意

- しわができる順番は、ウィルダー＝スミス（2004年のまとめの論文）が「おそらく」として書いたもの。とくに「水がどうやって神経を動かすか」は確かめられていない。動画でも「〜と かんがえられて いる」と言う
- 「神経」は交感神経（自律神経）。子ども向けには「からだが かってに うごかす しんけい」くらいで
- 細胞が約50％ふくらんだのは、**うで**の皮ふからとった細胞を水につけた実験。指先の細胞で測ったものではない
- つなぎなおした指の研究は、40℃の塩水（0.5 mol/L）につけた結果。指20本
- 「しわは何のため？」は結論を言わない。2013年（つかみやすい）と2014年（変わらない）の両方を出す
- 1930年代の報告（ルイスとピッカリング）は、2014年の論文の紹介で確かめた。元の論文は読んでいない
- しわができるまでの時間（2.1〜37分）は室温の水、24人の大人で測ったもの

## 出典（概要欄用）

- Wilder-Smith EPV. Water immersion wrinkling. Clinical Autonomic Research (2004) https://link.springer.com/doi/10.1007/s10286-004-0172-4
- Haseleu J ほか. Water-Induced Finger Wrinkles Do Not Affect Touch Acuity or Dexterity in Handling Wet Objects. PLoS ONE (2014) https://edoc.mdc-berlin.de/id/eprint/13817/1/13817oa.pdf
- Hsieh CH ほか. Paradoxical response to water immersion in replanted fingers. Clinical Autonomic Research (2006) https://www.springermedizin.de/paradoxical-response-to-water-immersion-in-replanted-fingers/8780024
- ニューカッスル大学 発表「Get a grip - why we get wrinkly fingers and toes」(2013) https://www.ncl.ac.uk/press/articles/archive/2013/01/getagrip-whywegetwrinklyfingersandtoes.html
- Kareklas K, Nettle D, Smulders TV. Biology Letters (2013) https://eprints.ncl.ac.uk/189064
- Évora AS ほか. Journal of the Mechanical Behavior of Biomedical Materials (2024) https://research.birmingham.ac.uk/files/217335377/1-s2.0-S1751616123006501-main.pdf
- Martimiano BD ほか. Skin Pharmacology and Physiology (2025) https://karger.com/spp/article/38/3/121/927892
- ビンガムトン大学 発表 (2025) https://www.binghamton.edu/news/story/5547/
