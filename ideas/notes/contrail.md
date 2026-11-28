# contrail（飛行機雲はどうしてのこる）動画用メモ

元記事：[飛行機が飛んだあと、どうして空に白い線がのこるのか…](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/airplane-contrail.md)（2026-11-29 作成）
サイト：https://nozomitaguchi.github.io/everyday-trivia/t/airplane-contrail/
図：`everyday-trivia/assets/figures-contrail.js`（名前は `ct-` ではじまる。いちばん上の絵は `airplane-contrail`）
色の約束：そら＝みずいろ、ひこうきぐも＝しろ（うすい灰のふち）、こおりの つぶ＝あおい ふちの ろっかっけい、すいじょうき＝あおい てん、すす＝こい はいいろの てん、あつい＝あか、つめたい＝あお

## 問い

飛行機が飛んだあと、どうして空に白い線がのこるの？（あの しろい せんは けむり？）
答えの軸：**しろい せんは けむりではなく、ちいさな こおりの つぶで できた くも（ひこうきぐも）。エンジンで ねんりょうが もえると みずの ガス（すいじょうき）が でる。ひこうきが とぶ たかい ところは マイナス40どより つめたいので、あつくて しめった ガスが まわりの つめたい くうきと まざると、すいじょうきは こまかい つぶに くっついて みずの つぶに なり、すぐ こおる。さむい ひの しろい いきと おなじ なかま。そらの うえが かわいて いる ひは こおりが すぐ きえ、しめって いる ひは まわりの みずを もらって なんじかんも のこる。**

## 見せ場

- 予想の3択の例：「ひこうきの うしろの しろい せんは なに？」（エンジンから でた けむり／こおりの つぶで できた くも／ひこうきが まいた しろい こな）。正解は「こおりの つぶの くも」。正解の番号は cast.py に従う
- **むしめがねで しろい せんを のぞくと こおりの つぶ**（`ct-ice`）：つかみの答え。せんに ズームインして、ろっかっけいの こおりが キラキラ
- **エンジンから でる ガスの なかみ**（`ct-exhaust`）：にさんかたんそ 71%・すいじょうき 28%。「もえると みずが できる」が いちばんの「へぇ」
- **まざって ひえて こおる 3だんかい**（`ct-steps`）：すいじょうきが つぶに くっつく → みずの つぶ → すぐ こおる。アニメで つぶが あつまって こおる
- **さむい ひの しろい いきと おなじ**（`ct-breath`）：子どもが「はあー」と いきを はく → そらの ひこうきぐもに つなぐ。親子で ためせる体験
- **すぐ きえる ひと のこる ひ**（`ct-dry` → `ct-humid`）：同じ ひこうきでも、かわいた そらでは こおりが すうびょう〜すうふんで きえ、しめった そらでは まわりの みずを もらって ふとる。ここが 二つめの見せ場（ひこうきの せいではなく、そらの せい）
- おまけ：ゆび1ぽんで ふとさを くらべる 3つの しゅるい（`ct-three`）、とちゅうで きれる せん（`ct-broken`）、かぜで ながされて きた ふるい くも（`ct-drift`）、ふねのりの てんき よみ（`ct-weather`・`ct-hint`）、つばさの さきの うず（`ct-wingtip`）、1919ねんの ディーマー（`ct-1919`）— 時間が足りなければ省く

## 場面の順番（説明は5場面）

1. しろい せんは けむりではなく、こおりの つぶの くも（`airplane-contrail` → `ct-ice`）
2. エンジンで ねんりょうが もえると、みずの ガス「すいじょうき」が でる。ガスは あつくて しめって いる（`ct-exhaust` → `ct-hot-cold`）
3. ひこうきが とぶ たかさは マイナス40どより さむい（ふつう 8キロメートルより うえ）。ひくい ところでは できない（`ct-height`）。ひえた すいじょうきが つぶに くっついて みずの つぶ → すぐ こおる（`ct-steps`）
4. さむい ひの しろい いきと おなじ なかま（`ct-breath`）
5. すぐ きえる ひ（かわいた そら）と、ながく のこる ひ（しめった そら）（`ct-dry` → `ct-humid` → `ct-three`）。のこる ひは「そらの うえが しめってる」しるしで、てんきが かわる ことも ある（`ct-weather`）

正解と「みてみよう」：はれた ひに ひこうきが とおったら たちどまって、しろい せんが すぐ きえるか のこるか みる。のこって いたら うでを のばして ゆび1ぽんと ふとさを くらべる（`ct-look`）。

## 注意書き・言いかたの注意

- **そらを みあげる ときは たちどまる。たいようは みない**。「みてみよう」とおわりで必ず言う。道路では見上げない
- 「マイナス40ど」「8キロメートル」は NASA GLOBE の数字（「ふつうは」8kmより上）。「いつも8km」とは言わない。イギリス気象庁は「2万フィート（約6100m）より上」としている
- 「のこると あめが ふる」とは言い切らない。言えるのは「そらの うえが しめって いる しるし。てんきが かわる ことが あると いわれて いる」まで（アメリカ国立気象局・ウェザーニュース）。イギリス気象庁は、飛行機雲そのものは地上の天気を変えるほど大きくないとしている
- 「けむりではない」は言ってよいが、排ガスに すすなどが 1%たらず 入って いることは本当（FAA・EPA）。すすの つぶは こおりの「足場」になる
- 「白い いきと おなじ」は FAA と国立気象局が使っているたとえ。ちがいは、空の上では水のつぶが すぐ こおること
- ケムトレイル（陰謀論）の話はしない
- 吹き出しの例：おとうと「あ！ ひこうきが しろい せんを かいてる！」／おねえちゃん「きのうの せんは すぐ きえたのに、きょうは ずっと のこってる」／カメレオン（ルーペで しろい せんを のぞくと こおりの つぶ）

## 出典

- Contrails Fact Sheet（アメリカ環境保護庁・連邦航空局・海洋大気庁）https://www.faa.gov/contrails/fact-sheet
- Contrails（アメリカ連邦航空局, 2025年7月21日更新）https://www.faa.gov/contrails
- The Science of Contrails（NASA GLOBE）https://www.globe.gov/web/s-cool/home/observation-and-reporting/contrails/the-science-of-contrails
- History of Contrails and Contrail Research（NASA GLOBE）https://www.globe.gov/web/s-cool/home/contrail-investigation/history-of-contrails
- Contrail Identification Chart and Formation Guide（NASA）https://www.globe.gov/documents/10157/98ef8129-2b13-439f-9306-2dee95e08576
- On the Trail of Contrails（NASA Earthdata, 2020年12月28日）https://www.earthdata.nasa.gov/news/feature-articles/trail-contrails
- Contrails or condensation trails（イギリス気象庁）https://weather.metoffice.gov.uk/learn-about/weather/types-of-weather/clouds/unusual-cloud-formations/contrails
- Clouds and Contrails（アメリカ国立気象局 フラッグスタッフ予報所）https://www.weather.gov/fgz/CloudsContrails
- Weather In Action: Contrails（アメリカ国立気象局 ビンガムトン予報所）https://www.weather.gov/bgm/WeatherInActionContrails
- 長くのびる飛行機雲　上空の湿度の影響（ウェザーニュース, 2026年8月18日）https://weathernews.jp/news/202608/180161/
