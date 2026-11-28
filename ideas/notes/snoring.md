# snoring（いびき）動画用メモ

元記事：[寝ているとき、どうしていびきをかくのか…](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/snoring-sleep.md)（2026-11-29 作成）
サイト：https://nozomitaguchi.github.io/everyday-trivia/t/snoring-sleep/
図：`everyday-trivia/assets/figures-snoring.js`（名前は `sn-` ではじまる。いちばん上の絵は `snoring-sleep`。あたまの だんめんの部品 `headCut` は おきて いる／ねむって いる／へんとうの おおきさ を切りかえられる）
色の約束：くうきの とおりみち＝みずいろ、した＝もも、のどの やわらかい ところ（なんこうがい・のどちんこ）＝こい もも、へんとう・アデノイド＝むらさき、ふるえ・おと＝だいだい、くうきの ながれ＝あお

## 問い

寝ているとき、どうしていびきをかくの？（起きているときは、どうして出ないの？）
答えの軸：**ねむると、のどの筋肉がゆるんで、舌が口のおくへ下がる。空気の通り道がせまくなり、そこを息がいきおいよく通ると、のどのかべや やわらかいところ（のどちんこのあたり）がブルブルふるえる。そのふるえが「グーッ、ガーッ」の音。あおむけだと舌が後ろへたおれやすいので、いびきが大きくなりやすい。子どもは、のどのおくの「へんとう」と鼻のおくの「アデノイド」が2〜6歳でいちばん大きいので、いびきをかくことがある。**

## 見せ場

- 予想の3択の例：「いびきの おとは どこから でて いる？」（はなの あなが なって いる／のどの やわらかい ところが ふるえて いる／おなかが なって いる）。正解は「のどの やわらかい ところが ふるえて いる」。正解の番号は cast.py に従う。※「はな」「おなか」はちがう答えとして出すだけ
- **おきて いる vs ねむって いる**：同じ あたまの だんめんで、ねむると したが すーっと おくへ さがって、みずいろの とおりみちが ほそく なる（`sn-awake-asleep`）。ここが一番の見せ場。舌が下がるアニメにする
- **ブルブル**：ほそい みちを くうきが とおると、のどちんこの あたりが ブルブル（`sn-vibrate`）。ホースを ほそく すると びゅーっと いきおいが つよく なる（`sn-narrow-flow`）
- **あおむけ と よこむき**：あおむけで「ガーッ」、ごろんと よこむきで「すー」（`sn-back-side`）。パジャマの せなかに テニスボールを ぬいつける くふう（`sn-tennis-ball`）は絵として楽しい
- **こどもの のどの へんとう**：くちを あけると みえる ひだりと みぎの へんとう、はなの おくの アデノイド（`sn-tonsils`）。2〜6さいで いちばん おおきい（`sn-tonsil-age`）。「みている きみたちの へんとうも いま いちばん おおきい ころ」と言える

## 場面の順番（説明は5場面）

1. お父さんが ねると「グーッ、ガーッ」（`snoring-sleep`）。音は のどの やわらかい ところが ふるえる音（`sn-vibrate`、`sn-throat-parts`）
2. 起きているときと ねむっているときの のど：ねむると 筋肉が ゆるみ、舌が おくへ さがって 通り道が ほそくなる（`sn-awake-asleep`）
3. ほそい みちほど 空気の いきおいが つよい → ブルブル → いびき（`sn-narrow-flow`、`sn-vibrate`）
4. あおむけだと 大きくなりやすい、よこむきで しずかに なることも（`sn-back-side`、`sn-tennis-ball`）。かぜで 鼻が つまっても いびきが出る（`sn-cold`）
5. 子どもの へんとうと アデノイドは 2〜6さいで いちばん大きい → 子どもも いびきを かくことがある（`sn-tonsils`、`sn-tonsil-age`）。いびきの とちゅうで 息が とまるときは、大人が お医者さんに（`sn-apnea`）

みてみよう：家族が いびきを かいているとき、あおむけと よこむきで 音が どう ちがうか、そっと 耳を すます（`sn-look`）。

## 注意書き・言いかたの注意

- **ねている人の 口や 鼻を ふさがない。体を おしたり、むりに 起こしたりしない**。動画の「みてみよう」で必ず言う
- **いびきの とちゅうで 息が 止まる・苦しそう・「フガッ」と あえぐ ときは、大人が お医者さんに そうだん**（MedlinePlus・NHLBI・アメリカ小児科学会）。こわがらせないよう「かぜの ときだけの いびきは しんぱいが すくない」（AAP）と先に言う
- 子どもの 睡眠時無呼吸の ようす（おねしょ・おちつきが ない など、`sn-kid-signs`）は、子どもが「自分は病気？」と不安になりやすいので動画ではふれなくてよい。言うなら親向けに字幕で
- 「いびきが 大きいほど あぶない」とは言わない（NHLBI 2024：いちばん大きいのは せまいまま安定して息をしているとき、いちばん静かなのは息が止まっているとき）。`sn-loudness` は大人向けのおまけ
- 手術（扁桃・アデノイドをとる）の話は動画ではしない
- 「いびきは 息を すう ときに 出る」「音の高さ」は確かめていないので言わない
- 子どもの いびきの割合「100にんの うち 7にん くらい」（親の報告をまとめた研究、Lumeng & Chervin 2008）は図か字幕だけ
- 吹き出しの例：おとうと「グーッ、ガーッて なに？」／おねえちゃん「パパが ごろんと したら しずかに なった！」／カメレオン（ルーペで のどの おくを のぞく）

## 出典

- MedlinePlus「Snoring - adults」（アメリカ国立医学図書館、2025）https://medlineplus.gov/ency/patientinstructions/000720.htm
- Mayo Clinic「Snoring - Symptoms and causes」（2017）https://www.mayoclinic.org/diseases-conditions/snoring/symptoms-causes/syc-20377694
- NHLBI「Sleep Apnea - Causes and Risk Factors」（2025）https://www.nhlbi.nih.gov/health/sleep-apnea/causes-and-risk-factors
- NHLBI「Sleep Apnea in Children」（2025）https://www.nhlbi.nih.gov/health/sleep-apnea/children
- NHLBI「Does how loud you snore matter to your health?」（2024）https://www.nhlbi.nih.gov/news/2024/does-how-loud-you-snore-matter-your-health
- MSDマニュアル家庭版「小児における扁桃とアデノイドの腫れ」（2025）https://www.msdmanuals.com/ja-jp/home/23-小児の健康上の問題/小児の耳鼻咽喉疾患/小児における扁桃とアデノイドの腫れ
- Marcus ほか「Diagnosis and Management of Childhood Obstructive Sleep Apnea Syndrome」Pediatrics 130(3): 576–584（アメリカ小児科学会、2012）https://papers.ucalgary.ca/paediatrics//assets/osa-diagnosis-management-aap.pdf
- Lumeng & Chervin「Epidemiology of Pediatric Obstructive Sleep Apnea」Proc Am Thorac Soc 5: 242–252（2008）https://europepmc.org/api/getPdf?pmcid=PMC2645255
