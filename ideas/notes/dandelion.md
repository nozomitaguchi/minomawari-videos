# dandelion（たんぽぽのわたげ）動画用メモ

元記事：[タンポポのわたげは、どうして遠くまで飛べるのか](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/dandelion-seed-flight.md)（公開ページ https://nozomitaguchi.github.io/everyday-trivia/t/dandelion-seed-flight/ ）
図はすべて `everyday-trivia/assets/figures-dandelion.js`（2026-11-21 作成）。

## 問い

たんぽぽのわたげは、どうして遠くまで飛べるの？
（つかみ：ふうっと吹くと、わたげがふわふわ飛んでいく。でも、上から見るとわたげの毛はすきまだらけ。風を通さない傘のほうが飛べそうなのに？）

## 見せ場

- **すきまだらけ**：わたげを上から見ると、毛は約100本、丸の中の9割以上がすきま（`df-gaps`）。ここで「穴だらけなのに？」と引っぱる
- **わたげの上に、はなれて浮かぶ空気の輪**：落ちるわたげから見ると空気は下から上へ。毛のすきまを通った空気で、わたげの少し上に、たばこの煙の輪のような「うずの輪」ができ、くっつかず、流されもせず、同じ距離で浮かび続ける（`df-vortex-ring`）。うずの輪がくるくる回り続けるアニメにすると伝わる。回り方は、外側が上へ、まん中（わたげの真上）が下向き
- **すきまのない板とくらべる**：同じ広さあたり、わたげは4倍以上の空気の抵抗（`df-vs-disk`）。すきまのない板だと、うずがちぎれて次々流れていく（`df-porosity`）
- **意外なオチ**：じつは、ほとんどのたねは親の近く（2m以内）に落ちる。暖かく乾いて風の強い日に、1kmより遠くまで行くものもある（`df-distance`）
- **雨の日はとじる**：しめった空気では、毛のつけねが水を吸ってふくらみ、わたげが閉じる。乾いて風のある日に開いて飛ぶ（`df-wet-dry`）

## 説明の順番（5場面）

1. わたげのつくり：上に細い毛（冠毛：かんもう）、細い軸の下にたねがつり下がる　図：`df-parts`、`dandelion-seed-flight`
2. わたげの役目は「ゆっくり落ちること」。ゆっくり落ちるほど横風に長く押されて遠くへ。風のない部屋では1秒に約39cm　図：`df-slow-far`、`df-speed`
3. 毛は約100本、すきまだらけ（9割以上）。1本は長さ約7.4mm　図：`df-gaps`、`df-hair`
4. わたげの上に、はなれて浮かぶ空気の輪（うずわ）。同じ広さあたり、すきまのない板の4倍以上の抵抗。すきまの量がちょうどよく、うずがちぎれない　図：`df-vortex-ring`、`df-vs-disk`、`df-porosity`
5. ほとんどは近くに落ちる／風の強い乾いた日は遠くへ／しめった日は閉じる　図：`df-distance`、`df-wet-dry`

予想の3択の案：すきまだらけのわたげが、ゆっくり落ちられるのはなぜ？（正解：わたげの上に空気のうずの輪ができて、ささえる）。ほかの選択肢は「毛がとても軽いから（だけ）」「毛から風が出ているから」など。cast.py が出した番号に正解を置く。

## 言い方の注意

- 研究は 2018年、エディンバラ大学の中山尚美さんたちのチーム（科学雑誌ネイチャー）。動画で人名を出すなら「イギリスの大学の研究チーム」くらいでよい
- 「4倍以上」は「同じ広さあたり」「すきまのない丸い板とくらべて」をつける
- 「遠くまで飛ぶ」と言い切らない。論文では「ほとんどは2m以内」「1km超は見積もり」。動画では「ほとんどは近くに。でも、風の強い乾いた日には、とても遠くまで行くたねもある」
- しめった日に閉じる話は、インペリアル・カレッジ・ロンドンの2022年の発表で確かめた範囲だけ（閉じるまでの時間や、乾くとまた開くかは確かめていない）
- 花が終わったあと茎が倒れて、また起き上がって伸びる話、一つの玉のたねの数は確かめられていないので言わない（inbox.md に保留）
- 数字の読み方：39センチ、100本、7.4ミリ（3歳には数字を言わず「ふわふわ ゆっくり」で）

## みてみよう と注意書き

- 晴れて乾いた日と雨の日のわたげを見くらべる（毛が広がっているか、すぼまっているか）。吹いたら、たねが下になったまま、ゆっくり落ちていくか目で追う
- 注意：わたげやたねを口に入れない。人の顔に向けて吹かない

## 出典

- Cummins, Seale, Macente, Certini, Mastropaolo, Viola, Nakayama (2018) A separated vortex ring underlies the flight of the dandelion. Nature 562, 414–418（著者原稿 https://strathprints.strath.ac.uk/79669/1/Cummins_etal_Nature_2018_A_separated_vortex_ring_underlies_the_flight.pdf 、DOI 10.1038/s41586-018-0604-2）
- Nature Japan プレスリリース「【植物科学】タンポポの種子の飛行を支える物理的機構」（2018-10-18）https://www.natureasia.com/ja-jp/nature/pr-highlights/12734
- Nature Japan「生物物理学：タンポポの飛行」（2018-10-18）https://www.natureasia.com/ja-jp/nature/highlights/94648
- Imperial College London "Engineers uncover secret 'thinking' behind dandelions' seed dispersal"（2022-06-01）https://www.imperial.ac.uk/news/236934/engineers-uncover-secret-thinking-behind-dandelions/
