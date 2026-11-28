# water-strider（アメンボはどうして水の上を歩ける）動画用メモ

元記事：[アメンボは、どうして水の上を歩けるのか…](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/water-strider-walk.md)（2026-11-29 作成）
サイト：https://nozomitaguchi.github.io/everyday-trivia/t/water-strider-walk/
図：`everyday-trivia/assets/figures-strider.js`（名前は `aw-` ではじまる。いちばん上の絵は `water-strider-walk`）
色の約束：アメンボ＝ちゃいろ、みず＝みずいろ、まえあし＝あか・なかあし＝あお・うしろあし＝みどり（`aw-legs`）、おしかえす ちから＝みどりの やじるし

## 問い

アメンボは、どうして みずの うえを あるけるの？（しずまないの？）
答えの軸：**みずの おもては、ぴんと はった まくのように はたらく（ひょうめんちょうりょく）。アメンボの あしは みずの おもてを やぶらずに へこませるので、へこんだ おもてが もとに もどろうとして あしを おしかえす。あしには かみの けより ずっと ほそい けが びっしり はえて いて、みずを はじき、けの あいだに くうきを ためて いる。だから ぬれずに、まくの うえに のって いられる。**

## 見せ場

- 予想の3択の例：「アメンボは どうして しずまないの？」（からだに くうきの ふくろが あって うく／あしが みずの おもてを へこませて おしかえして もらう／とても はやく あしを うごかして いる）。正解は「へこませて おしかえして もらう」。「くうきの ふくろ」は、あしの けの あいだに くうきを ためる はなし（`aw-air`）で半分回収、「はやく うごかす」は こぐ はなし（`aw-row`）で回収。正解の番号は cast.py に従う
- **あしの さきの みずが へこむ**（`water-strider-walk`）：つかみ。よこから みると、あしの さきの まわりの みずが ぽこっと へこんで いる。「へこむ けど やぶれない」
- **みずの おもては ぴんと はった まく**（`aw-film`）：1えんだま・はっぱ・アメンボが のる。トランポリンの ような イメージ
- **へこんだ おもてが おしかえす**（`aw-dimple`）：ズームインして あしの さき。したむきに おす → みどりの やじるしで おしかえす。ここが一番の見せ場
- **1ぽんの あしで からだの 15ばい**（`aw-15x`）：くぼみが 4.38ミリに なるまで やぶれない。ブロックが 15こ つみあがる演出
- **ほそい けが びっしり**（`aw-hairs`）：あしを うんと おおきく すると、おなじ むきに ねた はりの ような け。かみのけ（くろい ふとい ぼう）と くらべる
- **ろうだけ vs けと みぞ**（`aw-wax-vs-hair`）：つるつるの ぼうでは みずが ひろがる、ほんものの あしでは みずが まんまるの つぶ。19ダイン と 152ダイン
- **なかあしで こぐ・みずの なかに うず**（`aw-row`）：なみではなく うずが おして すすむ（2003ねん MIT）
- おまけ：ジャンプも できる（やぶれる ぎりぎり てまえの ちから、`aw-jump`）、むしが おちた さざなみを まえあしで かんじる（`aw-ripple`）、あきかんの ロボット（`aw-robot`）— 時間が足りなければ省く

## 場面の順番（説明は5場面）

1. アメンボは みずの なかでは なく みずの おもてで くらす むし。あしは 6ぽんで、まえあしで つかまえ、なかあしで こぎ、うしろあしで かじを とる（`aw-name` → `aw-legs`）
2. みずの おもては ぴんと はった まくのように はたらく＝ひょうめんちょうりょく。1えんだまや はっぱも のれる（`aw-film`）
3. あしが のると おもてが へこみ、もとに もどろうとして おしかえす。1ぽんの あしで からだの やく15ばいまで ささえた（`aw-dimple` → `aw-15x`）
4. あしには ほそい けが びっしり。けと ほそい みぞで みずを はじき、けの あいだに くうきを ためる。ろうだけでは たりない（`aw-hairs` → `aw-wax-vs-hair` → `aw-air`）
5. すすむ ときは なかあしを オールのように うしろへ こぐ。みずの なかに うずが できて まえへ。ジャンプも、やぶれない ちからかげんで（`aw-row` → `aw-jump`）

