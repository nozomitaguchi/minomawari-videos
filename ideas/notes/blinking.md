# blinking（まばたき）動画用メモ

元記事：[人は、どうして何回もまばたきをするのか…](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/eye-blink-why.md)（2026-11-29 作成。図鑑の「め」のページ）
サイト：https://nozomitaguchi.github.io/everyday-trivia/t/eye-blink-why/
図：`everyday-trivia/assets/figures-blink.js`（名前は `bl-` ではじまる。いちばん上の絵は `eye-blink-why`）
色の約束：なみだ＝みずいろ・あお、かわいた ところ＝ちゃいろの てんせん、あげる きんにく＝みどり、わの きんにく＝だいだい、のう＝もも、あぶら＝きいろの つぶ
なみだの回（`eye-tears-blink`、なみだの通り道と「泣くと鼻水」）とは重ねない。なみだの通り道・涙点・回数を数える話は出さない

## 問い

人は、どうして何回もまばたきをするの？
答えの軸：**目の表面は、うすい なみだの まくで おおわれている。目を開けたままにしていると、まくは ところどころ こわれて、乾いた点ができる（健康な目で10秒以上もつ。5秒以下で切れるのはドライアイの目安の1つ）。まばたきをすると、まぶたが なみだを目の表面に もう一度 広げる。まぶたは なみだを ぬりなおす ワイパー。まぶたの ふちから出る あぶらが、なみだを かわきにくくする。** ただし「数秒ごとにまばたきする理由のすべては まだわかっていない」（目をうるおすのに必要なより多い、と大阪大学の中野珠実さんらのグループ）。

## 見せ場

- 予想の3択の例：「どうして なんかいも まばたきを するの？」（めを やすませる ため／なみだを ぬりなおす ため／まつげを うごかす ため）。正解は「なみだを ぬりなおす ため」。正解の番号は cast.py に従う
- **かわいて きた → ぱちっ → ぴかぴか**：ワイパーのように まぶたが おりて、乾いた点が消える（`eye-blink-why`、`bl-film-break`、`bl-wiper`）。ここが一番の見せ場。乾いた点が少しずつ出てきて、まばたきで一気に消えるアニメにする
- **さっと とじて、ゆっくり あく**：とじるのは0.1びょうくらい、あけるのは もっと ゆっくり（`bl-down-up`）。とじる きんにく（わの きんにく）と あげる きんにくの 綱引き（`bl-muscles`）
- **まっくらに ならない ふしぎ**：起きている16時間のうち、まばたきを合わせると約1時間（`bl-hour`）。なのに気づかないのは、脳が まばたきの少し前から 見る力を弱めるから（`bl-dim`）
- **あかちゃんは ほとんど しない**：生まれてすぐは1分に2〜3回、大人は12〜20回（`bl-baby`）。わけは まだ よく わかって いない（`bl-baby-why`）

## 場面の順番（説明は5場面）

1. 目の表面には うすい なみだの まく。開けたままだと うすくなって、ところどころ切れて乾く（`bl-film-break`）。健康な目では10秒以上もつ、5秒以下で切れるのはドライアイの目安の1つ（`bl-but`。数字は図・字幕だけでもよい）
2. ぱちっ！ まぶたが なみだを ぬりなおす。ふちの あぶらで かわきにくく（`eye-blink-why`、`bl-wiper`）
3. まぶたの動き：あげる きんにくが ゆるみ、わの きんにくが しまって さっと とじる。あけるのは ゆっくり（`bl-muscles`、`bl-down-up`）。下まぶたは ほとんど動かない（`bl-lower-lid`）。物が とんでくると まもる まばたき（`bl-kinds`）
4. まばたきの あいだ まっくらに ならないのは なぜ？ 合わせると1日に約1時間なのに、脳が気づかせない（`bl-hour`、`bl-dim`）。1980年の実験（`bl-volkmann`）は時間が足りなければ省く
5. 赤ちゃんは 1分に2〜3回しか しない（`bl-baby`）。まばたきには 注意を切りかえる はたらきも あるかも（`bl-breakpoint`、`bl-switch`）— 時間が足りなければ「まだ わかって いない ことも ある」と一言で

みてみよう：おうちの人の まばたきを 前から見て、上まぶたと下まぶたの どちらが大きく動くか（`bl-look-front`）。横から見て、とじるのと あくのと どっちが速いか予想してから見る（`bl-look`）。**答えは言わない**（目で見て わかるかは確かめていない。「どっちかな？」で終える）。

