# fish-gills（魚のえら）動画用メモ

元記事：[魚は、どうして水の中で息ができるのか…](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/fish-gills.md)（2026-11-22 作成）
サイト：https://nozomitaguchi.github.io/everyday-trivia/i/fish/
図：`everyday-trivia/assets/figures-fish.js`（名前は `fi-` ではじまる。いちばん上の絵は `fish-gills`）
色の約束：みず＝みずいろ と あおい やじるし、さんそ＝きいろの まる、ち＝あか、きんぎょ＝オレンジ、マグロ＝こん色と銀

## 問い

魚は、どうして水の中で息ができるの？
答えの軸：**水の中にも「さんそ」がとけている。でも空気よりずっと少ない（30℃の水で空気の40分の1ほど）。だから魚は、口から入れた水を えらぶたのすき間から出す「一方通行」で、たくさんの水をえらに通し続ける。えらぶたの下には赤いくしのような えらがあり、ひだがぎっしり並んでいて、うすいかべのすぐ裏を血が流れている。血と水が反対向きに流れるので、さんそを たくさん取れる。空気の中では えらがしぼんでしまうので、ほとんどの魚は水から出ると息ができない。**

## 見せ場

- 予想の3択の例：「きんぎょの くち ぱくぱく、なにを して いる？」（おみずを のんで いる／えらに おみずを とおして いきを して いる／あわを つくって いる → 正解は えらに みずを とおして いきを して いる）。正解の番号は cast.py に従う。「のんで いる」はうそとは言い切れない（海の魚は水を飲む）ので、選択肢にするなら「おみずを ごくごく のむため」とし、説明では「ぱくぱくは いきを する うごき」と言う。迷ったら別の選択肢（例：「おなかが すいた あいず」）にかえる
- **さんその つぶを数える**：同じ大きさの箱に、空気は さんそ40こ、水は1こ（`fi-oxygen`）。「みずの なかの さんそは すこし だけ」
- **30このはこ**：同じだけのさんそを取るのに、空気は箱1つ、水は箱30（`fi-much-water`）。箱がポンポン増えるアニメにする
- **口とえらぶたの かわりばんこ**：①口がひらく→水が入る（えらぶたはとじる）②口がとじる→えらぶたがひらく→水が出る（`fi-pump`）。ここは動画でくり返し動かすと気持ちいい
- **えらぶたをめくると、赤いくし**（`fi-gill-open`）→ ルーペで1本に寄ると、小さなひだがぎっしり（`fi-lamellae`）→ さらに寄ると、うすいかべの下を あかい ちのつぶが流れ、きいろの さんそが かべをぬける（`fi-thin`）。3段のズームが一番の見せ場
- **反対向きの流れ**：水は右へ、血は左へ。どこでも水のほうが さんそが多いので、最後まで移る。同じ向きだと途中で同じになって止まる（`fi-countercurrent`）。動画では、きいろの まるが下へ移っていくアニメ
- **マグロは口をあけて ずっと泳ぐ**（`fi-ram`）
- **水から出すと えらがしぼむ**：ひだが広がった えら と、くっついた えら（`fi-air-collapse`）。「くうきには さんそが たくさん あるのに、いきが できない」が2つめの「へぇ」

## 場面の順番（説明は5場面）

1. 水の中にも さんそがとけている。でも空気よりずっと少ない（`fi-oxygen`）。だから たくさんの水をえらに通す（`fi-much-water`）
2. 水は口から入って、えらぶたのすき間から出る一方通行（`fish-gills`、`fi-one-way`）。口とえらぶたが かわりばんこに動いてポンプになる（`fi-pump`）
3. えらぶたの下には赤いくしのような えら。ひだがぎっしりで、水にふれる所がとても広い（`fi-gill-open`、`fi-lamellae`）。赤いのは、うすいかべのすぐ裏を血が流れているから（`fi-thin`）
4. 血と水は反対向きに流れる。だから さんそを たくさん取れる（`fi-countercurrent`）。マグロは泳ぐいきおいで水を通す（`fi-ram`）
5. 水から出ると えらがしぼんで、さんそを取れない（`fi-air-collapse`）。空気で息をする魚もいる（ターポン、トビハゼのなかま：`fi-air-breathers`）— 時間が足りなければ省く

