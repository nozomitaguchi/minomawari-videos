# itch（かゆみ）動画用メモ

元記事：[どうしてかゆくなるのか、かくとなぜもっとかゆくなるのか](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/itch-scratch.md)（2026-11-23 作成）
サイト：https://nozomitaguchi.github.io/everyday-trivia/i/itch/
図：`everyday-trivia/assets/figures-itch.js`（名前はすべて `it-` ではじまる。いちばん上の絵は `itch-scratch`）
色の約束：かゆみの合図＝オレンジの波線、痛みの合図＝赤の矢印、かゆみのもと（ヒスタミン）＝黄色のつぶ、セロトニン（脳の痛みどめ）＝むらさきのつぶ、神経＝オレンジの線、冷たい＝青
蚊の回（mosquito-bite）とのちがい：蚊の回は「蚊の口とだ液」が中心。この回は「かゆみそのもの」と「かくと、なぜもっとかゆくなる？」が中心。蚊は入口の一場面だけにする

## 問い

かゆいところをかくと、どうして あとで もっと かゆくなるの？（題名は「どうして かゆく なるの？」でもよい）
答えの軸：**かゆみは「ひっかきたくなる」いやな感じ。皮ふの見張り役の細胞が「かゆみのもと（ヒスタミンなど）」を出し、皮ふの浅いところまでのびた細い神経がそれを受け取って、合図が背骨の中の「せきずい」を通って脳にとどく。かくと、皮ふにちょっぴり痛みが生まれ、せきずいでかゆみの合図がいったんしずまる（だから、かいた瞬間はすっとする）。でも脳は、その痛みをおさえようと「セロトニン」を出す。セロトニンはかゆみの神経まで元気にしてしまい、かゆみが強くなる（ネズミの研究）。さらに、かいて皮ふに傷ができると、傷から次のかゆみのもとが出る。こうして「かゆい → かく → もっとかゆい」の輪になる。**

## 見せ場

- つかみの「ふしぎ」：かくと気持ちいいのに、少したつと前よりかゆい（`itch-scratch` の①かゆい → ②かくと すっ → ③もっと かゆい の3コマ）
- 予想の3択の例：「かくと、どうして あとで もっと かゆく なるの？」（1. つめに ばいきんが いるから／2. のうの いたみどめが、かゆみも つよく するから／3. かくと ひふが あつく なるから → 正解は のうの いたみどめ）。正解の番号は cast.py に従って入れかえる。「ひふに きずが できるから」も正解の一部なので、ほかの2つの選択肢に使わない
- 見張り役の細胞が黄色いつぶ（ヒスタミン）をパッと出す（`it-mast`）→ つぶが皮ふの浅いところの神経の先にさわる（`it-nerve-skin`）→ オレンジの波線が腕からせきずいをのぼって脳へ「かゆい！」（`it-path`）
- かくと赤い「いたみ」の矢印がせきずいを通り、オレンジの「かゆみ」の波線は ×（`it-scratch-pain`）。サルの実験の「スパイクの波」が、かいたところでしずまる（`it-monkey`）
- いちばんの見せ場：脳からむらさきのつぶ（セロトニン）がせきずいへ広がって、かゆみの神経細胞にくっつき、オレンジの波線が太くなる（`it-serotonin`）。ネズミの棒グラフ（セロトニンがつくれないネズミはあまりかかない／注射するとまたかく）（`it-mice`）
- 輪の図「かゆい → かく → ちょっぴり いたい → のうが セロトニン → かゆみ つよく → かゆい」（`it-loop-brain`）。おわりのまとめにも使える
- かく前とかいたあとの皮ふ：れんがのバリアがこわれて、ピンクのつぶ（かゆみを強めるもの）が出る（`it-barrier`）
- おまけ：ほかのネズミがかく動画を見たネズミも数秒でかきはじめる。かゆみは見るだけでうつる（`it-contagious`）。あくびの回（yawn）とつながる。視聴者にも「この どうがを みて、かきたく なった？」と聞ける

## 場面の順番（説明は5場面）

1. かゆみは「ひっかきたくなる」いやな感じ。虫などを払いのけて体を守るためと考えられている（`it-define`、`it-bug`）
2. 見張り役の細胞がかゆみのもと（ヒスタミン）を出す → 皮ふの浅いところの細い神経が受け取る → せきずいを通って脳へ。脳にとどいて初めて「かゆい」（`it-mast`、`it-nerve-skin`、`it-path`）
3. かくと、ちょっぴり痛い。痛みの合図がせきずいでかゆみの合図をしずめる → だから、かいた瞬間はすっとする（`it-scratch-pain`、`it-monkey`）
4. でも脳は、痛みをおさえようとセロトニンを出す。セロトニンがかゆみの神経まで元気にして、かゆみが強くなる（ネズミの研究）（`it-serotonin`、`it-mice`、`it-loop-brain`）
5. かいて皮ふに傷ができると、傷ついた皮ふから次のかゆみのもとが出て、もっとかゆい。「かゆい・かく・もっとかゆい」の輪（`it-barrier`。ネズミのえりまきの実験を入れるなら `it-collar`）
（6. 入れるなら：かゆみは見るだけでうつる（`it-contagious`、`it-scn`）。冬の乾燥やあつすぎるおふろでかゆくなりやすい（`it-dry`））

