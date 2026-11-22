# fridge（冷蔵庫の外があったかくなるわけ）動画用メモ

元記事：[冷蔵庫は中を冷やしているのに、どうして外があったかくなるのか…](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/fridge-warm-outside.md)（2026-11-22 作成）
サイト：https://nozomitaguchi.github.io/everyday-trivia/t/fridge-warm-outside/ （もの「れいぞうこ」 https://nozomitaguchi.github.io/everyday-trivia/i/fridge/ の中）
図：`everyday-trivia/assets/figures-fridge.js`（名前は `fr-` ではじまる。いちばん上の絵は `fridge-warm-outside`。れいぞうこ（まえから）は `fridge(x, y, w, h, { open })`、れいきゃくきは `cooler(x, y, w, h, しもの こさ)`、あっしゅくきは `comp(x, y, s)`、ファンは `fan(x, y, r)`、ねつの なみせんは `heat()`／よこむきは `heatH()`、ゆきの けっしょうは `flake()`、しずくは `drop()`、おんどけいは `thermo()` で描ける。4つの ぶひんの めぐりは `cycle('cooler'|'comp'|'cond'|'cap')` で、どれか1つに きいろの わを つけて めだたせる）
色の約束：つめたい＝あお、ねつ＝あかい なみせん・あかい つぶ。れいばいの くだは、つめたい えき＝あお → ガス＝みずいろ → あつい ガス＝あか → えき＝オレンジ

## 問い

冷蔵庫は中を冷やしているのに、どうして外があったかくなるの？
答えの軸：**冷蔵庫は冷たさを「作って」いるのではなく、中の熱を「冷媒（れいばい）」という運び役に運ばせて、横やうしろの放熱パイプから部屋へ捨てている。しかも、運ぶために使ったモーターの電気の分も熱になるので、外へ出す熱は中から運んだ熱より多い。だからドアを開けっぱなしにしても、部屋は涼しくならず、かえって温かくなる。**

## 見せ場

- 予想の3択の例：「れいぞうこの ドアを あけっぱなしに すると、へやは どうなる？」（すずしく なる／かわらない／あたたかく なる）→ 正解は「あたたかく なる」。正解の番号は cast.py に従う。または「れいぞうこの よこが あったかいのは なぜ？」（こしょう／なかの ねつを すてて いる／でんきが もれて いる）
- **なかは ひんやり、よこは ぽかぽか**（`fridge-warm-outside`）：つかみ
- **ねつを はこぶ**（`fr-heat-carry`）：なかの あかい つぶ（ねつ）が くだに のって、よこと うしろから そとへ。「つめたさを つくる」の逆転が いちばんの見せ場
- **きたいに なると ねつを うばう**（`fr-evaporate`）：プールから あがると ひんやり、と同じ
- **4つの ぶひんを ぐるぐる**（`fr-cycle-cooler` → `fr-cycle-compressor` → `fr-cycle-condenser` → `fr-cycle-capillary`）：同じ絵で、きいろの わが 1つずつ うつっていく。アニメなら くだの いろが あお→みずいろ→あか→オレンジ→あお と めぐる
- **50ど いじょうにも**（`fr-side-hot`）：アイリスオーヤマの冷蔵庫で、まわりが30℃のとき。ドアを よく あける・たくさん いれる と ほうねつが ふえる
- **たしざん**（`fr-heat-balance`）：なかの ねつ ＋ モーターの でんき ＝ そとへ だす ねつ。3択の答えあわせ
- **あけっぱなしの へや**（`fr-door-open-room`）：つめたい くうきは でて くるけど、うしろの ねつの ほうが おおい → おんどけいが あがる
- **れいとうしつと れいぞうしつ**（`fr-rooms-temp`、`fr-damper`）：同じ れいきを ダンパー（ひらいたり しまったり する いた）で わける
- **しめった くうきが はいって しもに**（`fr-door-moist`）→ **ヒーターで しもとり**（`fr-defrost`）→ **とけた みずは あっしゅくきの ねつで じょうはつ**（`fr-evap-tray`）：すてる ねつまで つかって いる、というおまけ

## 場面の順番（説明は5場面）

1. れいぞうこは、なかの ねつを そとへ はこぶ きかい（`fr-heat-carry`）。はこびやくは れいばい。きたいに なる とき ねつを うばう（`fr-evaporate`）
2. れいばいは 4つの ぶひんを ぐるぐる まわる：れいきゃくき（なかで ひやす）→ あっしゅくき（おしちぢめて あつく）→ ほうねつパイプ（ねつを すてる）→ ほそい くだ → また れいきゃくき（`fr-cycle-*`）
3. だから よこが あたたかい。まわりが 30どの とき 50ど いじょうにも（`fr-side-hot`）。すきまが ないと ねつが こもる（`fr-gap`）
4. そとへ だす ねつ ＝ なかの ねつ ＋ モーターの ぶん（`fr-heat-balance`）。ドアを あけっぱなしでも へやは すずしく ならない（`fr-door-open-room`）
5. ドアを あけると しめった くうきが はいって しもに なる。ドアは パタンと すぐ しめる（`fr-door-moist`、`fr-door-kwh`）