みてみよう：いけや すいろで、きしから はなれて アメンボを みる。どの あしで こぐか（なかあし）、まえあしは なにを して いるか、あしの さきの みずが へこんで ひかって いるか（`aw-look`）。いえでは、コップの みずに 1えんだまを そっと うかべ、おとなに しょっきようせんざいを 1てき いれて もらうと しずむ（`aw-soap`）。

## 注意書き・言いかたの注意

- **みずべに みを のりださない・いけや かわに てを いれない・おとなと いっしょに**。「みてみよう」とおわりで必ず言う。アメンボを つかまえて ためさない
- **せんざいは おとなが いれる・くちに いれない・めに さわらない。いけや かわには せんざいを いれない**。洗剤の実験は1円玉で見せる。アメンボを洗剤の水に入れる場面は作らない（出典もなく、生きものを傷つける）
- 「ろうで うく」とは言わない。ガオとジャン（2004）は、ろうだけでは足りず、けと みぞの つくりが だいじと示した
- 「15ばい」は Gao・Jiang の実験（ゲリス・レミギスという北米の アメンボ、あし1ぽん、最大の ちから）。「どの アメンボも いつも」とは言わない
- こぐ ところは「なみで すすむ」ではなく「うずで すすむ」。秒速150センチは MIT の記事の数字（ふつうの速さは秒速60センチほど、Hu・Bush の表）
- 名前の由来は「あまい あめの ような においが するので『あめんぼう』と よばれる ように なった そう」（人と自然の博物館の記事の言いかた）。断定しすぎない
- 吹き出しの例：おとうと「あれ？ しずまないよ！」／おねえちゃん「あしの さきの みず、へこんでる！」／カメレオン（ルーペで あしの ほそい けを のぞく）

## 出典

- 森本静子「"水馬の卵" 見たことがありますか」兵庫県立人と自然の博物館『共生のひろば』9号（2012）https://www.hitohaku.jp/publication/book/kyousei9_p56.pdf
- UWM Field Station「Water Strider Revisited」（2012）https://uwm.edu/field-station/bug-of-the-week/water-strider-revisited/
- Carolina Biological Supply「Water Walkers」https://knowledge.carolina.com/timeless-tips/water-walkers/
- D. L. Hu, J. W. M. Bush「The hydrodynamics of water-walking arthropods」J. Fluid Mech. 644（2010）https://thales.mit.edu/bush/wp-content/uploads/2012/04/striders-JFM.pdf
- J. W. M. Bush「Water strider locomotion」（MIT、2003）https://thales.mit.edu/bush/index.php/2003/04/14/water-strider-locomotion-paradox-lost
- MIT News「MIT leaps to solution of walking-on-water mystery」（2003）https://news.mit.edu/2003/robostrider
- X. Gao, L. Jiang「Water-repellent legs of water striders」Nature 432, 36（2004）https://doi.org/10.1038/432036a
- Live Science「Walking on Water: Insect's Secret Revealed」https://www.livescience.com/62-walking-water-insect-secret-revealed.html
- Q. Wang ほか「Self-removal of condensed water on the legs of water striders」PNAS（2015）https://pmc.ncbi.nlm.nih.gov/articles/PMC4522788
- Harvard Gazette「Robotic insect mimics nature's extreme moves」（2015）https://news.harvard.edu/gazette/story/2015/07/robotic-insect-mimics-natures-extreme-moves/
- AAAS / EurekAlert!「Bio-inspired robots jump on water」（2015）https://www.eurekalert.org/news-releases/847510
- 田中麻奈美・柘植紀節「簡単な教材の考案、演示・解説と考察」大阪市立科学館研究報告 26（2016）https://www.sci-museum.jp/wp-content/themes/scimuseum2021/pdf/study/research/2016/pb26_097-099.pdf