みてみよう：かゆくなったら、かく前に、大人に氷をタオルでまいたもの（冷たいタオル）を用意してもらい、かゆいところに当ててみる。かいたときと冷やしたときで、少したってからのかゆさをくらべる（`it-look`、やわらげ方は `it-cool`）。

## 注意書き・言いかたの注意

- **つめでかきむしらない。冷やすときは大人に用意してもらう（氷はタオルでまく。氷を直接長く当てない）。かゆみが続く・赤くはれる・じゅくじゅくするときは、大人に言ってお医者さんにみてもらう。** 「みてみよう」で必ず言う
- セロトニンの話は**ネズミの研究**（ワシントン大学 2014年）。「人でも同じことが起きていると考えられている」まで。「人でわかった」とは言わない
- サルの実験（ミネソタ大学 2009年）は、絵ではサルを出さなくてよい（グラフだけ）。言うなら「サルの せきずいの しんけいを しらべた」
- 「冷やすと、なぜかゆみがやわらぐか」のしくみは言わない（確かめていない、inbox）。「ひやすと、かゆみが おちつく ことが ある」「三重病院の お医者さんの すすめ」まで
- 「つめを短く切る」は資料になかった（inbox）。言うなら一般の注意として「つめで かきむしらない」にとどめる
- 「かくのは ぜったい だめ」と叱る言い方にしない。かくことで細菌がへる働きもある（ネズミの研究）が、かゆみが長く続くときは、かいてこわす害のほうが大きい、という順で
- アトピー性皮膚炎の話（神経の枝がふえる `it-nerve-grow`）は、子ども向け動画では入れなくてよい。病気の子をこわがらせない
- 吹き出しの例：おとうと「かゆい〜！」（つかみ、腕をかく）／おねえちゃん「かいたら もっと かゆく なった！」（つかみ③）／カメレオン（ルーペで皮ふの中の見張り役の細胞をのぞく）／おねえちゃん「ひんやり きもちいい」（みてみよう、タオル）

## 出典（概要欄用）

- 端本宇志「難治なかゆみの退治法」（ラジオNIKKEI マルホ皮膚科セミナー、2021年）https://www.radionikkei.jp/maruho_hifuka/maruho_hifuka_pdf/maruho_hifuka-211115.pdf
- 端本宇志「アトピー性皮膚炎の痒み」（ラジオNIKKEI マルホ皮膚科セミナー、2022年）https://www.radionikkei.jp/maruho_hifuka/docs/maruho_hifuka-220822.pdf
- MSDマニュアル家庭版「かゆみ」 https://www.msdmanuals.com/ja-jp/home/17-皮膚の病気/かゆみと皮膚炎/かゆみ
- ハーバード大学医学部「Itch and the Brain」（2011年）https://hms.harvard.edu/news/itch-brain
- 国立病院機構 三重病院 ニュースレター「臨床研究部からのお便り 第49回」 https://mie.hosp.go.jp/common/letter/nl_2305_02.pdf
- ワシントン大学「Scratch no more: Gene for itch sensation discovered」（2007年）https://source.washu.edu/2007/07/scratch-no-more-gene-for-itch-sensation-discovered/
- ワシントン大学「Why scratching makes you itch more」（2014年）https://source.washu.edu/2014/10/why-scratching-makes-you-itch-more/
- ワシントン大学「Brain hardwired to respond to others' itching」（2017年）https://source.washu.edu/2017/03/brain-hardwired-respond-others-itching/
- ミネソタ大学のプレスリリース（ScienceDaily、2009年）https://www.sciencedaily.com/releases/2009/04/090428112615.htm
- ウェイクフォレスト大学「Research Suggests Why Scratching is So Relieving」（2008年）https://newsroom.wakehealth.edu/news-releases/2008/01/research-suggests-why-scratching-is-so-relieving
- ピッツバーグ大学医学部「Why You Shouldn't Scratch an Itchy Rash」（2025年）https://www.medschool.pitt.edu/news/why-you-shouldn-t-scratch-itchy-rash-new-study-explains
- アメリカ国立衛生研究所「Scratching and allergic skin inflammation」（2025年）https://www.nih.gov/news-events/nih-research-matters/scratching-allergic-skin-inflammation
