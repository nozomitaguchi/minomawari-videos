# navel（おへそ）動画用メモ

元記事：[おへそは、何のためにあるのか](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/navel-umbilical-cord.md)（2026-11-23 作成）
サイト：https://nozomitaguchi.github.io/everyday-trivia/i/navel/
図：`everyday-trivia/assets/figures-navel.js`（名前はすべて `nv-` ではじまる。いちばん上の絵は `navel-umbilical-cord`）
色の約束：さんその多い血＝あか、さんその減った血＝むらさき、さんそ・えいよう＝きいろの つぶ、いらなくなったもの＝ちゃいろの つぶ、へその緒＝うすい水色（中に赤とむらさきの線）、羊水＝水色

## 問い

おへそは、何のためにあるの？
答えの軸：**いまのおへそは、何もしていない。おへそは、ママのおなかの中にいたとき「へその緒」がついていた場所のきずあと。おなかの中は水（羊水）の中なので、口で食べたり空気を吸ったりできない。赤ちゃんは、へその緒の先の「胎盤（たいばん）」で、ママの血から酸素と栄養をもらっていた（血はまざらず、うすい膜ごしにわたす）。へその緒の中の血の道は3本で、行き1本・帰り2本。生まれて最初の息で肺がふくらむと、へその緒はいらなくなる。へその緒には神経がないので、切っても痛くない。残りは1〜2週間で乾いてポロッと取れ、そのあとがおへそになる。**

## 見せ場

- 予想の3択の例：「おへそは、なんの あと？」（ころんだ ときの きず／ママの おなかの なかで ついて いた ひもの あと／うまれた とき おした ボタン → 正解は ひもの あと）。または「へその緒を きると、あかちゃんは？」（いたくて なく／いたく ない／くすぐったい → 正解は いたく ない）。正解の番号は cast.py に従う
- へその緒の切り口：白いゼリーの中に、太い血の道1本（赤）と細い血の道2本（むらさき）（`nv-cord`、`nv-vessels`）。「いきみち 1ぽん、かえりみち 2ほん」が言いやすい
- 胎盤のアップ：ママの血のプールに、赤ちゃんの「じゅうもう」がひたって、黄色いつぶ（さんそ・えいよう）だけが入っていく。血はまざらない（`nv-placenta`）
- 最初の「すーっ」で、しぼんでいた肺がふくらむ（`nv-first-breath`）
- 2つのクランプのあいだを「チョキン」。神経がないので痛くない（`nv-clamp`）
- 残りの色が きみどり → ちゃいろ → くろ → ポロッ（`nv-stump`）。とれたあとが おへそ（`nv-scar`）
- おまけ：おへその奥には、血の道だった「ひも」が今も残っていて、肝臓の方へのびている（`nv-inside`）。ひよこにもおへその穴があって、生まれたあとふさがる（`nv-chick`）。ネコのおへそは毛にかくれている（`nv-mammals`）

## 場面の順番（説明は5場面）

1. おなかの中の赤ちゃんは水（羊水）にうかんでいて、へその緒で胎盤とつながっている（`nv-in-womb`）
2. 胎盤で、ママの血から酸素と栄養をもらう。血はまざらない（`nv-placenta`）
3. へその緒の中は血の道3本。行き1本（さんそいっぱい）・帰り2本（いらなくなったものをかえす）。長さ50〜60センチ（`nv-cord`、`nv-vessels`）
4. 生まれて最初の息で肺がふくらむ → へその緒はいらなくなる → クランプでとめて切る。神経がないので痛くない（`nv-first-breath`、`nv-clamp`）
5. 残りは1〜2週間で乾いて取れる → そのきずあとが おへそ。いまのおへそは、ほとんど何もしていない（`nv-stump`、`nv-scar`、`nv-center`）

みてみよう：おふろで、自分と家族のおへそを見くらべる（くぼみ？ でっぱり？ まるい？ たてなが？）。赤ちゃんのころの写真があれば、へその緒がどこについていたか予想する（`nv-look`、`nv-innie-outie`）。

## 注意書き・言いかたの注意

- **おへその中に、指やつめ・めん棒・とがったものを入れてほじらない。洗うのは大人といっしょに、指先でやさしく。生まれたばかりの赤ちゃんのへその緒の残りにはさわらない。** 動画の「みてみよう」で必ず言う
- 「おなかの中の赤ちゃんは息をしない」とは言わない（資料には「羊水を吸いこんで呼吸の練習をする」とある）。「くうきを すえない」「さんそは たいばんで もらう」と言う
- 「ママの血が赤ちゃんに流れる」とは言わない。血はまざらず、うすい膜ごしにわたす
- へその緒の長さ50〜60センチは「妊娠中期の終わりまでに」の数字。「うまれる ときの ながさ」とは言わない。ほかの物との比べ（〜くらい）は確かめていないので、「50〜60センチ」だけを言う
- 取れるまでの日数は「1〜2しゅうかん」（MSD）。クリーブランド・クリニックは1〜3週間。動画は「1〜2しゅうかん」で
- くぼみ・でっぱりの割合（％）は確かめていない。「おとなでは でっぱりは とても すくない」まで。でっぱりを「へん」「びょうき」のように言わない。赤ちゃんの「ぽこっ」（臍ヘルニア）は動画では扱わなくてよい（扱うなら「たいてい しぜんに とじる」まで。硬貨でおさえる話はしない）
- 「へそのおの はこ」の習わしは確かめていない（inbox）。言わない
- 「おへそを とると おなかが…」のような こわがらせる言い伝えは使わない
- 吹き出しの例：おとうと「おへそって なあに？」（つかみ、おなかを見る）／おねえちゃん「いたく ないんだ！」（へその緒を切る場面）／カメレオン（ルーペで へその緒の切り口の3本をのぞく）

## 出典（概要欄用）

- MSDマニュアル家庭版「胎児の発育段階」https://www.msdmanuals.com/ja-jp/home/22-女性の健康上の問題/正常な妊娠/胎児の発育段階
- MSDマニュアル家庭版「新生児に行う出生時ケア」https://www.msdmanuals.com/ja-jp/home/23-小児の健康上の問題/新生児と乳児/新生児に行う出生時ケア
- MSDマニュアル家庭版「生後最初の数日間」https://www.msdmanuals.com/ja-jp/home/23-小児の健康上の問題/新生児と乳児/生後最初の数日間
- MSDマニュアル家庭版「小児の臍ヘルニア」https://www.msdmanuals.com/ja-jp/home/23-小児の健康上の問題/小児における消化管の病気/小児の臍ヘルニア
- Cleveland Clinic「Umbilical Cord」https://my.clevelandclinic.org/health/body/umbilical-cord
- Cleveland Clinic「Navel (Belly Button)」https://my.clevelandclinic.org/health/body/navel-belly-button
- University of Minnesota Visible Heart Lab「Fetal and Postnatal Circulation」https://www.vhlab.umn.edu/atlas/congenital-defects-tutorial/normal-cardiac-development/fetal-and-postnatal-circulation.shtml
- Washington State University「Ask Dr. Universe」2019 https://askdruniverse.wsu.edu/2019/01/11/why-do-we-have-a-belly-button/ ・2025 https://askdruniverse.wsu.edu/2025/12/18/determines-size-shape-someones-belly-button/
- Mississippi State University Extension「Stages in chick embryo development」https://extension.msstate.edu/agriculture/livestock/poultry/stages-chick-embryo-development
