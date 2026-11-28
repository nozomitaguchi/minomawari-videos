# mosquito-winter（冬にいなくなった蚊は、春になるとどこから来る？）動画用メモ

元記事：[冬にいなくなった蚊は、春になるとどこから来るのか](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/mosquito-winter.md)（2026-11-28 作成）
図：`everyday-trivia/assets/figures-mosquito-winter.js`（名前はすべて `mw-` ではじまる。いちばん上の絵は `mosquito-winter`）
関連：[蚊にさされると、どうしてかゆくなるのか](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/mosquito-bite-itch.md)（動画 `mosquito-bite` は公開ずみ。血をすうのはメスだけ、はそちらでも言っている）

## 問い

冬にいなくなった蚊は、春になるとどこから来るの？
答えの軸：遠くから来るのではなく、**近くで冬をこしている**。こし方は種類でちがう。
- 昼にさすヒトスジシマカ → 秋に「すぐにはかえらない卵（休眠卵）」を産み、**卵のまま**水がたまる入れものの水ぎわの上で冬をこす。春（3月なかば〜5月おわり）にかえる
- 夜にさすアカイエカ → 秋に交尾をすませた**おとなのメスだけ**が、血をすわずに花のみつで脂肪をため、縁の下やほら穴にかくれて冬をこす。春にいっせいに出てくる
- ビルの地下の水そうなどにいるチカイエカ → 冬も休まない（おまけ）

## 見せ場

- つかみ：夏はあんなにいた蚊が、冬はどこにもいない。どこへ行った？（`mosquito-winter` のふゆ／はる）
- 「卵で待つ」と「おとなで待つ」の見くらべ。同じ「蚊」なのに、冬のこし方がまったくちがう（`mw-three-ways`）
- 卵は、お母さんの蚊が「日が短くなった」と感じて産みわける。夏の卵はすぐかえる、秋の卵は春まで休む（`mw-short-day`、`mw-daylight`）。卵の中ではもう体ができていて、かえる用意をしたまま待つ（`mw-egg-inside`）
- 卵は寒さにもかわきにも強い。ヨーロッパの研究ではマイナス10℃でも生きのこった（`mw-cold`）
- アカイエカのお母さんは、冬の前に血ではなく花のみつをすって、おなかに「あぶら」をためる（`mw-fat`）→ ほら穴や縁の下でじっと（`mw-hide`）
- 予想の3択の例：「冬のあいだ、蚊はどうしている？」 1. あたたかい南の国へ飛んで行っている／2. 近くで、卵やおとなのすがたでじっと待っている（正解）／3. 冬は消えて、春に水からわいてくる。cast.py の番号に正解を置く。1 がちがうことは、ヒトスジシマカが動くのは半径100mくらい（`mw-range`）で言える

## 場面の順番（説明は5場面）

1. 冬のこし方は種類でちがう。昼にさすヒトスジシマカは卵、夜にさすアカイエカはおとなのメス（`mw-three-ways`）。東京・神奈川で出る時期は、ヒトスジシマカ5〜11月、アカイエカ4〜11月（`mw-calendar`）
2. ヒトスジシマカ：秋、日が短くなると、お母さんは「休む卵」を産む。昼がおよそ13〜14時間より短くなるのが合図。長崎では10月より後の卵はぜんぶ休む卵（`mw-short-day`、`mw-daylight`）
3. 休む卵は、水がたまる入れもの（空きかん・古タイヤなど）の水ぎわの少し上にくっついて冬をこす。中で体ができたまま休み、かわきや寒さに強い（`mw-egg-place`、`mw-egg-inside`、`mw-cold`）。2月ごろ目をさまし、3月なかば〜5月おわりに水につかるとボウフラがかえる（`mw-hatch`）
4. アカイエカ：秋に交尾をすませるとオスはいなくなり、メスだけが冬をこす（`mw-autumn-mate`）。血をすわず花のみつで脂肪をためて（`mw-fat`）、縁の下やほら穴でじっと（`mw-hide`）。春になるといっせいに出てくる（`mw-spring-out`）
5. だから春の蚊は、遠くから来たのではなく、近くで冬をこしたもの。ヒトスジシマカが動くのは半径100mくらい（`mw-range`）。夏なら卵→ボウフラ→さなぎ→おとなは2週間ほど（卵約2日・ボウフラ1週間ほど・さなぎ2日ほど）（`mw-lifecycle`）