みてみよう：金魚やメダカの水そうを横から見て、口がとじたとき えらぶたがひらくか、かわりばんこに動くか見る（`fi-look-goldfish`）。水族館のマグロは口が少しあいたまま泳いでいるか見る（`fi-look-tuna`）。

## 注意書き・言いかたの注意

- **魚は水から出さない。水そうに手を入れない、ガラスをたたかない。見るだけ**。動画の「みてみよう」で必ず言う（`fi-look-goldfish` に ×じるし）
- 「魚は水を飲まない」とは言わない（海の魚は水を飲む：サントリー水大事典）。「ぱくぱくは いきを する うごき」と言う
- えらの数（片側いくつ）は言わない（資料がそろわなかった）
- 金魚のえらぶたが1分に何回動くか、水から出して何分生きられるか、の数字は言わない（確かめられなかった）
- 「40分の1」は30℃の水の値（FAO：空気1リットルに酸素209ミリリットル、30℃の水1リットルに5.3ミリリットル）。ナレーションは「くうきより ずっと すくない」でよく、数字は字幕か図だけにする。冷たい水ならもう少し多い
- 「30倍の水」はメトロポリタン州立大学デンバーの講義資料（空気で息をする動物と同じ酸素を得るには約30倍の水を動かす）
- 「約75％を取りこむ、人の肺の2倍」はアメリカ自然史博物館。言うなら「よんぶんの みっつ」より「ひとの はいの 2ばい」が伝わりやすい
- 「1〜2マイクロメートル」は教科書（水と赤血球の間）。子ども向けには「とても うすい かべ」で十分
- マグロ・ネズミザメ（アオザメ・ホホジロザメ）が泳ぎ続けるのは American Scientist（2005）。「サメはみんな泳ぎ続けないと死ぬ」とは言わない
- 吹き出しの例：おとうと「ぱくぱく してる！」／おねえちゃん「えらぶたが ひらいた！」（水そうの外から）／カメレオン（ルーペで えらのひだをのぞく）

## 出典

- アメリカ自然史博物館「Life in Water: Vertebrates - Breathing」https://www.amnh.org/learn-teach/resources-for-learning/hall-of-ocean-life/water-vertebrates-breathing
- FAO「Chemical features of water: 4. Dissolved Oxygen」https://www.fao.org/3/ac183e/ac183e04.htm
- メトロポリタン州立大学デンバー（Clare Hays）動物生理学の講義資料「Respiration IV – Water Breathing Animals」https://sites.msudenver.edu/haysc/biology-courses/animal-physiology-bio-3360/outline-4-bio-3360-respiration-iv-water-breathing-animals/
- Macmillan Learning『Life: The Science of Biology』第11版 48章 https://digfir-published.macmillanusa.com/life11e/life11e_ch48_14.html
- ミシガン大学 NRE422/BIO440 講義資料「Breathing」https://public.websites.umich.edu/~pwebb/NRE422-BIO440/lec09.html
- アメリカ水産学会 Fishionary「operculum」https://fishionary.fisheries.org/?p=185
- 学研「魚のえらのしくみ」（小6理科 理解シート）https://kids.gakken.co.jp/box/rika/06/pdf/B046102050.pdf
- ワシントン州立大学 Ask Dr. Universe「How do fish breathe?」（2018）https://askdruniverse.wsu.edu/2018/01/07/how-do-fish-breathe/
- アメリカ国立公園局「Blue in the Face: Breathing Underwater」https://www.nps.gov/articles/blue-in-the-face-breathing-underwater.htm
- American Scientist 93巻6号（2005）「How Tunas and Lamnid Sharks Swim」https://www.americanscientist.org/node/894
- Ong, Stevens, Wright（2007）Journal of Experimental Biology 210: 1109–1115 https://cob.silverchair.com/jeb/article-pdf/210/7/1109/1617318/1109.pdf
- （言いかたの注意の根拠）サントリー水大事典「魚と水」https://www.suntory.co.jp/eco/teigen/water/jiten/science/07/
