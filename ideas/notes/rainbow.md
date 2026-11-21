# rainbow（にじ）動画用メモ

元記事：[虹はなぜ雨のあとに出るのか](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/rainbow-after-rain.md)（公開ページ https://nozomitaguchi.github.io/everyday-trivia/t/rainbow-after-rain/ 、もののページ https://nozomitaguchi.github.io/everyday-trivia/i/rainbow/ ）
図はすべて `everyday-trivia/assets/figures-rainbow.js`（2026-11-21 作成）。図鑑の「もの」は `rainbow`（そらと けしき）。

## 問い

にじは、どうして雨のあとに出るの？
（つかみ：夕立がやんで、うしろからお日さまが出た瞬間、前の空に虹。雨の最中にも、すっかり晴れた空にも出ないのはなぜ？）

## 見せ場

- **雨粒の中の光の道**：光が雨粒に入って曲がる → うしろでぴかっとはね返る → 出るときにまた曲がって色が広がる。番号つきの3段で（`rb-exit`）
- **1つの雨粒から届くのは1つの色**：高い雨粒から赤、低い雨粒から紫。だから虹の外がわが赤（`rb-which-drops`）
- **虹はほんとうは丸い**：下半分は地面にかくれる（`rb-circle`）。太陽が低いと大きく、高いと小さく、夏の昼（太陽が80度近く）は地面の下に入って見えない（`rb-sun-low`、`rb-noon`）
- **「雨のあと」の答え**：3つがそろうとき＝太陽がうしろ・前に雨粒・光が雨粒に当たる。雨の最中は太陽が雲の中、かわくと雨粒がない → 「通りすぎた直後」がねらいめ（`rb-three-things`、`rb-after-rain`）
- おまけ：二重の虹は色がさかさま、2本のあいだは暗い（`rb-double`、`rb-dark-band`）

## 説明の順番（5場面）

1. 虹が出る場所：いつも太陽の反対がわ。太陽を背中に、前に雨　図：`rainbow-after-rain`、`rb-three-things`
2. 雨粒の中：入って曲がる → うしろではね返る → 出てまた曲がる。雨粒は丸い（しずく形ではない）　図：`rb-refract`、`rb-reflect`、`rb-exit`、`rb-drop-shape`
3. 色に分かれるわけ：色ごとに曲がり方がちがう（青・紫がよく曲がる）。1つの雨粒から1色、赤は高い雨粒から　図：`rb-colors`、`rb-which-drops`
4. 形と大きさ：太陽の反対の点（頭の影のほう）から赤42度・紫40度の円。下半分は地面。太陽が低いほど大きく、夏の昼は見えない　図：`rb-42`、`rb-circle`、`rb-sun-low`、`rb-noon`
5. だから雨のあと：雨雲が通りすぎて、すぐお日さまが出たとき（夕立・しぐれ）。朝は西の空、夕方は東の空　図：`rb-after-rain`、`rb-east-west`

（入れるなら短く）二重の虹：中で2回はね返ると外がわに色がさかさまのうすい虹。あいだは暗い　図：`rb-double`、`rb-dark-band`
（使わなくてよい）歴史：アリストテレス `rb-aristotle`、テオドリクスの水を入れたうつわ `rb-theodoric`、デカルト1637年 `rb-descartes`、ニュートン5色→7色 `rb-newton`

予想の3択の案：虹がいちばん見つかりやすいのはいつ？（正解：雨雲が通りすぎて、すぐにお日さまが出たとき）。ほかの選択肢は「雨がいちばん強く降っているとき」「雨がやんで何時間もたった、よく晴れたとき」。cast.py の番号に合わせて並べかえる。

## 言い方の注意

- 角度は「赤42度・紫40度」（世界気象機関・オーストラリア気象局）。子どもには数字を出さず「いつも同じ大きさの円」と言ってよい
- 「虹は7色」と言いきらない。7色すべてを見分けられることはめったにない（国際雲図帳）。ニュートンもはじめは5色だった
- 「朝虹は雨、夕虹は晴れ」の日本のことわざとその理由は確かめていないので言わない（英語のことわざは記事にある）
- 副虹の角度は「約50度」（アメリカ国立気象局）。50〜52度などの細かい数字は言わない
- 「雨粒がプリズムになる」はたとえ。雨粒の中では反射が1回入るのがプリズムとのちがい

## みてみよう と注意書き

- よく晴れた日に、大人といっしょに、太陽を背中にしてホースや霧吹きで前に細かい水しぶきを出す。自分の頭の影のまわりの水しぶきに虹ができる。赤が外がわか内がわか、予想してから見る（答え：外がわ）　図：`rb-look`
- **注意（必ず入れる）**：太陽を直接見ない。水を人や電気のものに向けない。ホースや霧吹きは大人といっしょに使う

## 出典（概要欄用）

- Met Office「How are rainbows formed?」https://weather.metoffice.gov.uk/learn-about/weather/optical-effects/rainbows/how-are-rainbows-formed
- NWS Flagstaff「How Do Rainbows Form?」https://www.weather.gov/fgz/Rainbow
- Bureau of Meteorology「Ask BOM: how do rainbows form?」https://media.bom.gov.au/social/blog/899/how-do-rainbows-form/
- WMO International Cloud Atlas「Primary rainbow」https://cloudatlas.wmo.int/en/primary-rainbow.html
- ウェザーニュース「太陽が高い夏は昼に虹が見えない」https://weathernews.jp/news/202507/150116/
- ダイワ D.Y.F.C「見つけてみよう！空の虹色」https://www.daiwa.com/dyfc/manabu/weather/weather07
- Corradi「A short history of the rainbow」（2016年）https://iris.unige.it/retrieve/e268c4cc-42a2-a6b7-e053-3a05fe0adea1/2016_Corradi2016_Article_AShortHistoryOfTheRainbow.pdf
