# static-shock（冬にドアをさわるとバチッとなるわけ）動画用メモ

元記事：[冬にドアをさわると、どうしてバチッとなるのか…](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/static-shock-door.md)（2026-11-23 作成）
サイト：https://nozomitaguchi.github.io/everyday-trivia/t/static-shock-door/ （もの「せいでんき」 https://nozomitaguchi.github.io/everyday-trivia/i/static-electricity/ の中）
図：`everyday-trivia/assets/figures-static.js`（名前は `st-` ではじまる。いちばん上の絵は `static-shock-door`。プラスの つぶは `pl(x, y, r)`、マイナス（でんし）は `mi(x, y, r)`、ひばなは `spark(x1, y1, x2, y2, w)`、ひかりの ぎざぎざは `burst(x, y, r)`、ドアは `door(x, y, w, h, ノブx, ノブy)`、ノブは `knob(x, y, r)`、ゆびさす ては `handPoint(ゆびさきx, y, そでの いろ)`、かぎは `key(x, y, s, rot)`、よこむきに あるく こどもは `kidWalk()`、まえむきの こどもは `kid(x, y, s, ふくの いろ, かみのけが たつ)`）
色の約束：プラス＝あか、マイナス（でんし）＝あお、ひばな＝きいろ、みずの つぶ＝みずいろ。

## 問い

冬にドアをさわると、どうしてバチッとなるの？
答えの軸：**あるいたり ふくが こすれたり すると、マイナスの つぶ（でんし）が ひっこしして、からだに でんきが たまる。冬は くうきが かわいて いて、その でんきが にげない。きんぞくの ドアノブに ちかづくと、たまった でんきが すきまの くうきを とびこえて いっきに ながれる。これが バチッ（ちいさな かみなり）。**

## 見せ場

- 予想の3択の例：「ふゆに ドアノブで バチッと なるのは なぜ？」（ドアノブに でんきが ながれて いる／からだに たまった でんきが とびうつる／さむくて ゆびが ちぢむ）→ 正解は「からだに たまった でんきが とびうつる」。または「バチッが おきにくいのは どんな ひ？」（はれた ふゆの ひ／あめの ひ／かぜの ひ）→「あめの ひ」。正解の番号は cast.py に従う
- **さわる まえに バチッ**（`static-shock-door`、`st-air-spark`）：つかみ。ゆびが あたる まえに ひばなが とぶ、を スローで見せる
- **プラスと マイナスは おなじ かず**（`st-atom-balance`）→ **くっついて はなれると でんしが ひっこし**（`st-electron-move`）：あおい つぶが となりへ うつり、プラスと マイナスに わかれる。いちばんの見せ場
- **どっちが プラス？**（`st-series`）：かみのけ・ナイロン・ウールは プラス、ポリエステル・ゴム・アクリルは マイナス、めんは まんなか。はなれて いるほど たくさん
- **すたすた あるくと たまる**（`st-walk-carpet`）、**ゴムぞこは にがさない**（`st-shoes`）
- **しめった ひは にげる、かわいた ひは たまった まま**（`st-humidity`）：みずの つぶが でんきを はこんで いく
- **35000ボルトと 1500ボルト**（`st-volts-humidity`）：カーペットを あるいた とき、かわいた ひ と しめった ひ。ぼうグラフが ぐんと ちぢむ
- **だんぼうで からから**（`st-heater-dry`）：そとの くうきを あたためると しつど 57 → やく7（マギル大学の例）
- **ちいさな かみなり**（`st-mini-thunder`）：くもの かみなりと ドアの バチッを ならべる。かみなりの回（thunder）とつなげられる
- **ちくっと するのは 3000ボルトくらいから**（`st-feel-levels`）、**でも ながれる でんきは ほんの すこし**（`st-volts`）：こわがらせない
- **かぎの さきで タッチ**（`st-key-touch`）：おわりの「みてみよう」の前に

## 場面の順番（説明は5場面）

1. ものの なかには プラスと マイナスが おなじ かず（`st-atom-balance`）。くっついて はなれると、マイナスの つぶ（でんし）が ひっこしして、プラスと マイナスに わかれる（`st-electron-move`、`st-series`）
2. あるくと くつと ゆかが くっついたり はなれたり。からだに でんきが たまる（`st-walk-carpet`）。ゴムぞこの くつは でんきを にがさない（`st-shoes`）
3. なぜ ふゆ？ みずは でんきを とおすので、しめった ひは にげる。かわいた ふゆは たまった まま（`st-humidity`）。カーペットを あるくと、かわいた ひ 35000ボルト・しめった ひ 1500ボルト（`st-volts-humidity`）。だんぼうで もっと かわく（`st-heater-dry`）
4. きんぞくの ドアノブに ちかづくと、でんきが いっきに ながれて つりあう（`st-doorknob-jump`）。さわる まえに くうきを とびこえる（`st-air-spark`）。ちいさな かみなり（`st-mini-thunder`）
5. ちくっと するのは 3000ボルトくらいから（`st-feel-levels`）。でも ながれる でんきは ほんの すこしで、いのちに かかわらない（`st-volts`）。へらす くふう：かぎの さきで さきに さわる（`st-key-touch`）、しつどを あげる・めんの ふく・かわぞこ（`st-prevent`）

