# dark-adaptation（暗い部屋で目がなれる）動画用メモ

元記事：[暗い部屋に入ると、どうしてだんだん見えてくるのか…](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/eye-dark-adaptation.md)（2026-11-29 作成）
サイト：https://nozomitaguchi.github.io/everyday-trivia/t/eye-dark-adaptation/
図：`everyday-trivia/assets/figures-darkadapt.js`（名前は `da-` ではじまる。いちばん上の絵は `eye-dark-adaptation`）
色の約束：よる・くらい へや＝こい あお、かんたい・ロドプシン＝むらさき、すいたい＝きいろ、こわれた ロドプシン＝しろ、ひかり＝きいろ

## 問い

暗い部屋に入ると、どうしてだんだん見えてくるの？（どうして、すぐには見えないの？）
答えの軸：**目の奥には、暗い所ではたらく「かんたい」という細胞がある。かんたいは光をつかまえる「ロドプシン」を持っているが、ロドプシンは明るい光を浴びるとこわれてしまう。暗い所に入ると、こわれたロドプシンを少しずつ作り直す。作り直すほど弱い光でも見えるようになるので、だんだん見えてくる。はじめの数分は色を見る「すいたい」ががんばり、10分くらいで かんたいに交代、30分くらいでいちばんよく見える。ひとみも大きくなるけれど、それだけでは足りない。**

## 見せ場

- 予想の3択の例：「くらい へやで、だんだん みえて くるのは なぜ？」（ひとみが どんどん おおきく なるから／めの なかで ひかりを つかまえる つぶを つくりなおして いるから／へやが だんだん あかるく なるから）。正解は「つぶを つくりなおして いる」。ひとみは「大きくなるけど、それだけでは足りない」で回収。正解の番号は cast.py に従う
- **0ぷん・10ぷん・30ぷん**：まっくら → うっすら → よく みえる（`da-two-steps`、`eye-dark-adaptation`）。画面全体をゆっくり明るくして体験させる
- **ロドプシンが こわれて、つくりなおされる**：むらさきの つぶが ひかりで しろく ぬける → くらい 中で むらさきに もどって いく（`da-bleach`、`da-rebuild`）。ここが一番の見せ場
- **2だんの かいだん**：さきに すいたい（すぐ とまる）→ やく 10ぷんで かんたいに バトンタッチ（`da-curve`）
- **もどるのは いっしゅん**：なれるのは 30ぷん、まぶしい ひかりで すうびょうで もとどおり（`da-light-back`）
- **くらいと いろが わからない**：あかい りんごも あおい ボールも はいいろ（`da-no-color`）
- おまけ：1943年の かいぐんの みはりばんは、30ぷん まえから あかい ゴーグル（`da-navy`）、くらい ほしは すこし わきを みると みえる（`da-averted`）— 時間が足りなければ省く

## 場面の順番（説明は5場面）

1. でんきを けすと まっくら → しばらく すると かたちが うかぶ（`eye-dark-adaptation`）。ひとみは おおきく なるけど、それだけでは たりない（`da-pupil`）
2. めの おくの 2しゅるいの さいぼう：くらい ところの かんたい、いろの すいたい（`da-two-cells`）。だから くらいと いろが わからない（`da-no-color`）
3. かんたいの「ロドプシン」が ひかりを つかまえる（`da-rhodopsin`）。あかるい ひかりで こわれる（`da-bleach`）
4. くらい ところで すこしずつ つくりなおす：7〜8ぷんで かんたいが いちばん びんかん、20〜30ぷんで ほとんど もどる（`da-rebuild`）。さきに すいたい、10ぷんで かんたいに こうたい（`da-curve`、`da-two-steps`）
5. ほしを みる ときは 15〜30ぷん まつ（国立天文台）（`da-stars-wait`）。でも あかるい ひかりを みると すうびょうで もとどおり（`da-light-back`）

みてみよう：おとなに でんきを けして もらい、すわった まま たんすや ドアが みえて くるまで かずを かぞえる。あかい ものと あおい ものの いろが わかるか くらべる（`da-look`）。

## 注意書き・言いかたの注意

