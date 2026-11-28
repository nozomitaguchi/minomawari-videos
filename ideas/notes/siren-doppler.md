# siren-doppler（救急車のサイレンが変わる）動画用メモ

元記事：[救急車が通りすぎると、どうしてサイレンの音が低くなるのか](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/ambulance-siren-doppler.md)（公開ページ https://nozomitaguchi.github.io/everyday-trivia/t/ambulance-siren-doppler/ ）
図はすべて `everyday-trivia/assets/figures-ambulance.js`（2026-11-29 作成、18枚）。図鑑の「もの」は `ambulance`（きゅうきゅうしゃ、のりもの）。
色は、音の波＝むらさき、高い音＝赤、低い音＝青でそろえてある。救急車は白い車体に赤い線と赤ランプ（赤十字のマークは描かない）。

## 問い

救急車が通りすぎると、どうしてサイレンの音が変わるの？
（つかみ：歩道で聞く「ピーポー」。来るときは高く、目の前を通りすぎたとたんに低くなる。「同じ車なのに？ サイレンのスイッチを変えたの？」）

## 見せ場

- **サイレンは何も変えていない**：「ピー」は960ヘルツ、「ポー」は770ヘルツと決まっていて、ずっと同じ高さで鳴っている（東京消防庁）。変わるのは聞こえ方だけ
- **波がつまる・広がる**：救急車は鳴らしながら前へ進むので、前では音の波がぎゅっとつまり、後ろでは広がる。アニメなら、救急車から輪っかの波を一定の間かくで出し、車が進むにつれて前の輪がつまっていく様子を見せられる（いちばんの見せ場）
- **前の人と後ろの人**：同じ時刻に、前の子には高く、後ろの子には低く聞こえる。2人の耳に1秒間にとどく波の数をくらべる
- **意外な一言1**：近づくあいだは「だんだん高くなる」のではなく、高いまま。通りすぎるときにストンと下がり、あとは低いまま（すぐそばを通るほど急）
- **意外な一言2**：救急車に乗っている人には、音は変わらない（いっしょに動いているから）
- 1845年、オランダで汽車にラッパ（楽器）をふく人を乗せて、本当に音が変わるか確かめた。近づく音は半音高く、遠ざかる音は半音低く聞こえた

## 説明の順番（5場面）

1. 音は空気のふるえ。1秒にとどくふるえの数が多いと高い音、少ないと低い音　図：`ambulance-siren-air-wave`、`ambulance-siren-pitch-count`
2. サイレンはずっと同じ「ピー（960）」「ポー（770）」をくりかえしている　図：`ambulance-siren-pipo`
3. 走りながら鳴らすと、前では波がつまり、後ろでは広がる　図：`ambulance-siren-waves-bunch`
4. 前の人には高く、後ろの人には低く聞こえる。来るときは高いまま、通りすぎるときに下がる（ドップラー効果）　図：`ambulance-siren-front-back`、`ambulance-siren-pass-drop`
5. 乗っている人には変わらない／1845年の汽車の実験　図：`ambulance-siren-rider-same`、`ambulance-siren-buys-ballot-1845`

（入れなくてよい）時速72kmでの計算 `ambulance-siren-pitch-table`、音の大きさとのちがい `ambulance-siren-loud-vs-high`、聞く人が動いても同じ（電車とふみきり）`ambulance-siren-listener-moves`、1842年のドップラー `ambulance-siren-doppler-1842`、年表 `ambulance-siren-timeline`、天気予報のレーダー `ambulance-siren-weather-radar`、音量の決まり `ambulance-siren-20m`
いちばん上の問いの図：`ambulance-siren-doppler`

予想の3択の案：救急車が通りすぎると、どうして音が低くなる？（正解：前では音の波がつまり、後ろでは広がるから）。ほかの選択肢は「通りすぎたら、運転する人がサイレンを低い音に切りかえるから」「遠くなると、音がつかれて低くなるから」など。

## みてみよう（注意書きは必ず入れる）

- 救急車のサイレンが聞こえたら、大人といっしょに道路からはなれた歩道の奥で立ち止まり、来るときと通りすぎたあとの「ピーポー」をくらべる。「だんだん下がる？ 通りすぎるときに下がる？」と予想してから聞く　図：`ambulance-siren-look-pass`
- 電車に乗っているとき、ふみきりの「カンカン」が近づくときと通りすぎたあとで変わるか耳をすます（今度は聞く人が動いている）　図：`ambulance-siren-look-crossing`
- **注意**：救急車を追いかけない、道路に出ない、見に行くために近づかない。大人といっしょに、止まって聞く

## 言い方の注意

- 960ヘルツ・770ヘルツ、0.65秒ずつ・1.3秒でひとまわりは東京消防庁の研究報告から。「ヘルツ」は動画では言わず、「1秒にふるえる回数が決まっている」でよい
- 「ピーポー」になる前の音（「ウー」など）、1970年に音色を変えたわけ、夜にサイレンを小さくするかは確かめていないので言わない
- 時速72km（秒速20m）での「約1020」「約907」は、OpenStax の式からの計算。数字を出すなら「たとえば」とする
- 「乗っている人には変わらない」は OpenStax の教科書（汽車の運転士と警笛の例：相対的な速さがゼロ）にもとづく
- ドップラーの生まれた年は資料で1803年と1805年に分かれるので言わない。1842年に考えを発表、1845年に汽車で音を確かめた、までにする
- 1845年の実験の楽器は、KNMI はホルン、Physics Today はトランペットと書いている。動画では「ラッパ」「楽器」とする。汽車の速さは資料にないので言わない
- ドップラーの考えの「星の色」の部分はまちがいだった（音の高さが変わる考えは正しかった）。星の話は入れなくてよい

## 出典（概要欄用）

- 気象庁 中部航空地方気象台「空港気象ドップラーレーダー」 https://www.data.jma.go.jp/chubu-airport/ymyx/draw.html
- JAXA DARTS「ドップラー効果（VLBI用語集）」 https://data.darts.isas.jaxa.jp/pub/halca/vsop/dictionary/k01_doppler.html
- 沼津工業高等専門学校 物理Ⅱ「音 ドップラー効果」 https://physics.numazu-ct.ac.jp/lecture2023/phys2/phys2-yamazaki/no13/FY2022-physics2-no13.pdf
- OpenStax University Physics 17.7 The Doppler Effect https://courses.lumenlearning.com/suny-osuniversityphysics/chapter/17-7-the-doppler-effect/
- 東京消防庁 救急車電子サイレン音の分析結果について https://www.tfd.metro.tokyo.lg.jp/content/safetyreport/000007279.pdf
- 東京消防庁 高規格救急車内に伝播する電子サイレン音の減衰に関する研究開発（第1報） https://www.tfd.metro.tokyo.lg.jp/content/safetyreport/000007152.pdf
- Physics Today "The fall and rise of the Doppler effect" https://physicstoday.aip.org/features/the-fall-and-rise-of-the-doppler-effect
- KNMI "Doppler experiment Buys Ballot 160 jaar geleden" https://www.knmi.nl/over-het-knmi/nieuws/doppler-experiment-buys-ballot-160-jaar-geleden
