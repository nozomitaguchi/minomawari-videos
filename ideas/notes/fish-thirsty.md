# fish-thirsty（魚も水を飲む？）動画用メモ

元記事：[魚ものどがかわくのか、海の魚は海水を飲むのか…](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/fish-drink-seawater.md)（2026-11-28 作成）
サイト：https://nozomitaguchi.github.io/everyday-trivia/t/fish-drink-seawater/
図：`everyday-trivia/assets/figures-fish2.js`（名前は `fd-` ではじまる。いちばん上の絵は `fish-drink-seawater`）。2026-11-28 の追記分は `everyday-trivia/assets/figures-fishdrink.js`（`ft-esophagus`・`ft-reflex`・`ft-human`）
色の約束：うみ＝こい みずいろ、かわ（淡水）＝うすい みずいろ、みずの うごき＝あおい やじるし（からだから出る・入る水は点線）、しお＝しろい しかく、おしっこ＝きいろの しずく、きんぎょ型の魚＝オレンジ、ホルモン＝むらさきの まる、にょうそ＝みどりの まる
同じチャンネルの「魚は、どうして水の中で息ができるの？」（fish-gills）の続きとして見られる。えらの話は fish-gills にまかせ、今回は「水と しお」だけを扱う。

## 問い

魚も のどが かわくの？ 海の魚は 海の水を のむの？
答えの軸：**魚の体の水は、海水よりずっとうすい（塩のこさは海水のおよそ3分の1）。水は塩のうすいほうから こいほうへ ひっぱられるので、海の魚は いつも体の水を海に うばわれている。だから海の魚は 海水を ごくごく飲み、おなかで水だけを取りこみ（飲んだ海水の9わり）、よけいな塩は えらの とくべつな細胞から捨てる。おしっこは少し。川や池の魚は反対で、水が体に入ってくるので ほとんど飲まず、うすい おしっこを たくさん出す。**

## 見せ場

- 予想の3択の例：「うみの さかなは、うみの みずを のんで いる？」→（のまない。からだが ぬれて いるから だいじょうぶ／ごくごく のんで いる／ときどき すいめんで あめの みずを のむ）。正解は「ごくごく のんで いる」。正解の番号は cast.py に従う。「あめの みず」は資料にない話なので、選択肢でだけ使い、説明では否定もしない（「うみの みずを のんで いる」とだけ言う）。気になるなら「えらで のむ」など別のものにかえる
- **しおの コップ3つ**：かわの みず（しお なし）／さかなの からだ（すこし）／うみの みず（たくさん）（`fd-salt-compare`）。しおの しかくが ポンポン増えるアニメ
- **みずが ひっぱられる**：まんなかの かべを はさんで、うすい ほうから こい ほうへ 水が動く（`fd-osmosis`）
- **うみの さかなの からだから 水が にげる**（`fd-sea-water-out`）→ だから **ごくごく のむ**（`fd-sea-drink`、おなかで水を すいとる）→ **しおを えらから ぽいっ**（`fd-chloride-cell`、むらさきの細胞から しおが そとへ）。この3つの流れが一番の見せ場
- **川の さかなは はんたい**（`fd-fresh`）：水が入ってくる → のまない → おしっこ たくさん。くらべは `fd-sea-urine`（おしっこ すこし／たくさん）か、いちばん上の `fish-drink-seawater` を左右に並べる
- **ウナギと サケは きりかえる**（`fd-eel-switch`）：川では のまない、海では のむ
- **サメは「にょうそ」で うみと おなじ こさ**（`fd-shark`）：2つめの「へぇ」。時間が足りなければ省く
- （追記）**のどの さきで しおを ぬく**（`ft-esophagus`）：飲んだ海水は、腸に着く前に食道で しおだけが抜かれて こさが はんぶんに。食道は水を通さない（竹井祥郎さんの解説）。「ごくごく → しおを ぬく → おなかで みずを もらう」の3段にできる
- （追記）**「のどが かわいた」では なく、はんしゃで ごくん**（`ft-reflex`）：題名の問いへの答えに使える。陸の動物は前の脳で「渇き」を感じて飲むが、魚は脳の うしろ（延髄の最後野）が命令する、のみこむ反射で飲む（竹井さんの科研費報告 2009年度、カタヤマさんたちの論文 2018年）
- （追記）**ひとは うみの みずを のんじゃ だめ**（`ft-human`）：人の腎臓は海水より こい おしっこを作れないので、飲むと体の水が もっと へる（NOAA）。おわりの「みてみよう」の注意につなげる

## 場面の順番（説明は5場面）

1. 魚の体の水は、海水よりずっとうすく、川の水よりは こい（`fd-salt-compare`）
2. 水は しおの うすい ほうから こい ほうへ ひっぱられる（`fd-osmosis`）。だから海の魚は 体の水が 海へ にげる（`fd-sea-water-out`）
3. だから海の魚は 海水を ごくごく飲んで、おなかで水だけ取りこむ。しおは えらから捨て、おしっこは少し（`fd-sea-drink`、`fd-chloride-cell`、`fd-sea-urine`）
4. 川の魚は はんたい。水が入ってくるので ほとんど飲まず、うすい おしっこを たくさん。足りない しおは えらで取りこむ（`fd-fresh`、`fd-fresh-gill`）
5. ウナギや サケは 川と海で やりかたを きりかえる（`fd-eel-switch`）。サメは体に「にょうそ」をためて、海の水と おなじくらいの こさにする（`fd-shark`）