- **くらい なかでは あるきまわらない。すわって じっと する。でんきを つけたり けしたり するのは おとな**。動画の「みてみよう」とおわりで必ず言う
- 「100まんばい みえるように なる」とは言わない（確かめられたのは「つよい ひかりの あとは 10まんばい あかるく ないと みえない」まで）
- 「ひとみが すうびょうで ひらく」と時間を言わない（確かめていない）。言えるのは「ひとみの おおきさは 2〜8ミリ、はいる ひかりは さいだい 16ばい、でも なれる ちからの ほんの いちぶ」
- 時間の数字は資料によって幅がある：すいたいは「すうふん」（ラムさんら）・「3ぷんほど」（ヘクトさん）、交代は「やく 10ぷん」、いちばん よく みえるのは「30ぷんほど」。ナレーションは「10ぷん くらいで かんたいに こうたい、30ぷん くらいで いちばん よく みえる」でよい
- 「あかい ひかりなら だいじょうぶ」とは言わない。言えるのは「ほしを みる ときは あかく くらく した かいちゅうでんとうを つかう（国立天文台）、でも あかい ひかりでも なれは すこし へる（アメリカかいぐんの けんきゅうじょ、1984年）」
- 「にんじんを たべると よる みえる」とは言わない。言えるのは「ビタミンAは ロドプシンの ざいりょう、たりないと くらい ところで みえにくく なる」まで（食べものの話は資料で確かめていない）
- 吹き出しの例：おとうと「まっくら！ なんにも みえない！」／おねえちゃん「あ、ドアが みえて きた！」／カメレオン（ルーペで むらさきの つぶが もどって いく かんたいを のぞく）

## 出典

- 日本眼科学会「網膜色素変性」https://www.nichigan.or.jp/public/disease/name.html?pdid=53
- HyperPhysics「The Rods and Cones of the Human Eye」（ジョージア州立大学）https://hyperphysics.gsu.edu/hbase/vision/rodcone.html
- 京都大学「カエルはいかにして『暗がりでの色覚』を獲得したのか？」（2017）https://www.kyoto-u.ac.jp/sites/default/files/embed/jaresearchresearch_results2017documents170516_101.pdf
- Cornell University「Vision Lecture」（DEA3500）https://ergo.human.cornell.edu/studentdownloads/DEA3500notes/Lighting/visionnotes.html
- 理化学研究所ほか「視覚に関わるタンパク質の超高速分子動画」（2023）https://www.riken.jp/press/2023/20230323_1/index.html
- Olman 編『Introduction to Sensation and Perception』8.6（ミネソタ大学、2022）https://open.lib.umn.edu/sensationandperception/chapter/light-transduction-draft/
- Dragoi「Visual Processing: Eye and Retina」Neuroscience Online（UTHealth、2020）https://nba.uth.tmc.edu/neuroscience/s2/chapter14.html
- Gamgee「Kühne's Researches on Photo-chemical Processes in the Retina」Nature 15（1877）https://www.nature.com/articles/015296a0.pdf
- Lamb & Pugh「Phototransduction, Dark Adaptation, and Rhodopsin Regeneration」IOVS 47(12)（2006）https://openresearch-repository.anu.edu.au/server/api/core/bitstreams/a63ddc9c-5b57-480c-bb62-e4d82db8030a/content
- York University「Dark Adaptation Function」https://www.yorku.ca/eye/darkada1.htm
- Hecht「Rods, Cones, and the Chemical Basis of Vision」Physiological Reviews 17(2)（1937）https://nature.berkeley.edu/garbelottoat/wp-content/uploads/hecht-1936.pdf
- 国立天文台「流星群の観察方法」https://www.nao.ac.jp/astro/basic/obs-meteor-shower.html
- 国立天文台「もっと詳しく観察する（ペルセウス座流星群）」（2010）https://naojcamp.nao.ac.jp/phenomena/20100811/advanced.html
- 国立天文台「2021年 ペルセウス座流星群 解説資料」（2021）https://www.nao.ac.jp/contents/astro/sky/2021/08/perseids2021-factsheet.pdf
- 環境省「冬の星空を観察してみましょう（観察方法）」（2021）https://www.env.go.jp/content/900518718.pdf
- U.S. Navy「Lookout Manual」（1943）https://www.history.navy.mil/research/library/online-reading-room/title-list-alphabetically/l/lookout-manual-1943.html
- Luria & Kobus「The Relative Effectiveness of Red and White Light for Subsequent Dark-Adaptation」NSMRL Report 1036（1984）https://apps.dtic.mil/sti/pdfs/ADA148883.pdf
- ノーベル財団「George Wald – Facts」https://www.nobelprize.org/prizes/medicine/1967/wald/facts/
