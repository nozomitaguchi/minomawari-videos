# dog-panting（犬のハアハア）動画用メモ

元記事：[犬は、どうして舌を出してハアハアするのか…](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/dog-panting.md)（2026-11-22 作成）
サイト：https://nozomitaguchi.github.io/everyday-trivia/i/dog/
図：`everyday-trivia/assets/figures-dog.js`（名前は `dp-` ではじまる。いちばん上の絵は `dog-panting`。犬の絵は `dog(x, y, s, dir, { pant, short, sleep, red })` で描ける）
色の約束：いぬ＝ちゃいろ、ぬれた ところ・みず＝みずいろ／あお、すう いき＝あおい やじるし、だす いき＝オレンジの やじるし、ち＝あか、あつい＝オレンジ

## 問い

犬は、どうして舌を出してハアハアするの？
答えの軸：**犬が汗をかけるのは、ほぼ足の裏の肉球だけ。だから犬は、口と鼻の中のぬれたところから水をかわかして（蒸発させて）、そのときに体の熱を外へ捨てている。ハアハアのときは鼻から吸って口から出すことが多い。鼻の奥からは冷やすための水が出て、暑いと舌には血がふだんの5倍あまり流れる。ハアハアは1秒に5回くらいで、これは胸がいちばんゆれやすい「ちょうどいいリズム」なので、少ない力でたくさんの空気を動かせる。でも、むしあつい日は水がかわきにくく、ハアハアしても冷えにくい。**

## 見せ場

- 予想の3択の例：「いぬが あせを かけるのは どこ？」（からだじゅう／あしの うらの にくきゅう／したの うえ）→ 正解は にくきゅう。正解の番号は cast.py に従う。別案：「ハアハアの とき、いぬは どこから いきを すって、どこから だす？」（くちから すって くちから だす／はなから すって くちから だす／くちから すって はなから だす → はなから すって くちから だす）
- **ひとと いぬの あせ**（`dp-sweat` → `dp-paw`）：ひとは からだじゅうに あせの つぶ、いぬは にくきゅうに だけ ポツポツ。肉球のアップでカメレオンがルーペでのぞく
- **ぬれた ところから ゆらゆら**（`dp-evaporate`）：みずが かわく ときに ねつ（オレンジの やじるし）を もっていく。「プールから あがると ひんやり」と同じ
- **はなから すって、くちから ハアッ**（`dp-nose-mouth`）：あおい やじるしが はなに すいこまれ、オレンジの やじるしが したの うえを とおって でていく。ここをくり返し動かすのが一番の見せ場
- **3つの みち**（`dp-three-paths`）：すずしい・やすむ＝はなだけ → あつい・はしる＝はなと くちから だす → もっと あつい＝くちからも すう。温度計の目もりが上がると、やじるしがふえていく
- **はなの おくの みず**（`dp-nasal-gland`）：はなの あなから 2センチほど おくで、みずが ポタッ。あついほど たくさん（すずしい 0 → あつい 1じかんに 9.6グラム）
- **したに ちが 5ばい**（`dp-tongue-blood`）：すずしい ときの したの ちの すじが、あつい ときは ふとく あかくなる
- **1びょうに 5かい**（`dp-rate`）：ふだんの ゆっくりの なみと、ハアハアの こまかい なみを、時計の1秒に合わせて並べる。「ハッハッハッハッハッ」を5回
- **ブランコの リズム**（`dp-swing`）：ちょうどいい ときに おすと、ちいさな ちからで おおきく ゆれる。いぬの むねも 1びょうに 5かいが いちばん ゆれやすい
- **むしあつい ひ**（`dp-humid`）：からっと した ひは ゆらゆらが たくさん、むしあつい ひは みずの つぶで いっぱいで ゆらゆらが すこし

## 場面の順番（説明は5場面）

1. ひとは あせ、いぬは あせを ほぼ かけない。かけるのは にくきゅうだけ（`dp-sweat`、`dp-paw`）
2. みずが かわく とき ねつを もっていく（`dp-evaporate`）。いぬは くちと はなの なかの ぬれた ところ（はなの おくの ひだ・した）で それを している（`dp-wet-places`）
3. はなから すって くちから だす（`dp-nose-mouth`）。あついほど くちからも すう（`dp-three-paths`）。はなの おくからは みずが でる（`dp-nasal-gland`）、したには ちが 5ばい あまり（`dp-tongue-blood`）
4. 1びょうに 5かいの ハアハア（`dp-rate`）は、むねが いちばん ゆれやすい リズム（`dp-swing`）
5. むしあつい ひは ひえにくい（`dp-humid`）。はなの みじかい いぬは とくに にがて（`dp-short-nose`）。いぬは じめんに ちかい（`dp-ground`）— 時間が足りなければ、ねっちゅうしょうの あいず（`dp-heatstroke`）と あつい とき いがいの ハアハア（`dp-other-reasons`）は省くか一言に

