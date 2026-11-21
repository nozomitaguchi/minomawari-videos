# thunder（かみなり）動画用メモ

元記事：[かみなりは、どうして光ってから音がするのか](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/thunder-light-sound.md)（サイト：https://nozomitaguchi.github.io/everyday-trivia/i/thunder/）
図は `everyday-trivia/assets/figures-thunder.js`（`window.AHA_THUNDER` に雲・かなとこ雲・いなずま・家・子ども・音の波の部品あり）。

## 問い

かみなりは、どうして「ピカッ」のあとに「ゴロゴロ」なの？（音はあとから鳴っているの？）

## 見せ場

- **光と音は同時に生まれている**のに、届く時間がちがう。光と音の「競走」：同じスタートで、光は一瞬でゴール、音はのろのろ（光は音のやく100万倍）
- 秒数をかぞえるとキロメートルがわかる：「1、2、3」で約1km。視聴者もいっしょにかぞえられる場面にする
- 近い「バリッ」と遠い「ゴロゴロ」。遠いほど高い音が消えて低くなる（音の波の形で見せる）

## 場面の順番（説明3〜6場面）

1. つかみ：家の窓から見た空。ピカッ……（間）……ゴロゴロ。「音は、あとから鳴っているのかな？」（`thunder-light-sound`）
2. かみなりの正体は電気：雲の中で、こおりの粒とあられがぶつかって、プラスとマイナスに分かれる。セーターのパチパチと同じなかま（`thunder-cloud-ice` `thunder-cloud-charge` `thunder-sweater`）
3. 音のうまれかた：電気が一気に流れると、そばの空気が約1万℃に → 空気がぐんとふくらんで、まわりをふるわせる → それが音。光と音はほとんど同時（`thunder-hot-air` `thunder-air-shake` `thunder-same-time`）
4. 競走：光は1秒で約30万km、音は1秒で約340m。花火も同じ（`thunder-speed-race` `thunder-fireworks`）
5. かぞえてみよう：3秒で約1km、9秒で約3km、30秒で約10km（秒数÷3）。近いとバリッ、遠いとゴロゴロ（`thunder-count-distance` `thunder-crack-rumble`）
6. 音が聞こえたら、もう近い：建物・車・電車やバスの中へ。木の下はだめ（`thunder-go-inside` `thunder-safe-places` `thunder-tree-danger`）

予想の3択の例：「1番．音はあとから鳴っている」「2番．音のほうが、とどくのがおそい」「3番．音は雲の上で一回はねかえってくる」（正解は「とどくのがおそい」。番号は cast.py に従って並べかえる）

みてみよう：家の中で（窓やかべから少しはなれて）、ピカッからゴロゴロまで「いち、に、さん」とかぞえる。だんだん短くなったら近づいている（`thunder-look-count`）。

## 注意書き（必ず入れる）

- **かぞえるのは家の中で**。外にいるときは、かぞえるより先に建物や車の中へ（「ゴロゴロが聞こえたら、もう近い」気象庁）
- 木の下で雨やどりしない（幹・枝・葉から2m以上はなれる）
- こわがらせすぎない。「家の中にいれば、ほぼ安心」を最後に言う（木造の家も基本的に安全、気象庁）

## 数字（記事の出典にあるものだけ）

- 光：1秒におよそ30万km、音：1秒におよそ340m、光は音のおよそ100万倍（気象庁 はれるんランド）
- 光った瞬間、そばの空気は1万℃くらい（気象庁 はれるんランド。ほかの資料と数字がちがうので、この数字だけ使う）
- 秒数÷3＝km（カナダ環境・気候変動省）。3秒≒1km（340×3＝1020m）
- 雷雲の背の高さ：夏7km以上、冬4km以上（気象庁）
- 雷鳴が聞こえるのはふつう約16km（10マイル）まで（NWS。資料によりちがう）
- 光は空気のすんだ夜なら200〜300kmはなれても見える（気象庁、「と言われる」）

## 出典（概要欄用）

- 気象庁「雷とは？」 https://www.jma.go.jp/jma/kishou/know/toppuu/thunder1-0.html
- 気象庁 はれるんランド「雷はどうして光るの？どうして音が鳴るの？」 https://www.jma.go.jp/jma/kids/kids/faq/a3_19.html
- 気象庁 はれるんランド「雷が光ってから、音が聞こえるまでに差があるのはどうしてなの？」 https://www.jma.go.jp/jma/kids/kids/faq/a3_16.html
- 気象庁「雷から身を守るには」 https://www.jma.go.jp/jma/kishou/know/toppuu/thunder4-3.html
- NOAA National Weather Service "Understanding Lightning: Thunder" https://www.weather.gov/safety/lightning-science-thunder
- Environment and Climate Change Canada "How thunder sounds" https://www.canada.ca/en/environment-climate-change/services/lightning/science/how-thunder-sounds.html