時間が足りなければ省く：帯電列（`st-series`）、だんぼうの しつど（`st-heater-dry`）、ガソリンスタンドの シート（`st-gas-pad`）。

みてみよう：かわいた ふゆの ひと あめの ひに、ぼうしを ぬいだ あと かがみで かみのけが ふわっと たつか くらべる（`st-look-hat`）。おとなが かぎの さきで さきに ドアノブに さわる ところを みる（`st-look-key`）。

## 注意書き・言いかたの注意

- **わざと バチッと させる あそびは しない**。かぎで さわるのは おとな。動画の「みてみよう」で言う
- **ガソリンスタンドでは、せいでんき じょきょ シートに さわるのも きゅうゆも おとな。こどもは きかいに ちかづかない**（静電気の火花はガソリンの蒸気に火をつけることがある。総務省消防庁・埼玉県）。ガソリンスタンドを出すなら必ず言う
- 「35000ボルト・1500ボルト」「12000ボルト・250ボルト」は **EOS/ESD協会の表の、カーペット（ビニールタイル）を歩いたときの代表的な値**。かわいた ひ＝相対湿度10〜25%、しめった ひ＝65〜90%。「いつも この かず」とは言わない
- 「しつど 57 → やく7」は **マギル大学の例**（外 −16℃ を 20℃ に あたためた とき）
- 「3000ボルトで ちくっ」は 労働安全衛生総合研究所の「静電気安全指針」をもとにした キーエンスの表と、産業安全研究所の技術資料（電撃を受ける最小はだいたい3000V）。「1000ボルトでは なにも かんじない」
- 「しつど 65% いじょうで おきにくい」は キーエンスの **目安**。「65%なら ぜったい おきない」とは言わない（EOS/ESD協会：湿度が高くても静電気は生まれる）
- からだが プラスに なるか マイナスに なるかは、ふくや ゆかの 組み合わせで かわる。「からだは いつも マイナス」とは言わない（アメリカ議会図書館はカーペットで体に電子がたまる例、キーエンスは体はプラスになりやすいとしていて、向きが食いちがう）。動画では「でんきが たまる」「つりあいが くずれる」で言う
- 「かべや きに さきに てのひらで さわる」は確かめていないので言わない（言えるのは「かぎや コインの さきで さきに きんぞくに さわる」。マギル大学）
- 「くらい へやで セーターを ぬぐと ひかる」も確かめていないので言わない
- 吹き出しの例：おとうと「いたっ！ バチッ！」／おねえちゃん「ドアノブに でんきが あるの？」／カメレオン（ルーペで でんしの ひっこしを のぞく）

## 出典

- アメリカ議会図書館「How does static electricity work?」https://www.loc.gov/everyday-mysteries/physics/item/how-does-static-electricity-work/
- 厚生労働省 職場のあんぜんサイト「静電気」https://anzeninfo.mhlw.go.jp/yougo/yougo76_1.html
- EOS/ESD Association「Fundamentals of Electrostatic Discharge, Part One」https://www.esda.org/esd-overview/esd-fundamentals/part-1-an-introduction-to-esd/
- マギル大学 Office for Science and Society「How can I stop getting static shocks?」https://www.mcgill.ca/oss/article/environment-general-science/how-can-i-stop-getting-static-shocks
- 産業安全研究所 技術資料 RIIS-TN-71-2「静電靴の抵抗値とその測定法」（1971）https://www.jniosh.johas.go.jp/publication/doc/tn/TN-71-2.pdf
- KEYENCE「Nature and Level of Static Electricity」https://www.keyence.co.uk/ss/products/static/static-electricity/basic/nature.jsp ／「Static Discharge to People」https://www.keyence.co.uk/ss/products/static/static-electricity/trouble/discharge.jsp ／「Humidity Control」https://www.keyence.co.uk/ss/products/static/static-electricity/step/humidity.jsp
- 群馬県産業技術センター「静電気とは」https://www.tec-lab.pref.gunma.jp/wp-content/uploads/info/files/11-01.pdf
- 埼玉県 危険物事故防止連絡会「静電気火災を防ぐために」https://www.pref.saitama.lg.jp/documents/80304/10935_1.pdf
- ノイズ研究所「静電気試験のポイントと対策のヒント」（2015）https://www.noiseken.co.jp/home/wp-content/uploads/2023/01/esd_tecreport1.pdf
- 総務省消防庁「セルフスタンドにおける安全な給油について」（消防の動き 2018年12月号）https://www.fdma.go.jp/publication/ugoki/items/3012_34.pdf