## 注意書き・言いかたの注意

- **目には さわらない。指や物を 目に近づけて「まもる まばたき」を ためさない。まばたきを がまんして 目を開けたままに しつづけない**。動画の「みてみよう」で必ず言う
- 「目を休ませるため」は正解にしない（そう書いた資料はない）。注意の切りかえの話は「〜かもしれない、と考えられている」まで。「なぜ数秒ごとか」は「まだ わかって いない ことも ある」と言う
- 「なみだは まぶたが 上がるときに 広がる」とは言わない（確かめていない）。言えるのは「まばたきで なみだが 広がる」まで
- 「10秒以上もつ」は「健康な目では10秒以上」。「10秒で切れる」とは言わない。ドライアイの基準（5秒以下で、しかも目の不快感や見えにくさがある）は大人向けの補足で、ナレーションでは「すぐ かわいて しまう 目も ある」くらいでよい
- 赤ちゃんが少ない理由は「まだ よく わかって いない」。「目のすき間が小さく あぶらの層が厚い」は、1つの研究グループの考え、として図に出すだけ
- 閉じる速さは「0.1びょう くらい」「あけるのは その半分くらいの はやさ」。「まばたき1回は0.2〜0.3秒」も使える
- 吹き出しの例：おねえちゃん「にらめっこ！ まばたき しないよ！」→ ナレーターが「がまんしないでね」とひろう／おとうと「あれ？ まっくらに ならないよ？」／カメレオン（ルーペで 乾いた点を のぞく）

## 出典

- 日本眼科医会 第11回記者懇談会 資料（川島素子、2018）https://www.gankaikai.or.jp/press/20180607_1.pdf
- 順天堂大学医学部附属順天堂医院「新ドライアイ診断基準により「ドライアイ確定」患者が3割増加」（2018）https://www.juntendo.ac.jp/assets/NewsRelease20180406.pdf
- MSDマニュアル家庭版「眼の保護機能」https://www.msdmanuals.com/ja-jp/home/20-%E7%9C%BC%E3%81%AE%E7%97%85%E6%B0%97/%E7%9C%BC%E3%81%AE%E7%94%9F%E7%89%A9%E5%AD%A6/%E7%9C%BC%E3%81%AE%E4%BF%9D%E8%AD%B7%E6%A9%9F%E8%83%BD
- Willett ほか「The perceptual consequences and neurophysiology of eye blinks」Frontiers in Systems Neuroscience（2023）https://www.frontiersin.org/articles/10.3389/fnsys.2023.1242654
- Evinger ほか「Eyelid movements: Mechanisms and normal data」IOVS（1991）https://researchconnect.stonybrook.edu/en/publications/eyelid-movements-mechanisms-and-normal-data/
- 河村弘庸「瞬目反射の基礎と臨床応用」脳神経外科（1983）https://webview.isho.jp/journal/detail/abs/10.11477/mf.1436201628
- 若倉雅登「見落としがちな瞬目の異常」臨床眼科（2011）https://webview.isho.jp/journal/detail/abs/10.11477/mf.1410103505
- Thomas & Irwin「Voluntary eyeblinks disrupt iconic memory」Perception & Psychophysics（2006）https://www.ndsu.edu/fileadmin/lthomas/Thomas_Irwin_2006_.pdf
- Volkmann ほか「Eyeblinks and visual suppression」Science（1980）https://www.scilit.com/publications/91a62eb1caacf88252c98c8b08fd3bcf
- Nakano ほか「Synchronization of spontaneous eyeblinks while viewing video stories」Proc R Soc B（2009）https://pmc.ncbi.nlm.nih.gov/articles/PMC2817301/
- 大阪大学「Clarifying the role of eyeblinks and brain network activity levels」（2012）https://resou.osaka-u.ac.jp/en/research/2012/20121225_1 ／ PNAS（2013）https://pubmed.ncbi.nlm.nih.gov/23267078/
- Lawrenson ほか「Tear-film lipid layer morphology and corneal sensation in the development of blinking in neonates and infants」J Anat（2005）https://pmc.ncbi.nlm.nih.gov/articles/PMC1571478/
- Rodriguez ほか「Investigation of extended blinks and interblink intervals in subjects with and without dry eye」Clin Ophthalmol（2013）https://dash.harvard.edu/server/api/core/bitstreams/7312037c-c6c2-6bd4-e053-0100007fdf3b/content
