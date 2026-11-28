# clock-hands（時計の針はどうして同じ速さで進む）動画用メモ

元記事：[時計の針は、どうして毎回同じ速さで進めるのか…](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/clock-hands.md)（2026-11-29 作成）
サイト：https://nozomitaguchi.github.io/everyday-trivia/t/clock-hands/
図：`everyday-trivia/assets/figures-clock.js`（名前は `ck-` ではじまる。いちばん上の絵は `clock-hands`）
色の約束：びょうしん＝あか、すいしょう＝みずいろ、モーターの じしゃく＝あか（N）と あお（S）、はぐるま＝びょうしん ももいろ・ふんしん きいろ・じしん みどり

## 問い

とけいの はりは、どうして いつも おなじ はやさで すすむの？
答えの軸：**とけいは「いつも おなじ はやさで くりかえす もの」を かぞえて いる。でんちの とけいの なかでは、すいしょうが でんきで 1びょうに 32768かい ふるえる。かいろが その かずを はんぶん、はんぶんと 15かい わると、ちょうど「1びょうに 1かい」の あいずに なる。あいずの たびに じしゃくの モーターが はんかいてん し、はぐるまが ゆっくりに して びょうしんを ひとめもり すすめる。おなじ はぐるまの つながりで、ふんしんは 60ぶんの1、じしんは その 12ぶんの1の はやさ。**

## 見せ場

- 予想の3択の例：「でんちの とけいの なかで、1びょうを きめて いるのは なに？」（ちいさな ふりこ／ふるえる すいしょう／でんちの でんきの つよさ）。正解は「ふるえる すいしょう」。「ふりこ」は むかしの とけいの はなし（`ck-pendulum`）で回収、「でんきの つよさ」は でんちが へっても はやさが かわらない（すいしょうの ふるえで きまる）ことで回収。正解の番号は cast.py に従う
- **秒針の カチッ**（`clock-hands`）：つかみ。カチッ1回を うんと スローに して、なかへ ズームイン
- **すいしょうが ブルブル 32768かい**（`ck-quartz` → `ck-fork`）：3ミリほどの ふたまたの すいしょう
- **はんぶん、はんぶん…15かい**（`ck-divide`）：一番の見せ場。32768 → 16384 → … → 2 → 1 と カードが へっていき、さいごの「1」で カチッ！ ナレーションで 数を ぜんぶ 読まず、はじめの 3つと さいごの 3つだけ 読むなど工夫する
- **じしゃくが はんかいてん**（`ck-motor`）：NとSが いれかわる たびに くるっ
- **はぐるまで 60ぶんの1・12ぶんの1**（`ck-gears` → `ck-speeds`）：ひとつの うごきが 3ぼんの はりに わかれる
- おまけ：ガリレオが みゃくで ふりこを はかった（1583ねん）、1969ねんの セイコーの すいしょうの うでどけい、1びょうは セシウムの 9192631770かい（`ck-cesium`）— 時間が足りなければ省く

## 場面の順番（説明は5場面）

1. とけいは くりかえしを かぞえる。むかしは ふりこ、いまは すいしょう（`ck-count`、必要なら `ck-pendulum`）
2. すいしょうに でんきを ながすと ふるえる。1びょうに 32768かい（`ck-quartz` → `ck-fork`）
3. はんぶん、はんぶんと 15かい わって「1びょうに 1かい」（`ck-divide`）
4. あいずの たびに じしゃくの モーターが はんかいてん → はぐるまで ゆっくり → びょうしんが 6ど すすむ（`ck-motor` → `ck-tick`）
5. はぐるまで ふんしんは 60ぶんの1、じしんは 12ぶんの1（`ck-gears` → `ck-speeds`）。1969ねんに すいしょうの うでどけい（`ck-history`）

みてみよう：かべの とけいを みあげて、びょうしんが ひとめもりずつ カチッと すすむか みる。びょうしんが 1しゅう する あいだに ふんしんが どれだけ すすむか（ひとめもり）を 予想してから たしかめる。じしんは 15ふん あけて みくらべる（`ck-look`）。

## 注意書き・言いかたの注意

- **とけいを はずしたり、でんちの ふたを あけたり するのは おとな。でんちを くちに いれない**。「みてみよう」とおわりで必ず言う
- 32768 は うでどけいの 資料（NIST・グランドセイコー・インジェニア）の数字。かべの とけいの 振動数は メーカー資料で 確かめて いないので、「でんちの とけいの おおくは」「うでどけいでは」と ぼかすか、「とけいの なかの すいしょう」と 一般に言う程度に
- 秒針が なめらかに 回る（カチッと しない）とけいも ある。「どの とけいも カチッと すすむ」とは言わない（グランドセイコーは「通常のクオーツの秒針は1秒に1ステップ」と書く）
- 1969ねんの アストロンは「世界初の量産型クオーツ腕時計」（セイコーの言いかた）。「せかいで はじめての すいしょうの とけい」ではない（水晶の時計は1927年のマリソン）
- ホイヘンスの ふりこどけいは 1657ねんに 完成（ロンバルディ）。1656ねんごろ という 資料（レヴィン）も ある。動画では「やく370ねん まえ」などと ぼかしてよい
- 吹き出しの例：おとうと「カチッ カチッて いってる！」／おねえちゃん「ながい はりは ぜんぜん うごかないね」／カメレオン（ルーペで とけいの なかの ふるえる すいしょうを のぞく）

## 出典

- NIST「Timekeeping and clocks FAQs」（2024）https://www.nist.gov/pml/time-and-frequency-division/timekeeping-and-clocks-faqs
- M. A. Lombardi「The Evolution of Time Measurement, Part 2: Quartz Clocks」（2011）https://tf.boulder.nist.gov/general/pdf/2534.pdf
- M. A. Lombardi「Celestial, Flow, and Mechanical Clocks」（2011）https://tf.nist.gov/general/pdf/2533.pdf
- J. Levine「The history of time and frequency from antiquity to the present day」（2016）https://tf.boulder.nist.gov/general/pdf/2835.pdf
- 名古屋市科学館 展示解説「S319 時計」https://www.ncsm.city.nagoya.jp/exhibit_files/pdf/S319.pdf
- Ingenia「How does that work?」https://ingenia.org.uk/articles/how-does-that-work/
- グランドセイコー「9F クオーツ」https://www.grand-seiko.com/jp-ja/collections/movement/quartz
- カシオ PRT-40C 修理マニュアル 15-3 https://www.manualslib.com/manual/1273582/Casio-Prt-40c.html?page=46
- シチズン時計 特開昭59-31470「時計の輪列」https://patents.google.com/patent/JPS5931470A/ja
- セイコー「アストロン 50周年 ストーリー」https://www.seikowatches.com/jp-ja/products/astron/special/story_qa50th_1
