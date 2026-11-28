# suction-cup（吸盤はどうして壁にくっつく？）動画用メモ

元記事：[吸盤は、どうして壁にくっつくのか…](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/suction-cup-sticks.md)（2026-11-28 作成）
サイト：https://nozomitaguchi.github.io/everyday-trivia/t/suction-cup-sticks/
図：`everyday-trivia/assets/figures-suction.js`（名前は `sc-` ではじまる。いちばん上の絵は `suction-cup-sticks`）
色の約束：きゅうばん＝もも、くうきの つぶ・おす ちから＝あお、うすい くうき＝しろ、ガラス＝みずいろ、ざらざらの かべ＝はいいろがかった ちゃ

## 問い

吸盤は、どうして壁にくっつくの？（つるつるの窓にはつくのに、ざらざらの壁にはつかないのはなぜ？）
答えの軸：**吸盤は「すいついて」いるのではなく、まわりの空気に「押されて」いる。ぎゅっと押すと中の空気がふちから出ていき、手をはなすとゴムがもとのおわんの形にもどろうとする。ふちがぴったりついているので空気は入れず、中の空気はうすくなる。外のふつうの空気は強く押し、中のうすい空気は弱くしか押し返さないので、吸盤は壁へ押しつけられる。ざらざらの壁では、ふちの下にすき間が残って空気が入りこみ、中からも同じ強さで押すので落ちる。**

## 見せ場

- 予想の3択の例：「きゅうばんが かべに くっつくのは なぜ？」（きゅうばんが かべを すいこんで いるから／まわりの くうきが そとから おして いるから／ゴムが のりのように ねばねば だから）。正解は「まわりの くうきが おして いる」。正解の番号は cast.py に従う
- **おなじ きゅうばん、つるつるの まどでは ピタッ、ざらざらの かべでは ポロッ**（`suction-cup-sticks`）。つかみに使う
- **おす → シューッ → ゴムが もどる → なかが うすい**（`sc-push`、`sc-spring-back`）。くうきの つぶ（あおい てん）が ふちから にげていき、なかに 2〜3こしか のこらない アニメ
- **そとの つぶが たくさん ぶつかって おす、なかは すこし**（`sc-air-push`）。ここが一番の見せ場。あおい やじるしを たくさん
- **くうきを ぬくと、ぜんぶ ポロポロ おちる**（`sc-vacuum`。大阪市立科学館の実験、10びょうほど）。答えの決め手として見せる
- **ざらざらの すきまから くうきが しのびこむ**（`sc-gap`、`sc-seal`）
- おまけ：馬でも ひきはなせない 金属の たま（`sc-magdeburg`）、1868年の「くうきの つまみ」（`sc-needham`）、タコの きゅうばん（`sc-octopus`）— 時間が足りなければ省く

## 場面の順番（説明は5場面）

1. つるつるの まどに ピタッ、ざらざらの かべに ポロッ（`suction-cup-sticks`）。のりは ついて いない
2. おすと、なかの くうきが ふちから シューッと でて いく（`sc-push`）。てを はなすと ゴムが もとの かたちに もどろうと して、なかの くうきが うすく なる（`sc-spring-back`）
3. まわりの くうきは いつも ものを おして いる。1センチ しかくに 1キロの おもりくらい（JAXA）（`sc-1kg`）。そとは つよく、なかは よわく おすので かべに おしつけられる（`sc-air-push`）。ちょっけい 6センチの きゅうばんで 19キロまで たえた（日本機械学会）（`sc-jsme`）
4. くうきを ぬいた いれものの なかでは、きゅうばんは 10びょうほどで ぜんぶ おちた（大阪市立科学館）（`sc-vacuum`）。おして いたのは「まわりの くうき」だった
5. ざらざらの かべでは ふちに すきまが のこり、くうきが はいって なかからも おすので おちる（`sc-seal`、`sc-gap`）。せつめいしょでも、タイル・とうめいな ガラス・かがみは ◯、すりガラス・かべがみ・コンクリートは ×（`sc-surfaces`）。しばらくすると おちるのも、くうきが すこしずつ もどるから（`sc-slow-leak`）