おまけ（入れるなら短く）：ビルの地下の水そうなどにいるチカイエカは冬も休まず、あたたかければ冬でも血をすう（`mw-molestus`）。1回目の卵は血をすわなくても産める（`mw-autogeny`）。熱帯のヒトスジシマカは冬がないので休まない（`mw-tropics`）。

みてみよう：冬のうちに、家のまわりで水がたまる入れもの（植木ばちの受け皿・バケツ・空きかん）を大人とさがし、水ぎわの少し上のふちを見る。卵は小さくて見つけにくいので、さわらずに見るだけ。たまった水は大人がすてると、春の蚊を減らせる（`mw-look`）。

## 注意書き・言いかたの注意

- 入れものや卵には**さわらない**、**水をすてるのは大人**、を必ず言う（みてみようの場面）
- 蚊をつかまえたり、ほら穴・縁の下・排水ますに入ったりのぞきこんだりしない（言うなら「見るのは家のまわりの入れものだけ」）
- 「すべての蚊が」と言わない。記事で確かめたのは、ヒトスジシマカ（卵）・アカイエカ（おとなのメス）・チカイエカ（休まない）の3つだけ
- 「南の国から飛んでくる蚊は1匹もいない」とは言わない（確かめていない）。言えるのは「ヒトスジシマカが動くのは半径100mくらい」まで
- 卵の「乾いたまま何か月もつか」は確かめていないので言わない。「かわきに強い」まで
- マイナス10℃はヨーロッパのヒトスジシマカの研究。日本の話として言いきらない
- アカイエカの脂肪・交尾・オスがいなくなる話は、なかま（*Culex pipiens*）の研究による。動画では「アカイエカのなかま」くらいでよい
- オスが「死ぬ」はこわがらせないよう「秋でおしまい」「いなくなる」と言う

## 出典（概要欄用）

- 東京都健康安全研究センター 蚊対策講習会資料（武藤敦彦「蚊の生態」）https://www.tmiph.metro.tokyo.lg.jp/files/kj_kankyo/mosq/mosq_kousyuukai/9a62cb847821a38e70da7827459362c9.pdf
- 千葉市保健所「蚊の生態と防除方法等」https://www.city.chiba.jp/hokenfukushi/iryoeisei/hokenjo/kankyo/mosquito.html
- 奈良県「蚊の対策」https://www.pref.nara.jp/secure/29843/KAtaisaku.pdf
- 森・小田・和田「長崎産ヒトスジシマカの卵休眠と越冬について」熱帯医学 23(2), 1981 https://nagasaki-u.repo.nii.ac.jp/records/24928
- ECDC「Aedes albopictus – Factsheet for experts」https://www.ecdc.europa.eu/en/disease-vectors/facts/mosquito-factsheets/aedes-albopictus
- Lacour ほか「Seasonal Synchronization of Diapause Phases in Aedes albopictus」PLoS ONE 2015 https://pmc.ncbi.nlm.nih.gov/articles/PMC4686165/
- Sim & Denlinger「…diapausing adults of the mosquito Culex pipiens」Physiological Genomics 2009 https://pmc.ncbi.nlm.nih.gov/articles/PMC2789672/
- Koenraadt ほか「Effect of overwintering on … Culex pipiens」Parasites & Vectors 2019 https://pmc.ncbi.nlm.nih.gov/articles/PMC6437999/
- 林・栗原・斉藤「蚊の Age に関する研究 IV」衛生動物 16(2), 1965 https://www.jstage.jst.go.jp/article/mez/16/2/16_KJ00003450729/_article/-char/ja
- 国立感染症研究所「媒介生物による温暖化評価」（環境省 環境研究総合推進費）https://www.env.go.jp/earth/kenkyuhi/report/pdf/12_1_2_3.pdf