みてみよう：さんぽの いぬを はなれた ところから みて、あるきはじめと はしった あとで、くちの あきかたと いきの はやさを くらべる（`dp-look-walk`）。いえに いぬが いれば、ねて いる ときの おなかの うごきを かぞえて、あそんだ あとと くらべる（`dp-look-count`）。

## 注意書き・言いかたの注意

- **しらない いぬには ちかづかない。さわる ときは かいぬしの ひとに きいてから**（千葉市）。ねて いる いぬは おこさない。動画の「みてみよう」で必ず言う
- **あつい ひの さんぽは すずしい あさや ゆうがた。くるまの なかに いぬを のこさない**（東京都・環境省）。`dp-ground` の くるまに ×じるし
- 「いぬは まったく あせを かかない」とは言わない。「あせを かけるのは ほぼ にくきゅうだけ」（鳥取県・MSD獣医マニュアル）
- 「したで ひやして いる」だけにしない。蒸発は はなの おくの ひだ・はなの まわりの すきま・したから（2025年の総説）。舌は「てつだって いる」（1976年の論文）
- 「はなから すって くちから だす」は、あつくて ハアハア して いる ときの「ほとんど」（1970年の論文）。いつもではない（すずしい ときは はなだけ、もっと あついと くちからも すう：1981年の論文）
- 「ちが 5ばい」は 20℃で やすむ とき 1ぷんに 11ミリリットル → 38℃で ハアハア 60.4ミリリットル（5.5ばい）。「5ばい あまり」と言う
- 「1びょうに 5かい」は、電球で あたためた 体重12kgほどの いぬで 1びょうに 5.33かい、むねの ゆれやすい リズムは 5.28かい（1962年の論文）。「1ぷんに 300かい いじょう」は計算した数なので、言うなら「1ぷんだと 300かいを こえる」
- ブランコは たとえ。論文の ことばは「共振（いちばん ゆれやすい リズム）で、いちばん すくない ちからで いちばん たくさんの くうき」
- うれしい ときや こうふんした ときの ハアハアは、確かめられなかったので言わない（PDSA の解説は ストレス・ふあん・いたみ・ねつ まで）
- 熱中症の あいずと すること（`dp-heatstroke`）は「おとなが する こと」として言う。こわがらせない
- 吹き出しの例：おとうと「ベロ ながーい！」／おねえちゃん「はなから すってるんだ！」／カメレオン（ルーペで にくきゅうの あせを のぞく）

## 出典

- 鳥取県「熱中症に注意！」https://www.pref.tottori.lg.jp/247386.htm
- 環境省「飼い主のみなさまへ ペットを車内に残さないで！」https://www.env.go.jp/content/900517571.pdf
- 井上快「ペットの熱中症と対策」（環境省 平成31年度熱中症対策シンポジウム）https://www.wbgt.env.go.jp/pdf/sympo/20190602_5.pdf
- 東京都保健医療局「ペットの熱中症にご注意ください！」https://www.hokeniryo.metro.tokyo.lg.jp/kankyo/aigo/doubutsu_oshirase/nettyuusyou
- MSD獣医マニュアル「The Integumentary System in Animals」https://www.msdvetmanual.com/integumentary-system/integumentary-system-introduction/the-integumentary-system-in-animals
- MSD獣医マニュアル「Resting Respiratory Rates」https://www.msdvetmanual.com/multimedia/table/resting-respiratory-rates ／「Description of Dogs」https://www.msdvetmanual.com/dog-owners/introduction-to-dogs/description-of-dogs
- Schmidt-Nielsen, Bretz, Taylor「Panting in Dogs: Unidirectional Air Flow over Evaporative Surfaces」Science 1970, doi:10.1126/science.169.3950.1102
- Goldberg, Langman, Taylor「Panting in dogs: paths of air flow in response to heat and exercise」Respir Physiol 1981 https://pubmed.ncbi.nlm.nih.gov/7280382/
- Blatt, Taylor, Habal「Thermal Panting in Dogs: The Lateral Nasal Gland…」Science 1972, doi:10.1126/science.177.4051.804
- Crawford「Mechanical aspects of panting in dogs」J Appl Physiol 1962, doi:10.1152/jappl.1962.17.2.249
- Pleschka, Krönert「Lingual blood flow and its hypothalamic control in the dog during panting」Pflügers Arch 1976, doi:10.1007/bf00583652
- do Nascimento ほか「Heat stress in domestic dogs…」Front Anim Sci 2025 https://www.frontiersin.org/journals/animal-science/articles/10.3389/fanim.2025.1679377/full
- コーネル大学獣医学部「Heatstroke: A medical emergency」https://www.vet.cornell.edu/departments-centers-and-institutes/riney-canine-health-center/canine-health-information/heatstroke-medical-emergency
- PDSA「Vet Q&A: Is my dog panting too much?」https://www.pdsa.org.uk/what-we-do/blog/vet-qa-is-my-dog-is-panting-too-much
- 千葉市「人が犬に咬まれる事故が多発しています」https://www.city.chiba.jp/hokenfukushi/iryoeisei/seikatsueisei/dobutsuhogo/040_dog_bite_prevention.html
