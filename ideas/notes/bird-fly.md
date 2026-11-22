# bird-fly（鳥が飛ぶしくみ）動画用メモ

元記事：[鳥は、どうして空を飛べるのか…](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/bird-flight.md)（2026-11-22 作成）
サイト：https://nozomitaguchi.github.io/everyday-trivia/i/bird/
図：`everyday-trivia/assets/figures-bird.js`（名前は `bf-` ではじまる。いちばん上の絵は `bird-flight`）
色の約束：とり＝はいいろ（ハト）、くうき＝あおい やじるし、うく・すすむ＝みどりの やじるし、むねの きんにく＝あか、したの きんにく＝ピンク、ほね＝うすき、あたたかい くうき＝オレンジ

## 問い

鳥は、どうして空を飛べるの？
答えの軸：**つばさで空気を下と後ろへ押して、体を持ち上げ、前へ進んでいる。つばさは人の腕と手にあたるところが変わったもので、長い羽根（風切羽）がマジックテープのようにくっついて一枚の「面」になる。打ちおろすときは羽根が重なって空気を押し、打ち上げるときは羽根のあいだにすきまを開けて空気を通す（空気の抵抗を小さくする）。つばさを動かすのは、合わせて体重の5分の1ほどもある胸の筋肉。上げる筋肉も胸にあって、肩の「滑車」にすじを通して引き上げる。**

## 見せ場

- 予想の3択の例：「ハトが つばさを あげる とき、さきの はねは どうなる？」（ぴったり とじる／すきまが あく／ぜんぶ ぬける）→ 正解は すきまが あく。正解の番号は cast.py に従う。別案：「とりの むねの きんにくは、からだの どのくらい？」（10ぶんの1／5ぶんの1／2ぶんの1 → 5ぶんの1）
- **うちおろしと うちあげ**（`bf-downstroke` → `bf-upstroke`）：さきの はねが かさなって くうきを おす → ブラインドのように ひらいて くうきが すりぬける。ここをくり返し動かすのが一番の見せ場
- **ひとの うでと とりの つばさ**（`bf-arm-wing`）：同じ色で「かた〜ひじ」「ひじから さき」「て」をならべる。「つばさは うでだった！」
- **はねの マジックテープ**（`bf-velcro` → `bf-preen`）：ルーペで寄ると ちいさな かぎ。われても くちばしで ととのえると もとどおり（カメレオンのルーペの出番）
- **100このしかく**（`bf-muscle-share`）：とりは つばさの きんにくが 20こぶん、ひとの むねの きんにくは しかく はんぶん。しかくがポンポン赤くなるアニメ
- **かっしゃ**（`bf-pulley`）：したに ある きんにくが、すじを かたの あなに とおして つばさを ひきあげる。ひもと滑車のおもちゃのように見せる
- **ほねは からっぽ。でも かるすぎない**（`bf-hollow` → `bf-dense`）：てんびんで ことりと ねずみ（同じ重さの体）の ほねが つり合う、が2つめの「へぇ」
- **くるくる のぼる**（`bf-thermal`）：あたたかい くうきの はしらの中で、はばたかずに わを かく

## 場面の順番（説明は5場面）

1. つばさで くうきを したと うしろへ おす → からだが うく・すすむ（`bird-flight`）。つばさの うえと したで おす ちからが ちがう（`bf-lift`。飛行機の回と同じ考え方、と軽くふれる）
2. つばさは ひとの うでと て（`bf-arm-wing`）。ながい はねが ならんで めんに なる（`bf-feathers`）。はねは マジックテープ（`bf-velcro`、`bf-preen`）
3. うちおろしで はねが かさなって くうきを おす（`bf-downstroke`）。うちあげで すきまが あいて くうきが ぬける（`bf-upstroke`）
4. むねの おおきな きんにくと ほねの でっぱり（`bf-keel`）。からだの 5ぶんの1（`bf-muscle-share`）。あげる きんにくも むねにあって、かっしゃで ひきあげる（`bf-pulley`）
5. ほねは からっぽ、でも おもさは ねずみと おなじくらい（`bf-hollow`、`bf-dense`）。とびたつ ときは つよく ばたばた（`bf-takeoff`）、たかい ところでは くるくる（`bf-thermal`）— 時間が足りなければ、つばさの かたち（`bf-wing-shapes`）・ハチドリ（`bf-hover`）・とばない とり（`bf-flightless`）は省く。ペンギンは「つばさで およぐから むねの でっぱりが ある」が子どもに伝わりやすい