「のどが かわく？」への答え方：飲むかどうかは、血の中の「ホルモン」という しらせが 頭（脳の「さいごや」）に とどいて決まる（`fd-brain-signal`、`fd-swallow`）。魚は口の中にいつも水があるので、「ごくん」と のみこむだけで飲める。**研究では、水の中の魚は 人のように前の脳で「のどが かわいた」と感じて飲むのではなく、脳の うしろの命令で反射的に のみこむ、と報告されている**（`ft-reflex`。竹井さんの科研費報告 2009年度「前脳に作用して『渇き』という動機づけにより飲水する陸上動物と異なる」、カタヤマさんたち 2018年）。ナレーションは「さかなは『のどが かわいた』と おもって のむのでは なく、あたまの うしろの めいれいで、ごくんと のむ」。「魚は何も感じていない」とまでは言わない。

みてみよう：水族館で「うみの さかな」と「かわの さかな」の水そうが わかれているか、ふだを見くらべる。ウナギや サケの水そうは どちらにあるか さがす（`fd-look-aquarium`）。

## 注意書き・言いかたの注意

- **ガラスは たたかない。家の金魚の水に しおや 海水を入れて ためさない**。動画の「みてみよう」で必ず言う（金魚を水から出さない、も入れてよい）
- **海で あそぶときは、口に入った海の水を のみこまない**（`ft-human` の場面を入れるとき）
- 「3分の1」は東京大学 金子豊二さんの資料（魚類の血液浸透圧は一部の例外を除き海水のおよそ1/3）。0.9％・3.5％・0.1％未満は同じ先生の講義資料。ナレーションは「うみの みずより ずっと うすい」でよく、数字は字幕か図だけ
- 「飲んだ海水の90％を腸で吸収」は東大大気海洋研究所 竹井祥郎さんの科研費報告書（英文要約）。子ども向けには「おなかで みずだけ とりこむ」
- 魚が1日にどれだけ飲むかの数字は言わない（確かめていない）
- 「淡水魚は まったく飲まない」とは言わない。資料は「ほとんど飲まない」（白浜水族館・金子さん）
- サメ・エイの体の水は海水と「ほぼ同じ」（静岡大）〜「少しこい」（Hammerschlag 2006）。「サメは海水を飲まない」とは言わない（確かめきれていない）
- 「すべての魚」ではなく「多くの魚は海か川のどちらかでしかくらせない」（白浜水族館）
- 吹き出しの例：おとうと「さかなも のむの？」／おねえちゃん「しょっぱく ないの？」／カメレオン（ルーペで えらの むらさきの細胞をのぞく）

## 出典

- 金子豊二「海水魚のエラからセシウムが排出される」（東京大学）https://www.a.u-tokyo.ac.jp/rpjt/event/20120526-7.pdf
- 金子豊二「魚におけるカリウムおよびセシウムの取込みと排出」（東京大学 講義資料）https://www.agc.a.u-tokyo.ac.jp/fg6/pdf/14060201_fg6.pdf
- 京都大学白浜水族館「海水魚と淡水魚」https://www.seto.kyoto-u.ac.jp/shirahama_aqua/wp-content/uploads/2023/03/kaisuigyo-tansuigyo.pdf
- 竹井祥郎ほか「魚類の海水適応を支配する脳と腸の内分泌相関」科研費 研究成果報告書（東京大学大気海洋研究所）https://kaken.nii.ac.jp/ja/report/KAKENHI-PROJECT-23247010/23247010seika
- 安藤正昭・椋田崇生「海水ウナギにおける“渇き”から“飲水”までの内分泌系及び神経系」科研費 研究成果報告書（広島大学）https://kaken.nii.ac.jp/en/report/KAKENHI-PROJECT-19570069/19570069seika
- 椋田崇生「ウナギの飲水行動を調節している神経回路網の探索」（広島大学 学位論文要旨、2003）https://www.hiroshima-u.ac.jp/system/files/37595/10mukuda2003.pdf
- Macmillan Learning 生物学教科書（morris2e 41章6節）https://digfir-published.macmillanusa.com/morris2e/morris2e_ch41_6.html
- 高知大学「魚類の浸透圧調節」https://www.kochi-u.ac.jp/w3museum/Fish_Labo/Member/Endoh/fish_diversity/20171110_fish_diversity_migration01.pdf
- 日下部誠「海水魚と淡水魚を同じ水槽で飼うためには？」（静岡大学）https://www.sci.shizuoka.ac.jp/sci/wp-content/uploads/2021/06/20171019_02.pdf
- N. Hammerschlag（2006）「Osmoregulation in elasmobranchs」Marine and Freshwater Behaviour and Physiology 39(3) https://sharkresearch.earth.miami.edu/wp-content/uploads/2018/09/Osmoregulation-in-elasmobranchs-a-review-for-fish-biologists-behaviourists-and-ecologists.pdf
- 竹井祥郎「魚類の体液調節のしくみ －海水環境への適応機構－」（ソルト・サイエンス研究財団）https://www.saltscience.or.jp/images/2023/07/2-takei.pdf
- Takei（2021）Zoological Letters 7: 10 https://pmc.ncbi.nlm.nih.gov/articles/PMC8215749/
- 竹井祥郎「水生から陸生にともなう飲水機構の進化」科研費 研究成果報告書（2009年度）https://kaken.nii.ac.jp/ja/report/KAKENHI-PROJECT-19207005/19207005seika
- Katayama ら（2018）Frontiers in Physiology 9: 1112 https://frontiersin.org/journals/physiology/articles/10.3389/fphys.2018.01112/full
- Nobata・Takei（2022）Journal of Experimental Biology 225: jeb244094 https://cob.silverchair.com/jeb/article/doi/10.1242/jeb.244094/275264/am/Circulating-Isotocin-not-Angiotensin-II-is-the
- NOAA「Can humans drink seawater?」https://oceanservice.noaa.gov/facts/drinksw.html
