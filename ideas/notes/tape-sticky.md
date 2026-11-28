# tape-sticky（テープはどうしてくっつく）動画用メモ

元記事：[テープは、どうしてペタッとくっつくのか…](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/tape-sticky.md)（2026-11-29 作成）
サイト：https://nozomitaguchi.github.io/everyday-trivia/t/tape-sticky/
図：`everyday-trivia/assets/figures-tape.js`（名前は `tape-` ではじまる。いちばん上の絵は `tape-sticky`）
色の約束：ねばねば＝きいろ、セロハン＝みずいろ、せなかの はくりざい＝あお、かみ＝うすい クリーム、ほこり＝ちゃ、あぶら＝だいだい

## 問い

テープは、どうしてペタッとくっつくの？（のりみたいに かわくのを またないのに、どうして すぐ くっつくの？）
答えの軸：**テープの うらの ねばねば（ねんちゃくざい）は、さらさらの えきたいでも、かちかちの こたいでもない「あいだ」の もの。かみの おもてには めに みえない でこぼこが あって、のせた だけでは ねばねばは でこぼこの てっぺんにしか さわらない。ゆびで こすると、やわらかい ねばねばが ぐにゃっと かたちを かえて でこぼこの そこまで はいりこむ（「ぬれる」）。すると ねばねばの つぶと かみの つぶが うんと ちかづき、つぶどうしが ひきあう ちからで くっつく。だから「おす」ことが だいじ。**

## 見せ場

- 予想の3択の例：「テープは どうして ペタッと くっつくの？」（ねばねばが かわいて かたまるから／ねばねばが かみの ちいさな でこぼこに はいりこむから／かみが テープを すいこむから）。正解は「でこぼこに はいりこむ」。「かわいて かたまる」は のりとの くらべ（`tape-glue-vs-tape`）で回収。正解の番号は cast.py に従う
- **のせた だけ vs こすると ペタッ**（`tape-sticky`）：つかみ。テープの はしが うきあがって いるのが、ゆびで こすると ぴたっと すける
- **かみを うんと おおきく すると でこぼこ**：のせた だけ＝すきまが のこる → おすと ねばねばが ぐにゃっと はいる（`tape-bumps`）。ここが一番の見せ場。ズームインの演出で
- **つぶの せかい**：はなれて いると ひきあわない、うんと ちかいと ひきあう（`tape-molecules`）。「1ミリの 100まんぶんの 1を すこし こえる くらい」まで ちかづくと
- **はがすと いとの ように のびる**（`tape-peel`）：はがす さかいめで ねばねばが びよーんと のびて ちぎれる。だから はがすのに ちからが いる
- **まいて あるのに ひきだせる**（`tape-roll`）：せなかの つるつるの くすり（はくりざい）。巻いたテープの断面を拡大
- おまけ：ほこり・あぶら・みずが はさまると ちかづけない（`tape-dust`）、さむいと ねばねばが かたく なる（`tape-cold`）、1930ねん アメリカで すきとおった テープ・1948ねん にほんで（`tape-history`）— 時間が足りなければ省く

## 場面の順番（説明は5場面）

1. のりは かわくまで まつ、テープは すぐ くっつく。ねばねばは「えきたいと こたいの あいだ」（`tape-glue-vs-tape`）。テープは うしろから せなか・セロハン・したぬり・ねばねばの かさなり（`tape-layers`）
2. かみの おもてには めに みえない でこぼこ。のせた だけでは すきま、こすると ぐにゃっと はいりこむ＝「ぬれる」（`tape-bumps`）。すこし まつと じわじわ はいって もっと くっつく（`tape-time`）
3. ちかづいた つぶどうしが ひきあう（`tape-molecules`）。ねばねばは ゴムの きの しるから とった ゴムと、きの かわから でる じゅしを まぜて つくる（`tape-rubber-resin`）
4. はがす ときは いとの ように のびて ちからを うけとめる（`tape-peel`）。ゆっくりと すばやくで ねばねばの ふるまいが ちがう（`tape-speed`）
5. まいて あるのに ひきだせるのは、せなかに ねばねばが つきにくい くすりが ぬって あるから（`tape-roll`）。ほこりや あぶらが あると くっつかない（`tape-dust`）