みてみよう：公園のハトを はなれた ところから見て、とびたつ ときの バタバタと、とんで しまってからの はばたきを くらべる。つばさを あげる とき、さきの はねの あいだに すきまが 見えるか さがす（`bf-look-pigeon`）。晴れた日に、空の高いところで はばたかずに わを かく 大きな鳥を さがす（`bf-look-sky`）。

## 注意書き・言いかたの注意

- **ハトに ちかづかない・おいかけない。見るだけ**（`bf-look-pigeon` に ×じるし）。**おひさまは 直接 見ない**（`bf-look-sky` に ×じるし）。動画の「みてみよう」で必ず言う
- 「鳥は骨が軽いから飛べる」とは言わない。骨は中が空っぽのものもあるが、密度は高く、骨格の重さは同じ体重のネズミのなかまと同じくらい（デュモン 2010、マサチューセッツ大学アマースト校の発表資料）。「からっぽだけど、ぎゅっと つまって かたい」と言う
- 「すきまが あく」の理由は、資料（ミネソタ州天然資源局）の「空気の抵抗を小さくするため」まで。「すきまがあるから浮く」などと言いかえない
- 「5ぶんの1」はビューウェナー（2022）の「いろいろな鳥の平均で、大胸筋17％＋烏口上筋2〜4％＝約20％」。「どの鳥も」とは言わず「とりの むねの きんにくは、からだの 5ぶんの1ほど」。人の大胸筋は約0.5％（200ぶんの1）
- 揚力の説明は「うえは おす ちからが よわく、したは つよい」まで。「上と下の空気が同時に後ろで出会う」は言わない（飛行機の記事で、まちがいと書いている）
- 羽ばたきの回数：タカ・ワシは1秒に2〜4回、ハチドリは40回より多い（ビューウェナー）
- 輪をかいて回る鳥は、資料では北アメリカのバルチャー（コンドル・ハゲワシのなかま）と一部のタカ。トビとは名指ししない（確かめられなかった）
- ペンギンは竜骨突起がある、ダチョウはない（北海道大学の講演記録：森林総合研究所 川上和人さん）
- 吹き出しの例：おとうと「バタバタ いってる！」／おねえちゃん「はねの あいだが あいた！」／カメレオン（ルーペで はねの かぎを のぞく）

## 出典

- 川上和人・島絵里子・渡辺明「鳥類学者が語る『骨から探る鳥のふしぎ』講演会およびワークショップ開催記録」（北海道大学 HUSCAP、2025）https://eprints.lib.hokudai.ac.jp/repo/huscap/all/94362/honekarasaguru.pdf
- Henderson, Kallok「How Do Birds Fly?」Minnesota Conservation Volunteer 2012年3–4月号（ミネソタ州天然資源局）https://files.dnr.state.mn.us/mcvmagazine/young_naturalists/young-naturalists-article/bird_flight/bird_flight
- Biewener「Biomechanics of avian flight」Current Biology 32: R1110–R1114（2022、ハーバード大学）https://biewenerlab.oeb.harvard.edu/resource/biewenerbiomechanicsavianflightcurrbiol2022pdf
- カリフォルニア大学古生物学博物館「Aves: More on Morphology」https://ucmp.berkeley.edu/diapsids/birds/birdmm.html
- コーネル大学鳥類学研究所 Bird Academy「How Feathers Are Built」https://academy.allaboutbirds.org/features/all-about-feathers/how-feathers-are-built.php
- マサチューセッツ大学アマースト校の発表資料「Bird bones may be hollow, but they are also heavy」（ScienceDaily、2010）https://www.sciencedaily.com/releases/2010/03/100322112103.htm（Dumont 2010, Proc. R. Soc. B, doi:10.1098/rspb.2010.0117）
- Ehrlich, Dobkin & Wheye『The Birder's Handbook』「Soaring」（1988、スタンフォード大学で公開）https://web.stanford.edu/group/stanfordbirds/text/essays/Soaring.html
