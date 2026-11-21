# toilet（トイレ）動画メモ

元記事：[トイレは、流したあともどうして少し水が残るのか](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/toilet-water.md)（サイト：https://nozomitaguchi.github.io/everyday-trivia/i/toilet/ ）
図は everyday-trivia の `assets/figures-toilet.js`。同じ便器の断面（前が左、奥にタンク）を状態ちがいで使い回している。

## 問い

トイレは、流したあともどうして少し水が残るの？

答え（ひとことで）：便器の奥の排水の道が曲がっていて（トラップ）、そこに水がたまる形だから。そして流したあと、わざと水を足して元の高さに戻している。その水が「水のふた」になって、下水のくさいにおいが上がってこないようにしている。

## 見せ場

- サイホン式の便器では、流した直後は水がほとんどなくなり、1〜2分かけて元の高さに戻る（TOTO の取扱説明書）。「なくなった水が、また戻ってくる」を、同じ断面の水面の上下で見せる
- 曲がった道に水がある／ないで、においの点線が止まる／上がってくるのを左右に並べる
- タンクの中：浮玉が下がると水が出て、上がると止まる（千葉県企業局）。動きがはっきりしていてアニメ向き

## 予想（3択の案）

「ながした あと、べんきに みずが のこるのは なぜ？」
- くさい においが あがって こないように する ため（正解）
- ながす みずが あまって しまう から
- べんきを ひやす ため
（正解の番号は cast.py に従って入れかえる）

## 場面の順番（説明は5場面）

1. つかみ：流すと水はジャーッと行くのに、しばらくすると便器にまた水がある（`toilet-look` の3つの丸：流す前・すぐあと・1〜2ふんあと）
2. 便器の中を横から切ってみる：奥の道は曲がっていて、そこに水がたまる＝トラップ。水の深さは5〜10cm（`toilet-trap`、`toilet-seal-depth`）
3. 流すと：レバー→鎖→ゴムフロートが開いてタンクの水が出る（`toilet-lever-chain`）。サイホン式は曲がった道が水でいっぱいになり、便器の水ごと吸い出す（`toilet-two-ways`、`toilet-siphon`）→ すぐあとは水がほとんどない（`toilet-after-empty`）
4. 流したあと：タンクは浮玉が下がって水が入り、たまると浮玉が上がって止まる（`toilet-tank-refill`、`toilet-tank-stop`）。便器にも1〜2分かけて水を足し、元の高さに戻す（`toilet-bowl-refill`）
5. 残る水の役目：下水のにおい（や虫）を止める水のふた（`toilet-seal-role`）。だから水がはねる「おつり」があっても、なくせない（`toilet-splash`）。長く使わないと蒸発してへることもある（`toilet-dry`）
6. 正解とみてみよう：流す前・すぐあと・1〜2分あとの水の広さをくらべる（`toilet-look`）。タンクの「シャー」が止まるまで時計を見て聞く。目安2分（`toilet-listen`）

## 注意書き（必ず入れる）

- 流すのは大人といっしょに
- 便器の中に手を入れない
- タンクのふたは開けない

## 書き方の注意

- 「すぐあとは水がほとんどない」「1〜2分補給」はサイホン式の便器の話（TOTO の取扱説明書）。どの便器でもそうだとは言わない（「べんきに よっては」）
- 便器へ足す水がタンクのどの管を通るかは確かめられていない。「タンクのほうから足す」くらいにとどめ、管の名前は出さない
- 洗い落とし式は「落ちたものを水の中に落とす」だけ確かめた。洗い落とし式で流したあとの水面の動きは言わない
- 封水深の「5〜10センチ」は船橋市の要領と国の告示（排水トラップ一般）。数字はこれだけ

## 出典（概要欄用）

- TOTO 取扱説明書 タンク密結形便器（泉佐野市掲載PDF） https://www.city.izumisano.lg.jp/material/files/group/11/207_toilet_toilet_toto.pdf
- 千葉県企業局 水道のしおり「ロータンクの構造としくみ」 https://www.pref.chiba.lg.jp/suidou/gyoumu/documents/suidousiori-202410-24-25.pdf
- 船橋市 排水設備設計施工要領 第3章 https://www.city.funabashi.lg.jp/machi/gesui/006/sekkeisekouyouryou_d/fil/ssyouryou-03.pdf
- 白井市 排水設備設計施行の手引き https://www.city.shiroi.chiba.jp/material/files/group/43/haisuisetubisekkei.pdf
- 堺市上下水道局 排水設備の資料「15 防臭トラップ」 https://water.city.sakai.lg.jp/material/files/group/6/74694451.pdf