みてみよう：いらない かみに おなじ テープを 2ほん はる。1ぽんは ゆびで しっかり こする、もう1ぽんは のせる だけ。すこし まって はしから そっと はがし、どっちが はがれにくいか くらべる。まいて ある テープの せなか（つるつる）と ねばねばの めんも さわって くらべる（`tape-look`）。

## 注意書き・言いかたの注意

- **テープカッターの ギザギザの はに ゆびを あてない。テープを くちに いれない・かおに はらない**。「みてみよう」とおわりで必ず言う。はがす ときに かみが やぶれる ことが あるので「いらない かみで」
- 「ゆっくり はがすと かるい／はやいと おもい」とは言わない（研究では はやさで ちからが かわるが、いつも おなじ むきに かわるわけでは ないと されている）。言えるのは「ゆっくりだと えきたいの ように とろりと、すばやいと ゴムの ように ふるまう。はやさで てごたえが かわる」まで
- 「つぶどうしが ひきあう ちから」は、むずかしい なまえ（ぶんしかんりょく・ファンデルワールスりょく）を ナレーションで 言わなくてよい。距離は「0.4〜0.6ナノメートル（1ミリの 100まんぶんの 1を すこし こえる くらい）」が 出典（エイブリィ・デニソン）にある数字
- 「セロハンは き から つくる」は ニチバンの セロテープの はなし（木材パルプ）。テープ全般とは言わない。いまの外国の とうめいテープには プラスチックの ものも ある（テサは PP）
- 「4そう」と ニチバンは 書くが、層の名前は ニチバンの ページに ない。層の名前は 東京都立図書館の資料（剥離剤層・支持体・下塗り剤層・粘着剤）による「きほんの かさなり」として 言う
- 吹き出しの例：おとうと「あれ？ はじっこが ういてる！」／おねえちゃん「ゆびで こすったら ペタッて なった！」／カメレオン（ルーペで かみの でこぼこに ねばねばが はいっていく ところを のぞく）

## 出典

- 東京都立図書館 資料保存の Q&A「粘着テープ」（PDF、2022）https://www.library.metro.tokyo.lg.jp/guide/uploads/Q%26A_adhesivetape.pdf
- ニチバン「おかげさまでセロテープ® 発売70周年」（2018）https://www.nichiban.co.jp/news/2018/08_04/
- ニチバン「『セロテープ』でSDGsに貢献」https://www.nichiban.co.jp/project/cellotape-sdgs/
- ニチバン「100周年記念特集」https://www.nichiban.co.jp/corp/sustainability/feature/100th/
- テサテープ「Wikitapia 感圧接着剤（PSA）とは？」https://www.tesa.com/ja-jp/files/download/10480451,2,tesa-wikitapia-01-pressure-sensitive-adhesive.pdf
- テサテープ「Wikitapia 天然ゴム系粘着剤の特徴」https://www.tesa.com/ja-jp/files/download/10503050,1,wikitapia-06-natural-rubber-adhesive.pdf
- テサテープ「Wikitapia プライマーと剥離剤、ライナー」https://www.tesa.com/ja-jp/files/download/10488961,1,wikitapia-03-primer-release-liner.pdf
- Avery Dennison「The role of van der Waals forces in PSA」（2024）https://electrified.averydennison.com/en/home/industries/electric-vehicles/design-production-application/the-role-of-van-der-waals-forces-in-psa.html
- C. Creton「Pressure-Sensitive Adhesives: An Introductory Course」MRS Bulletin（2003）https://ccreton.spip.espci.fr/sites/ccreton.spip.espci.fr/IMG/pdf/june03_creton.pdf
- 山崎義弘・戸田昭彦「粘着テープの剥離過程で観られる時空パターン形成」京都大学数理解析研究所講究録 1522（2006）https://www.kurims.kyoto-u.ac.jp/~kyodo/kokyuroku/contents/pdf/1522-3.pdf
- 日東電工「No.515 データシート」https://www.nitto.com/jp/ja/others/products/file/datasheet/NJ_No.515_JA.pdf
- artience「低温用粘着剤」（英語版）https://www.artiencegroup.com/en/products/adhesives/topics/low-temperature.html
- Lemelson-MIT「Richard G. Drew」https://lemelson.mit.edu/resources/richard-g-drew
