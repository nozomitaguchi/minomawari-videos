# bed-hair（寝ぐせ）動画用メモ

元記事：[朝起きると、どうして寝ぐせがつくのか](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/nails-hair-bedhead.md)（2026-11-28 作成）
サイト：https://nozomitaguchi.github.io/everyday-trivia/t/nails-hair-bedhead/
図：`everyday-trivia/assets/figures-bedhead.js`（名前は `bh-` ではじまる。いちばん上の絵は `nails-hair-bedhead`）。同じ「つめと かみ」の [ケラチンの記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/nails-hair-keratin.md) の図（`nh-h-bond`、`nh-nag-1`〜`nh-nag-4`）も使える
色の約束：かみ＝ちゃいろ、みず＝あおい しずく、よわい つなぎめ（水素結合）＝みどりの みじかい せん（はなれると あかい てん）、あたたかい＝オレンジ、つめたい＝みずいろ

## 問い

朝 おきると、どうして 寝ぐせが つくの？
答えの軸：**かみの中には、ぬれると はなれて、かわくと また つながる「よわい て」（水素結合）が たくさんある。ぬれた かみは ふにゃふにゃで、かわくと かちっと かたくなる。おふろの あと しめった まま ねると、頭の おもさで まくらに おされて、まがった まま かわく。すると よわい て が その形で つながって、形が のこる。それが 寝ぐせ。だから ぬらして、形を ととのえて、かわかして ひやすと なおる。**

## 見せ場

- 予想の3択の例：「ねぐせは、なにで できる？」→（よる、かみが のびるから／しめった かみが まがった まま かわくから／まくらの あぶらが つくから）。正解は「しめった かみが まがった まま かわくから」。正解の番号は cast.py に従う。「かみが のびる」「まくらの あぶら」は資料にない話なので、説明では否定もしない（正解の説明だけする）
- **よわい て が はなれる・つながる**（`bh-water-set`）：ぬれる → まげる → かわく の3コマ。みどりの て が ぱっと はなれ、まがった形で また つながるアニメが一番の見せ場
- **ぬれた かみは ふにゃふにゃ、かわくと かちかち**（`bh-glass`）：やわらかくなる さかいめの温度が、ぬれると 0℃より下、かわくと 50〜100℃まで上がる。ナレーションは「へやの おんどで、ぬれた かみは ふにゃふにゃ、かわいた かみは かちかち」でよく、温度の数字は図だけ
- **頭の おもさで まがった まま かわく**（`bh-pillow`）：パナソニックの研究所の説明そのまま
- **ねている あいだ、ごろん ごろん**（`bh-turns`）：3〜5歳は1時間に平均4.4回 姿勢をかえる（1992年の論文）。子どもの視聴者に近い数字
- **なおしかた**（`bh-fix-roots` → `bh-warm-cool`）：ぬらして、根元から毛先へ 手で のばす → あたためて のばし、ひやして 形を きめる
- 2つめの「へぇ」（時間があれば）：あめの日に 髪型が くずれるのも同じ（`bh-humid`）。頭の あぶらも 形を くずす（`bh-sebum`、マンダム）

## 場面の順番（説明は5場面）

1. かみの中の「よわい て」は、ぬれると はなれ、かわくと つながる（`bh-water-set`、または `nh-h-bond`）
2. だから ぬれた かみは ふにゃふにゃ、かわくと かちかち（`bh-glass`）
3. しめった まま ねると、頭の おもさで まがった まま かわく → 寝ぐせ（`bh-pillow`）。ねている あいだは 何回も 向きが かわる（`bh-turns`）
4. ねる前に しっかり かわかす。ドライヤーの あと、さわると しめった所が のこって いることも（`bh-damp-spots`）
5. なおしかた：ぬらす → 根元から毛先へ 手で のばす → あたためて、ひやす（`bh-fix-roots`、`bh-warm-cool`）

みてみよう：朝、鏡で 寝ぐせが どこに あるか 見て、前の夜 どっち向きで ねたかと くらべる（`bh-look-mirror`）。

## 注意書き・言いかたの注意

- **ドライヤーは 大人が つかう**（熱い風。子どもだけで使わない）。動画の「みてみよう」か なおしかたの場面で必ず言う
- 「根元を ぬらすと なおる理由」は確かめられなかった。言うのは「ぬらして、根元から毛先へ 手で のばす」（花王 リーゼの使い方）まで
- 「一晩に コップ1杯の汗」「つむじの向きで 寝ぐせの場所が決まる」は確かめていないので言わない
- 「ぬれると 髪が ○％ 太くなる」の数字は言わない（ふくらむ、だけ。Gavazzoni Dias 2015）
- 空気の しめりけで 髪が すう水の数字（65％で約13％ふえる）は Wu 1982。言うなら字幕だけ
- 吹き出しの例：おとうと「ぼくの かみ、ぴょーん！」／おねえちゃん「ぬらしたら なおるの？」／カメレオン（ルーペで かみの中の みどりの て を のぞく）

## 出典

- Panasonic ビューティ研究所「寝ぐせ悩みからの解放を目指し原因を“見える化”」https://panasonic.jp/beauty/pb-laboratory/interview-28.html
- Panasonic「乾かすだけで美髪が叶うヘアードライヤー ナノケアの最新技術に迫る」https://panasonic.jp/hair/contents/dryer/report.html
- Kaplan（2011）「Thermal styling」J. Cosmet. Sci. 62(2) https://library.scconline.org/v062n02/60
- Nakamura（2006）J. Cosmet. Sci. 57(2) https://library.scconline.org/v057n02/52
- Wu（1982）「A simple method for measurement of hair volume」J. Soc. Cosmet. Chem. 33(2) https://library.scconline.org/v033n02/39
- Gavazzoni Dias（2015）「Hair Cosmetics: An Overview」Int. J. Trichology 7(1) https://pmc.ncbi.nlm.nih.gov/articles/PMC4387693/
- 「Sleep positions and position shifts in five age groups」Sleep 15(2)（1992）https://pubmed.ncbi.nlm.nih.gov/1579788/
- マンダム ニュースリリース（2013年7月10日）https://www.mandom.co.jp/release/pdf/2013071001.pdf
- 花王 リーゼ 泡で出てくる寝ぐせ直し https://www.kao-kirei.com/ja/item/khg/liese/4901301316882/