みてみよう：おなじ きゅうばんを、とうめいな まどガラスや かがみと、すりガラスや ざらざらの かべに おしつけて、どっちに くっつくか よそうしてから たしかめる。ふちが ぴったり ついて いるかも みる（`sc-look`）。

## 注意書き・言いかたの注意

- **まどや かがみで ためす ときは おとなと いっしょに。きゅうばんに ぶらさがったり、たいじゅうを かけたり しない。きゅうばんを かおや からだに くっつけない**。動画の「みてみよう」とおわりで必ず言う
- 「すいつく」「すいこむ」と言わない。答えは「まわりの くうきが おして いる」（大阪市立科学館「吸盤の中の空気ではありません。吸盤のまわりにある空気です」）
- 「なかは しんくう（からっぽ）」と言いきらない。言えるのは「なかの くうきが うすく なる」。28キロは「なかが からっぽなら」の けいさん、じっさいは 19キロ
- 「みずを つけると くっつく わけ」は言わない（説明書に「すこしの みずで すいつきが よく なる」とあるだけで、理由は確かめていない）
- 「さむいと おちやすい」「あついと おちる」とは言わない（確かめていない）
- ニーダムの とっきょを「さいしょの きゅうばん」と言わない（最初かどうかは確かめていない）
- マクデブルクの はんきゅうは、年を言うなら「1654ねん（Physics Today）」「1657ねんに おおぜいが みた（ガリレオ博物館）」のどちらか。馬の数は「8とうずつ 2くみ」（ガリレオ博物館）
- 吹き出しの例：おとうと「ポロッて おちた！」／おねえちゃん「まどだと ピタッ だよ！」／カメレオン（ルーペで ざらざらの かべの すきまを のぞく）

## 出典

- 日本機械学会 流体工学部門「Secret of Suction Cups」https://jsme-fed.org/experiment-e/2015_10/002.html
- オーウェル・H・ニーダム「Improvement in Atmospheric Knob」US 82,629（1868）https://patents.google.com/patent/US82629A/en
- 大阪市立科学館 研究報告34号「サイエンスショー「空気パワー」実施報告」（2024）https://www.sci-museum.jp/wp-content/uploads/2025/05/osmar2024_35_ueba.pdf
- 小松・佐伯「真空デシケーターと真空ポンプを使った理科の授業」山口大学（2016）https://petit.lib.yamaguchi-u.ac.jp/26517/files/157631
- JAXA「大気圧を感じよう」補足資料 https://edu.jaxa.jp/contents/soratobi/assets/ST062%20hosoku.pdf
- 青森地方気象台「気圧の観測」（2021）https://www.data.jma.go.jp/aomori/pub-relations/pdf/saijiki/saijiki2021_05a.pdf
- SMC「真空機器 技術資料」https://ca01.smcworld.com/catalog/BEST-technical-data/pdf/Vacuum-Common.pdf
- SMC「真空パッドの選定 理論リフト力」https://cdn.smcworld.com/assets/products/pickup/ja-jp/vacuum_device/select/4-P0026.pdf
- SMC「真空機器 トラブルに関するお問合せ」https://www.smcworld.com/products/pickup/ja-jp/vacuum_device/faq_trouble
- 無印良品「アルミフック 吸盤タイプ」取扱説明書 https://www.muji.com/public/media/jp/doc/item/02_4549738755494_00001.pdf
- マーナ「片手で使えるティッシュケース」説明書 https://marna.jp/wp-content/uploads/2024/11/W663_info.pdf
- Physics Today「Magdeburg hemispheres」（2021）https://physicstoday.aip.org/backscatter/magdeburg-hemispheres
- ガリレオ博物館「Magdeburg hemispheres」https://catalogue.museogalileo.it/indepth/MagdeburgHemispheres.html
- イギリス王立協会「The secrets of octopus suckers」（2013）https://royalsociety.org/news/2013/secrets-octopus-suckers/
