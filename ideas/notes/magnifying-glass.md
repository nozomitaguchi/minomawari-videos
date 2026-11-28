# magnifying-glass（虫めがねで大きく見える）動画用メモ

元記事：[虫めがねでのぞくと、どうして物が大きく見えるのか…](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/magnifying-glass-bigger.md)（2026-11-29 作成）
サイト：https://nozomitaguchi.github.io/everyday-trivia/t/magnifying-glass-bigger/
図：`everyday-trivia/assets/figures-magnifier.js`（名前は `mag-` ではじまる。いちばん上の絵は `magnifying-glass-bigger`）
色の約束：ひかり＝だいだいの線、レンズ＝みずいろ、ほんもの＝あかい てんとうむし・ピンクの はな、目に「みえる かたち」（きょぞう）＝うすい てんせん。目は右に置いて左を向く（もの → レンズ → め の順に左から右）

## 問い

虫めがねでのぞくと、どうして物が大きく見えるの？
答えの軸：**物は目に近づけるほど大きく見える（目から見た角度が大きくなり、目のおくに大きくうつる）。でも近すぎると、目のピントが合わなくてぼやける。虫めがねの凸レンズは光を内側に曲げるので、目に近い物でもピントが合う。だから「ぐっと近づいて」大きく見られる。虫めがねが物を大きくしているのではない。**

## 見せ場

- 予想の3択の例：「むしめがねで おおきく みえるのは なぜ？」（ガラスが ものを ふくらませて いるから／ちかくでも ピントが あうように ひかりを まげて いるから／めが おおきく ひらくから）。正解は「ちかくでも ピントが あうように ひかりを まげる」。正解の番号は cast.py に従う
- **ちかいと おおきい、でも ちかすぎると ぼやける**：同じ花を遠く→近くへ動かすと目のおくの像が大きくなる（`mag-angle`）→ 近すぎるとぼやーっ（`mag-too-close`）。画面全体をぼかして体験させる
- **ひかりが くいっと まがる**：平行な光がレンズで内側に曲がって「しょうてん」に集まる（`mag-focus`）
- **むしめがね なし／あり**：同じ近さで、なしはぼやける・ありはくっきり（`mag-eye-focus`）。ここが一番の見せ場
- **めには とおくに おおきく みえる**：てんせんをのばすと大きな花（`mag-virtual`）。紙を置いてもうつらない（`mag-virtual-not-on-paper`）— 時間が足りなければ紙の話は省く
- **とおくを のぞくと さかさま**：同じ虫めがねで窓の外の家と木をのぞくと、さかさまで小さい（`mag-far-scene`、`mag-upside-down`）。「しょうてんの うちがわ＝おおきく そのまま／そとがわ＝さかさま」で回収
- おまけ：ふくらみが強いレンズほど大きく見える（`mag-power`、`mag-power-table`）、よく使うのは2〜4ばい・10ばいくらいまでは虫めがね・それより上は顕微鏡（`mag-power-uses`）

## 場面の順番（説明は5場面）

1. むしめがねで のぞくと、ちいさな てんとうむしが おおきく みえる（`magnifying-glass-bigger`）
2. ものは ちかいほど おおきく みえる（`mag-angle`）。でも ちかすぎると ぼやける（`mag-too-close`）。はっきり みえる いちばん ちかい ところ（`mag-near-point`。数字は言わなくてよい）
3. むしめがねは まんなかが ぷっくり あつい「とつレンズ」。みずや こおりでも レンズに なる（`mag-convex`）。ひかりを うちがわに まげて「しょうてん」に あつめる（`mag-focus`）
4. めの まえに レンズを おくと、ちかくでも ピントが あう（`mag-eye-focus`）。めには、レンズの むこうに おおきな ものが あるように みえる（`mag-virtual`）
5. ものが しょうてんより とおいと さかさま。とおくの けしきは さかさまで ちいさい（`mag-upside-down`、`mag-far-scene`）

みてみよう：めの ちかくに むしめがねを もって、しんぶんの じや ゆびの しわに ちかづけたり はなしたり。いちばん おおきく くっきり みえる ところを さがす（`mag-look`）。うでを のばして、へやの なかから まどの そとの とおくの いえや きを のぞく。「さかさま？」と よそうしてから（`mag-far-scene`）。

## 注意書き・言いかたの注意

- **むしめがねで おひさまを のぞかない（めを いためる）。ひの あたる まどぎわに おきっぱなしに しない（ひかりが あつまって あつく なり、火が でる ことが ある）。つかったら ひの あたらない ひきだしに しまう**。動画の「みてみよう」とおわりで必ず言う（`mag-no-sun`、`mag-sun-fire`）。「紙をこがしてみよう」はやらない
- 「虫めがねが物を大きくする」「ガラスがふくらませる」とは言わない。言えるのは「ちかくでも ピントが あうように ひかりを まげる」
- 「子どもは大人より近くまで見える」とは言わない（年齢と近点の資料を確かめていない）。近点の25cmは「ばいりつの けいさんで つかう めやす」として扱う。ナレーションでは数字を出さなくてよい
- 倍率の式は動画では出さなくてよい。出すなら「ふくらみが つよい レンズほど おおきく みえる」まで
- 収れん火災の数字（東京消防庁：2009〜2018年に61件、うち凸レンズ31件、1月が最多）は、使うなら「とうきょうでは 10ねんで 61けん」程度に
- 虫めがねの歴史・発明者の話は確かめていないので入れない
- 吹き出しの例：おとうと「てんとうむし、おっきい！」／おねえちゃん「あれ？ おそとの おうちが さかさま！」／カメレオン（ルーペで しんぶんの じを のぞいて、ちかづけたり はなしたり）

## 出典

- キヤノン キヤノンサイエンスラボ・キッズ「ルーペ顕微鏡」https://global.canon/ja/technology/kids/experiment/e_04_08.html
- キヤノン キヤノンサイエンスラボ・キッズ「水でレンズを作ってみよう」https://global.canon/ja/technology/kids/experiment/e_02_08.html
- キヤノン キヤノンサイエンスラボ・キッズ「氷レンズで光集め」https://global.canon/ja/technology/kids/experiment/e_02_03.html
- OpenStax『University Physics Volume 3』2.7 The Simple Magnifier（ライス大学、2016）https://openstax.org/books/university-physics-volume-3/pages/2-7-the-simple-magnifier
- OpenStax『University Physics Volume 3』2.4 Thin Lenses https://openstax.org/books/university-physics-volume-3/pages/2-4-thin-lenses
- エドモンド・オプティクス「How do I calculate the power of a magnifier?」https://www.edmundoptics.jp/knowledge-center/frequently-asked-questions/microscopy/magnifiers/how-do-i-calculate-the-power-of-a-magnifier/
- エビデント（旧オリンパス）「Simple Magnification」https://evidentscientific.com/en/microscope-resource/tutorials/lenses/simplemagnification
- 東京消防庁「凹面鏡による収れん火災に注意」（2019）https://www.tfd.metro.tokyo.lg.jp/content/000027036.pdf
- 大津市（消費者庁の注意喚起）「鏡やガラス玉で起こる『収れん火災』に注意！」（2020）https://www.city.otsu.lg.jp/material/files/group/269/shurenkasai.pdf
- 国立天文台「2023年4月20日 日食 解説資料」https://www.nao.ac.jp/contents/astro/sky/2023/04/partial-eclipse-factsheet.pdf