時間が足りなければ省く：れいとうしつと れいぞうしつの ちがい（`fr-rooms-temp`、`fr-damper`、`fr-two-coolers`）、しもとりと じょうはつざら（`fr-defrost`、`fr-evap-tray`）、すきまの でんきの りょう（`fr-gap-kwh`）。

みてみよう：れいぞうこの よこの めんと へやの かべ、どっちが あたたかいか よそうしてから、おとなに そっと さわって もらって くらべる（`fr-look-side`）。れいぞうこの うえと よこに すきまが あるか、もので ふさいで いないか みる（`fr-look-gap`）。

## 注意書き・言いかたの注意

- **さわるのは おとな。こどもは れいぞうこの うしろや したの きかいに てを いれない・さわらない**（シャープ：あっしゅくきは高温になるので直接ふれない）。動画の「みてみよう」で必ず言う
- 「50ど いじょう」は **アイリスオーヤマの冷凍冷蔵庫で、まわりの温度が30℃のとき、50℃以上になる場合がある**、という話。どの冷蔵庫でもいつも50℃とは言わない。「なる ことも ある」
- 放熱パイプの場所は機種でちがう（ダンフォス：うしろ、アイリスオーヤマ・サムスン：両側とうしろ、東芝の特許の例：冷凍室の底の下）。「よこや うしろ」と言い、「かならず よこ」とは言わない
- 「−20ど いか」「−18ど」「3〜6ど（ちゅう）」は **パナソニックの冷蔵庫** の数字。JIS の試験の温度は冷凍室−18℃以下・冷蔵室4℃以下（日本電機工業会）
- ダンパーで わける作りは **東芝の特許の冷蔵庫の例**。冷却器を2つに分けた冷蔵庫もある。「どの れいぞうこも」とは言わない
- 「ドアを あけると つめたい くうきが したから こぼれる」は確かめていないので言わない（言えるのは「しめった そとの くうきが はいる」まで。日立・三菱電機）
- 省エネの数字（あけて いる じかん 20びょう→10びょうで 1ねん 6.10キロワットじ、かいすう 2ばい→きまった かずで 10.40、すきまで 45.08）は、資源エネルギー庁の「省エネ性能カタログ 2018年冬版」に載った省エネルギーセンターの実測値。比べた条件ごと言うか、出さない
- 吹き出しの例：おとうと「よこ、あったかい！」／おねえちゃん「こしょう かな？」／カメレオン（ルーペで くだの なかの れいばいを のぞく）

## 出典

- Danfoss「How a refrigerator works - basic training」https://www.danfoss.com/en/about-danfoss/our-businesses/cooling/the-fridge-how-it-works
- パナソニック「生活スタイルに合わせて進化する冷却性能」https://panasonic.jp/reizo/quality/story02.html
- 家電 Watch「コンプレッサーとは」（2009）https://kaden.watch.impress.co.jp/docs/word/169762.html
- アイリスオーヤマ「冷凍冷蔵庫の側面が熱くなる。」https://www.irisohyama.co.jp/support/faq/detail.php?ID=201
- アイリスオーヤマ「冷凍冷蔵庫を設置する際はどのくらいの隙間が必要ですか？」https://www.irisohyama.co.jp/support/faq/detail.php?ID=1254
- Samsung UK「Why are the side walls of a Samsung refrigerator heating up?」https://www.samsung.com/uk/support/home-appliances/why-are-the-side-walls-of-a-samsung-refrigerator-heating-up/
- 日立「冷蔵庫がよく冷えない」https://kadenfan.hitachi.co.jp/support/rei/q_a/a21.html ／「冷凍室内や冷凍した食品に霜がつきます。」https://kadenfan.hitachi.co.jp/support/rei/q_a/a34.html ／「冷蔵庫内に付いた霜は取った方が良いですか？」https://kadenfan.hitachi.co.jp/support/rei/q_a/a91.html
- 三菱電機 CME「冷蔵庫内に露や霜がつく場合」（2023）https://www.mitsubishielectric.co.jp/club-me/howto/memo/2305/index.html
- シャープ「付属品のお手入れ」https://jp.sharp/support/refrigerator/mt_doc/parts_care_02.html
- 東芝の特許 JP3219692B2 https://patents.google.com/patent/JP3219692B2/ja ／ JP2000018800A https://patents.google.com/patent/JP2000018800A/ja ／ JPH11304333A https://patents.google.com/patent/JPH11304333A/ja
- Illinois Physics Van「Open Refrigerator」https://van.physics.illinois.edu/ask/listing/1790
- OpenStax『University Physics Volume 2』4.3 https://pressbooks.online.ucf.edu/osuniversityphysics2/?p=1193
- PhysLink.com Ask the Experts #149 https://www.physlink.com/Education/AskExperts/ae149.cfm
- 資源エネルギー庁 省エネ性能カタログ 2018年冬版 電気冷蔵庫 https://seihinjyoho.go.jp/frontguide/pdf/catalog/2018/winter2018_refrigerator.pdf
- 日本電機工業会「電気冷蔵庫及び電気冷凍庫のJIS改正について」https://www.meti.go.jp/shingikai/enecho/shoene_shinene/sho_energy/denki_reizoko/pdf/002_11_00.pdf
