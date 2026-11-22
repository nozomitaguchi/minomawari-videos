# star-twinkle（ほし）動画用メモ

元記事：[星は、どうしてキラキラまたたくのか](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/star-twinkle.md)（2026-11-23 作成）
サイト：https://nozomitaguchi.github.io/everyday-trivia/i/star/
図：`everyday-trivia/assets/figures-star.js`（名前はすべて `tw-` ではじまる。いちばん上の絵は `star-twinkle`）
色の約束：夜空＝こい藍、星の光＝黄色の線、あたたかい空気＝オレンジのかたまり、つめたい空気＝水色のかたまり、空気の層（大気）＝うすい青の帯

## 問い

星は、どうしてキラキラまたたくの？
答えの軸：**星が点いたり消えたりしているのではない。星の光は、地球をつつむ空気（大気）の中を通ってくるあいだに、あたたかい空気・つめたい空気のかたまりで少しずつ曲がる（あたたかい空気はあまり曲げず、つめたい空気はよく曲げる）。かたまりはいつも上がったり下がったりして動いているので、光の曲がり方もいつも変わり、目に届く光がゆれてキラキラ見える。星はとても遠くて「点」にしか見えないのでゆれが目立つ。近い惑星は小さな円に見えるので、あまりまたたかない。空気のない月や宇宙では、星はまたたかない。**

## 見せ場

- 予想の3択の例：「ほしが キラキラ するのは なぜ？」（ほしが ついたり きえたり して いる／ちきゅうの くうきが ゆれて いる／ほしが まわって いる → 正解は くうきが ゆれて いる）。または「つきの うえから みた ほしは？」（もっと キラキラ／キラキラ しない／みえない → 正解は キラキラ しない）。正解の番号は cast.py に従う
- 星の光が空気の層に入って、オレンジと水色のかたまりで少しずつジグザグに曲がる（`tw-bend`）。かたまりが動くと光の道が変わる（`tw-bubbles`、左右に「いま」「すこし あと」）。アニメなら、かたまりを上下に動かして光の線をゆらすのが一番わかりやすい
- 光がそれて目に届かない一瞬＝「きえた！」→「また みえる」（`tw-blink`）
- 身近な同じしくみ：暑い日の道路で遠くの車がゆらゆら（`tw-road`）
- 星は「点」・惑星は「小さな円」の左右くらべ（`tw-point-disk`）
- 真上の星は空気の層を短く、地平線近くの星は長く通る → 低い星ほどキラキラ（`tw-horizon`）
- 地球の上はキラキラ、月の上はじっと光る（`tw-moon`）。だからハッブル宇宙望遠鏡は空気の上を回っている（`tw-hubble`）。「湖の底からバードウォッチング」のたとえ（`tw-lake`）も絵になる
- おまけ：すばる望遠鏡は高い山の上で、形の変わる鏡でゆれを打ち消し、レーザーで人工の星を作る（`tw-maunakea`、`tw-ao`、`tw-laser`）

## 場面の順番（説明は5場面）

1. 星の光は空気の層を通ってくる。空気には温度のちがいがあって、光は少しずつ曲がる（`tw-bend`、`tw-warm-cool`）
2. 空気のかたまりは、いつも上がったり下がったり。光の道が変わって、星がゆれる・一瞬消える（`tw-bubbles`、`tw-blink`、`tw-speckle`）。暑い道路のゆらゆらと同じ（`tw-road`）
3. 星は遠すぎて「点」。惑星は小さな円なので、あまりまたたかない（`tw-point-disk`、`tw-far`）
4. 地平線近くの星ほど、空気の中を長く通るのでよくまたたく（`tw-horizon`）
5. 空気のない月や宇宙ではまたたかない。だからハッブル宇宙望遠鏡は空気の上に（`tw-moon`、`tw-hubble`、`tw-lake`）。入れるなら、すばる望遠鏡のゆれ消し（`tw-ao`、`tw-laser`）

みてみよう：晴れた夜、大人といっしょに、高いところの星と地平線（建物や山のすぐ上）の近くの星を見くらべて、どちらがよくまたたくか予想してから確かめる。明るくてあまりまたたかないものがあったら惑星かも（`tw-look`）。

## 注意書き・言いかたの注意

- **夜は大人といっしょに見る。車の通る道では見ない。ベランダの手すりに近よらない・のぼらない。** 動画の「みてみよう」で必ず言う
- 「風が吹くと星がまたたく」とは言わない。資料で言い方が分かれる（香港天文台は「風がまたたかせるのではない」）。「あたたかい くうきと つめたい くうきの かたまりが うごく」と言う
- 「惑星はまったくまたたかない」と言わない。資料は「ふつう星ほどにはまたたかない」「あまり またたかない」まで
- 色が変わりながらまたたく話（シリウスなど）、ニュートンの話は確かめていない（inbox）。言わない
- 数字は「ハッブルは 1990ねんに うちあげ」「ちじょう やく483キロメートル」「いちばん ちかい ほしでも ひかりで 4ねん あまり」「すばるは ひょうこう 4207メートル」「レーザーで じょうくう 90キロに ほし」まで
- 星（恒星）と惑星のちがいを言うときは「ほしは たいようの ように じぶんで ひかる とおい てんたい」「わくせいは ちかくて、ちいさな まるに みえる」と短く
- 吹き出しの例：おとうと「ほしが まばたき してる！」（つかみ）／おねえちゃん「ひくい ほしの ほうが キラキラ！」（みてみよう）／カメレオン（ルーペで空気のかたまりをのぞく）
- 「お月さまがついてくる」（moon-follows-car）や月の回とつなげやすい

## 出典（概要欄用）

- 名古屋市科学館「星のまたたき（Scintillation）」https://www.ncsm.city.nagoya.jp/exhibit_files/pdf/A514.pdf
- 香港天文台「Why do stars twinkle?」https://www.hko.gov.hk/en/education/earth-science/optical-phenomena/00356-why-do-stars-twinkle.html
- ウィスコンシン大学マディソン校「Curiosities: Why do stars appear to twinkle in the night sky?」（2010年）https://news.wisc.edu/curiosities-why-do-stars-appear-to-twinkle-in-the-night-sky
- NASA APOD「Why Stars Twinkle」（2000年7月25日）https://science.nasa.gov/image-article/apod-2000-july-25-why-stars-twinkle/
- NASA「Why Have a Telescope in Space?」https://science.nasa.gov/mission/hubble/overview/why-have-a-telescope-in-space/
- NASA「30 Years Ago: Hubble Launched to Unlock the Secrets of the Universe」（2020年）https://science.nasa.gov/missions/hubble/30-years-ago-hubble-launched-to-unlock-the-secrets-of-the-universe/
- NASA「Hubble's New Shot of Proxima Centauri」（2013年）https://science.nasa.gov/missions/hubble/hubbles-new-shot-of-proxima-centauri-our-nearest-neighbor
- 国立天文台すばる望遠鏡「AO System」https://www.subarutelescope.org/Introduction/instrument/AO.html ／「Razor-sharp astronomical imaging」https://subarutelescope.org/en/about/features/17.html
- 理化学研究所「レーザーガイド星生成用レーザーのファーストライト成功」（2006年）https://www.riken.jp/medialibrary/riken/pr/press/2006/20061121_1/20061121_1.pdf
