# aquarium-big-fish：水族館の大きな魚は、となりの小さな魚を食べちゃわないの？

元記事：https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/fish-aquarium-tankmates.md
（サイト：https://nozomitaguchi.github.io/everyday-trivia/i/fish/#t-fish-aquarium-tankmates 、図は `assets/figures-aquarium.js`）

## 問い

水族館の大きな水そうで、サメのすぐそばを小さな魚が泳いでいる。サメは海では魚を食べるのに、どうして水そうでは食べないの？

## 答え（ひとことで）

飼育係が「サメをおなかいっぱいにする」「1匹ずつ決まった場所でごはん」「いっしょにする魚を、種類と大きさで選ぶ」をしているから。それでも、まったくゼロではないので、毎日ようすを見ている。

## 見せ場

- **おなかいっぱいのサメは、すばやい魚をわざわざ追わない**（「よく食べた捕食者は、追いかけるのをめんどうがる」とツー・オーシャンズ水族館）。まんぷくでのんびりのサメ、の絵がいちばんの笑いどころ。
- **サメにも「自分の席」がある**。決まった場所でごはんをもらう練習（ターゲット・トレーニング）をして、食べた量を毎回数える（ボルチモアの国立水族館）。ダイバーが棒で1匹ずつ、順番に（アルバカーキ）。小さな魚は、はなれたすみでごはん（トロントのリプリーズ水族館）。
- **丸のみの魚は、口に入らない魚は食べられない**。ハタのなかまは獲物を頭から丸のみ。体の高さが口の幅より大きいと飲みこめない（ジェームズ・クック大学の実験）。口の幅と、小さな魚の「せの高さ」をくらべる絵。

## 3〜6場面で説明する順番

1. つかみ：大水そう。サメのすぐそばを小さな魚の群れ。「食べちゃわないの？」（図 `fish-aquarium-tankmates`）
2. 海のサメは魚を食べる：シロワニは夜、なかまと群れをかこむ（`aq-wild-diet`）。水そうでも、魚をよく食べる大きな魚は小さな魚を食べることがある（`aq-tank-hunts`）
3. ひみつ1　おなかいっぱい：決まってごはん＋食べたようすを記録（`aq-feed-record`）→ まんぷくのサメは追わない（`aq-full-lazy`）。美ら海水族館は毎日13時と15時半、6種類のえさを切り分けて（`aq-menu`）
4. ひみつ2　1匹ずつ決まった場所で：自分の席（`aq-target`）、ダイバーが順番に（`aq-pole`）、小さな魚ははなれたすみで（`aq-apart`）
5. ひみつ3　相手を選ぶ：魚を狩るサメとはいっしょにしない／底でえさを探すサメならいっしょにできる（`aq-choose`）、口に入らない大きさ（`aq-gape`、ワニとカメの例は `aq-too-big`）
6. それでもゼロではない → だから毎日見ている（`aq-not-zero`、`aq-accidents`、`aq-watch`）。正解と「みてみよう」：えさの時間に、サメと小さな魚がどこで食べるか見る（`aq-look-feeding`）、口の幅と体の高さをくらべる（`aq-look-mouth`）

## 予想の3択の案

「水族館の小さな魚が食べられないのは、どうして？」
- サメに ごはんを たっぷり あげて いるから（正解）
- 小さな魚は サメに 見えないから
- サメは 魚が きらいだから
（正解の番号は cast.py に従う。正解に「1匹ずつ決まった場所で」「相手を選ぶ」も続けて見せる）

## 注意書き（動画に入れる）

- 水族館では **ガラスをたたかない**。えさの時間は水族館の案内で確かめる。
- 「ときどき食べられることもある」は、こわがらせない言い方で（「弱った魚が、まれに」「だから毎日ようすを見ている」）。食べられる場面そのものは描かない。

## 言ってよいこと・言わないこと

- 数字は記事にあるものだけ：ツー・オーシャンズの新しい魚50匹（2021年）、美ら海「熱帯魚の海」約200種類・毎日13時と15時半・6種類のえさ、国立水族館のブラックチップ・リーフ70種以上・サメ4種類、アルバカーキはサメ20匹以上・週1回、リプリーズはサメ週3日、ニジハタ27％・ホシゴンベ20％。
- 「どの水族館でも週◯回」のように一般化しない（水族館ごとにちがう）。ジンベエザメ（美ら海の黒潮の海）の給餌は確かめていないので出さない。
- シロワニが夜に狩るのは野生の話。水そうの照明の話は、マリンピア日本海（閉館後は照明を消す）とツー・オーシャンズ（停電で暗くなった）の例まで。

## 出典（概要欄用）

- Aquarium of the Pacific「Sand Tiger Shark」 https://aquariumofpacific.org/onlinelearningcenter/species/sand_tiger_shark
- 新潟市水族館 マリンピア日本海「海の生き物なんでも相談室」回答集 https://www.marinepia.or.jp/midokoro/entry-4297.html
- Two Oceans Aquarium（2021年9月1日） https://aquarium.co.za/news/we-just-added-50-new-fish-to-the-save-our-seas-foundation-shark-exhibit-how-do-we-stop-the-sharks-f
- 沖縄美ら海水族館「【魚たちのごはん】」（2017年6月3日） https://churaumi.okinawa/sp/blog/1496452768/
- National Aquarium「Predators and Prey Living in Harmony」（2026年2月9日） https://aqua.org/stories/2026-02-09-predators-and-prey-living-in-harmony
- ABQ BioPark「Sharks」 https://www.cabq.gov/artsculture/biopark/aquarium/exhibits/shark-tank/sharks
- Toronto Life「How Ripley's Aquarium keeps its sharks from eating anything they aren't supposed to」 https://torontolife.com/?p=311377
- Mihalitsis & Bellwood（2017）PLoS ONE 12(9): e0184679 https://doi.org/10.1371/journal.pone.0184679
