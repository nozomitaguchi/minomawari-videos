# 動画の一覧

状態：`候補` → `下書き中（日時）` → `ナレーション待ち` → `ナレーション中（日時）` → `仕上げ待ち` → `仕上げ中（日時）` → `完成` → `公開`

`記事作成待ち` は図鑑の元記事がまだない題材で、下書きの対象にしない。元記事ができたらリンクを付けて `候補` にする（手順は `ideas/article-brief.md`）。

`保留` はユーザーがいったん止めた題材（元記事はある）。下書きの対象にしない。ユーザーが再開を決めたら `候補` に戻す。

`WAV取り込み待ち` は音声生成済みで、GitHubへのWAV取り込みが残っている状態。取り込み後は `仕上げ待ち` に進める。

（手順は CLAUDE.md。書きかえる前に git pull --rebase、書いたらすぐ push）

## できた動画

| フォルダ | 題 | 状態 |
|---|---|---|
| `shingou/` | 緑なのに、どうして「青信号」？ | 公開 |
| `sora/` | 昼は青いのに、どうして夕やけは赤い？ | 公開 |

## つぎに作る候補（上から順に）

サイトの `items/` をもとに、親子で見たことのある物や場面、一言で答えが気になる疑問、映像で答えを見せられる問いを優先する。

| 動画ID | 問いの例 | 状態 |
|---|---|---|
| elevator | どうやって上がる？ おもりのひみつ・消防用の鍵穴 | 公開 |
| pill-bug | だんごむしは、どうして丸くなる？ | 公開 |
| scab | けがのあと、どうしてかさぶたができる？ | 公開 |
| moon | 月は、どうして形が変わる？ | 公開 |
| tummy-rumble | おなかは、どうして鳴る？ | 公開 |
| mirror | 鏡は、どうして左右が反対に見える？ | 公開 |
| eye-tears-blink | 泣くと、どうして鼻水まで出るの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/eye-tears-blink.md)） | 公開 |
| sky-cloud-white | 白い雲と黒っぽい雨雲、何がちがうの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/sky-cloud-white.md)） | 公開 |
| power-lines | 電線に止まった鳥は、どうしてしびれない？ | 公開 |
| escalator | エスカレーターの階段は、消えたあとどこへ行く？ | 公開 |
| cold | かぜをひくと、どうして体は熱を出す？ | 公開 |
| autumn-leaves | 葉っぱは、どうして秋になると赤や黄色になるの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/autumn-leaves-color.md)） | 公開 |
| nails-and-hair | つめや髪は、どうして切っても痛くない？ | 公開 |
| futon-warmth | おふとんは、どうして入ったときは冷たいのに、だんだんあったかくなるの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/futon-warmth.md)） | 公開 |
| key | 鍵を回すと、ドアの中で何が動いて開くの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/key-lock.md)） | 保留 |
| winter-trees | 冬、葉っぱがなくなる木と、緑のままの木があるのはなぜ？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/tree-winter-leaves.md)） | 公開 |
| rain-snow | 空の上では何が起きて、雨になったり雪になったりするの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/rain-snow.md)） | 公開 |
| toilet | トイレは、流したあともどうして少し水が残るの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/toilet-water.md)） | 公開 |
| white-breath-steam | 寒いとき、湯気や白い息が見えるのはなぜ？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/steam-white-breath.md)。白いのは水蒸気ではなく小さな水のつぶ、が見せ場。湯気の出口には近づかない・さわらない注意を入れる） | 公開 |
| car-drive | アクセルを踏むと、どうやってタイヤまで力が届くの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/car-drivetrain.md)） | 保留 |
| wheel-to-car | 車輪がついた荷車は、いつ自分で走る車になったの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/car-wheel-to-car.md)） | 保留 |
| ant | アリの行列は、どうやって同じ道を見つける？ | 公開 |
| digestion | 食べたものは、どうやってうんちになる？ | 公開 |
| pet-bottle | 炭酸のペットボトルは、どうして底が花びらみたいな形？ | 保留 |
| pencil | 鉛筆は、どうして消しゴムで消える？ | 公開 |
| baby-teeth | 子どもの歯は、どうしてぬけて生えかわるの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/baby-teeth.md)） | 公開 |
| yawn | あくびは、どうしてうつるの？（わかっていないことは「わかっていない」と言う）（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/yawn-contagious.md)） | 保留 |
| mosquito-bite | 蚊にさされると、どうしてかゆくなるの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/mosquito-bite-itch.md)） | 公開 |
| morning-glory | あさがおのつるは、どうやって棒に巻きつくの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/morning-glory-twining.md)） | 保留 |
| dandelion | たんぽぽのわたげは、どうして遠くまで飛べるの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/dandelion-seed-flight.md)） | 公開 |
| honeycomb | ハチの巣は、どうして六角形なの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/bee-honeycomb-hexagon.md)。実物には近づかない。みてみようは写真や図で） | 公開 |
| rainbow | にじは、どうして雨のあとに出て、七色に見えるの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/rainbow-after-rain.md)） | 公開 |
| thunder | かみなりは、どうして光ってから音がするの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/thunder-light-sound.md)） | 公開 |
| faucet | 蛇口をひねると、どうしていつでも水が出てくるの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/faucet-water-pressure.md)） | 公開 |
| recorded-voice | 録音した自分の声は、どうして別人みたいに聞こえるの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/voice-recorded.md)） | 公開 |
| rain-ground-water | 雨がふったあと、地面の水はどこへ行くの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/rain-ground-water.md)） | 公開 |
| ice-melt | 氷は、どうしてとけるの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/ice-melt.md)） | 公開 |
| finger-wrinkles | おふろに入ると、どうして指がしわしわになるの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/finger-wrinkles.md)。わかっていないことは「わかっていない」と言う） | 公開 |
| goosebumps | 寒いと、どうして鳥肌が立つの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/goosebumps-cold.md)） | 公開 |
| shadow | かげは、どうして自分と同じ形になるの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/shadow-shape.md)。太陽そのものは見ない） | 公開 |
| airplane | 飛行機は、あんなに重いのに、どうして空を飛べるの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/airplane-lift.md)） | 公開 |
| soap-bubble | シャボン玉は、どうして丸くなるの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/soap-bubble-round.md)。星の輪でふいても丸い、が見せ場。石けん水は口や目に入れない） | 公開 |
| sea-salty | 海の水は、どうしてしょっぱいの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/sea-salty.md)。海の水は飲まない注意を入れる） | 公開 |
| wind | 風は、どうしてふくの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/wind-blow.md)） | 公開 |
| snow-white | 雪は、どうして白いの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/snow-white.md)） | 公開 |
| sneeze | くしゃみは、どうして出るの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/sneeze-reflex.md)） | 公開 |
| soap | 石けんで洗うと、どうしてよごれが落ちるの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/soap-washing.md)） | 公開 |
| cicada | セミは、どうして夏になると鳴くの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/cicada-summer-song.md)） | 公開 |
| fish-gills | 魚は、どうして水の中で息ができるの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/fish-gills.md)。口とえらぶたの かわりばんこ、えらの3段ズーム、空気の中ではえらがしぼむ、が見せ場。魚は水から出さない・水そうに手を入れない注意を入れる） | 公開 |
| bird-fly | 鳥は、どうして空を飛べるの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/bird-flight.md)。打ちおろしで羽根が重なり、打ち上げではすきまが開く、が見せ場。骨は「軽いから飛べる」とは言わない。ハトに近づかない・追いかけない、太陽は見ない注意を入れる） | 公開 |
| dog-panting | 犬は、どうして舌を出してハアハアするの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/dog-panting.md)。汗をかけるのはほぼ肉球だけ、鼻から吸って口から出す、が見せ場。知らない犬に近づかない・さわるときは飼い主に聞く、暑い日の散歩と車内の注意を入れる） | 完成 |
| lights-off-dark | 電気を消すと、どうして部屋が暗くなるの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/lights-off-dark.md)。光は外へにげずに、壁や物に当たるたびに吸いこまれて熱になる、が見せ場。スイッチは大人が・暗い中は歩きまわらない注意を入れる） | 候補 |
| train-wheel-curve | 電車は、ハンドルがないのに、どうやってカーブを曲がるの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/train-wheel-curve.md）） | 完成 |
| poop-color | うんちは、どうして茶色いの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/poop-color.md）） | 完成 |
| cold-mucus-color | かぜをひくと、鼻水が黄色くなるのはどうして？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/cold-mucus-color.md）） | 完成 |
| fridge | 冷蔵庫は中を冷やしているのに、どうして外があったかくなるの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/fridge-warm-outside.md)。冷たさを作るのではなく中の熱を外へ運ぶ、外へ出す熱は中の熱＋モーターの分なのでドアを開けっぱなしでも部屋は涼しくならない、が見せ場。うしろや下の機械にさわらない・さわるのは大人、の注意を入れる） | 完成 |
| washing-machine | 洗濯機は、服を回すだけでどうして水をしぼれるの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/washing-machine-spin.md)。穴のあいた洗濯槽を速く回すと、服も水も外へ押され、水だけが小さな穴から飛び出す、が見せ場。回っている間はふたを開けない・手を入れない・洗濯機の中に入らない注意を入れる） | 完成 |
| static-shock | 冬にドアをさわると、どうしてバチッとなるの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/static-shock-door.md)。歩くとでんしが引っこしして体にたまり、乾いた冬はにげない、金属に近づくと空気をとびこえる小さなかみなり、が見せ場。わざとバチッとさせない・ガソリンスタンドのシートと給油は大人、の注意を入れる） | 候補 |
| mochi-puff | おもちは、焼くとどうしてふくらむの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/rice-mochi-puff.md)。お正月の題材。中の水が目に見えない水蒸気になってかさが約1700倍、のびる網目が風船のゴムになる、が見せ場。焼くのは大人・焼きたては熱いのでさわらない、のどにつまらせない（小さく切る・のどをしめらせる）注意を入れる） | 候補 |
| mikan-white-threads | みかんの白いすじは、何のためにあるの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/mikan-white-threads.md)。すじは木から水と栄養を運んだ通り道、なのに中のつぶつぶには管がなく細胞から細胞へ手わたし、が見せ場。皮の内側の白いふわふわ（アルベド）とは別もの。むく前に手をあらう） | 完成 |
| hiccup | しゃっくりは、どうして急に出て止まらないの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/hiccup-diaphragm.md)。横隔膜が勝手にピクッ → 声のとびらがパタンで「ヒック」、だから吸うときに鳴る、が見せ場。何のためかは「わかっていない」と言う。水を一気に飲む・袋をかぶせる・おどかす、で止めようとしない注意を入れる） | 完成 |
| heartbeat-running | 走ると、どうして心臓がドキドキするの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/heartbeat-running.md)。心臓は打つ回数と1回に送る血の量を両方ふやして血を4〜5倍に、ふえた血はおもに走っている足の筋肉へ、アクセルとブレーキの神経、が見せ場。走るのは広くて車の来ない所で・苦しい・胸が痛いときはすぐ止まって大人に言う注意を入れる） | 完成 |
| sweat | あせは、どうして出るの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/sweat-why.md)。汗は肌の上で乾く（蒸発する）ときに体の熱を持っていくので、出ただけでは冷えず乾いてはじめて冷える、脳の「温度の係」が神経で約300万個の汗腺に合図、材料は血で塩を取りもどしてうすい汗に、むしむしの日は乾かないので冷えにくい、が見せ場。暑い日は水をこまめに・頭が痛い・気持ちが悪いときはすずしい所で休んで大人に言う注意を入れる） | 候補 |
| navel | おへそは、何のためにあるの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/navel-umbilical-cord.md)。いまのおへそは何もしていない・へその緒がついていたきずあと、へその緒の中は血の道3本（行き1本・帰り2本）、神経がないので切っても痛くない、が見せ場。おへその中をほじらない・赤ちゃんのへその緒の残りにさわらない注意を入れる） | 候補 |
| star-twinkle | 星は、どうしてキラキラまたたくの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/star-twinkle.md)。星の光は地球をつつむ空気の中で、あたたかい・つめたい空気のかたまりに少しずつ曲げられ、かたまりがいつも動くので光がゆれる、星は遠すぎて「点」なのでゆれが目立ち惑星はあまりまたたかない、地平線近くほどキラキラ、空気のない月や宇宙ではまたたかない（だからハッブルは宇宙に）、が見せ場。夜は大人といっしょに・車の通る道やベランダの手すりの近くでは見ない注意を入れる） | 候補 |
| moon-follows-car | 車に乗ると、どうしてお月さまがずっとついてくるの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/moon-follows-car.md)。近くの木は「びゅーん」、遠くの山は「ゆっくり」、約38万km先の月は走っても見える向きがほとんど変わらず窓の同じところにいる、が見せ場。近い指と遠い指の実験もできる。窓から顔や手を出さない・シートベルト・運転する人の気を散らさない注意を入れる） | 完成 |
| itch | どうしてかゆくなるの？（かくと、なぜもっとかゆくなる？ 蚊の回とは別に、かゆみそのものの話）（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/itch-scratch.md)） | 完成 |
| supermarket-egg-chick | スーパーのたまごを温めたら、ひよこは生まれる？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/egg-supermarket-chick.md)。めんどりはおんどりがいなくても1日に約1個産む、スーパーのたまごはめんどりだけの農場の無精卵がほとんど、受精は殻ができる前に体の中の入り口で、黄身の白い点「胚」はぎざぎざの点とわっかで見え方がちがう、が見せ場。割るのは大人・生卵をさわったら手をあらう・たまごを温めてためさない注意を入れる） | 候補 |
| aquarium-big-fish | 水族館の大きな魚は、となりの小さな魚を食べちゃわないの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/fish-aquarium-tankmates.md)。海のサメは魚を食べる、でも水族館ではおなかいっぱいにして食べた量を記録（まんぷくのサメはすばやい魚をわざわざ追わない）、1匹ずつ決まった場所でごはん、小さな魚ははなれたすみで、いっしょにする種類と口に入らない大きさを選ぶ、それでもゼロではないので毎日ようすを見る、が見せ場。ガラスをたたかない注意を入れる） | 候補 |
| pigeon-babies | 公園にハトはあんなにいるのに、赤ちゃんはどこにいるの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/bird-pigeon-babies.md)。赤ちゃんは雨のかからない建物のすき間や橋の下の巣にいる、オスが枝を1本ずつ運びメスが組む、卵はふつう2つでオスとメスが交代であたためる、親ののどの「そのう」から出るピジョンミルクを口うつし、巣の中に25〜32日いて巣を出るころには親と同じ大きさ（だから公園で見ても赤ちゃんとわからない）、若いハトは目が黒っぽく白いこぶが小さい、が見せ場。ハトに近づかない・追いかけない・エサをあげない、巣を見つけてもさわらずそっとはなれる注意を入れる） | 候補 |
| snail-first-shell | [カタツムリの赤ちゃんは、最初の殻をどこで見つけるの？](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/snail-first-shell.md) | 候補 |
| banana-seeds | バナナには種が見当たらないのに、次のバナナはどうやって育つの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/banana-seeds.md)。まんなかの黒いつぶは種ではなく種になれなかった「胚珠」のあと、野生のバナナには黒くてかたい種がぎっしり、食べるバナナは花粉がつかなくても実だけ太る、「バナナの木」は葉のつけねが重なった草で実をつけるのは一生に一度、次のバナナは根もとから出る子ども「吸芽」から育つ、が見せ場。包丁は大人が使う・植物園のバナナは見るだけの注意を入れる） | 候補 |
| strawberry-seeds | いちごのつぶつぶ、一粒だけ割ったら中には何があるの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/strawberry-seeds.md)。つぶは種ではなく1つぶ1つぶが「実」で中に種が1つ、赤いところは花のつけね（花托）、つぶを全部取るといちごは大きくならず1つ残すとそこだけふくらむ、が見せ場。包丁は大人・つぶは割ろうとしない注意を入れる） | 候補 |
| fish-thirsty | 魚ものどがかわくの？ 海の魚は海水を飲むの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/fish-drink-seawater.md)。魚の体の水は海水よりずっとうすい（およそ3分の1）、水は塩のこいほうへひっぱられるので海の魚は体の水が海へにげる、だから海水をごくごく飲んでおなかで水だけ取りこみ塩はえらから捨てる・おしっこは少し、川の魚は反対で水が入ってくるのでほとんど飲まずうすいおしっこをたくさん、ウナギとサケは切りかえ、サメは「にょうそ」で海と同じこさ、が見せ場。ガラスをたたかない・金魚の水に塩や海水を入れてためさない注意を入れる。メモは ideas/notes/fish-thirsty.md） | 候補 |
| mosquito-winter | 冬にいなくなった蚊は、春になるとどこから来るの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/mosquito-winter.md)。遠くから来るのではなく近くで冬ごし：ヒトスジシマカは秋に日が短くなると「休む卵」を産み卵のまま水ぎわの上で冬をこして春にかえる、アカイエカは交尾をすませたメスだけが血をすわずに花のみつで脂肪をためてほら穴や縁の下にかくれる、が見せ場。入れものや卵にさわらない・水をすてるのは大人の注意を入れる） | 候補 |
| numb-legs | 正座をしていると、どうして足がしびれるの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/seiza-numb-legs.md)。正座ではすねと足の甲に体の重さがのって足の先へ行く血がちょろちょろに、足の神経は血から酸素をもらってはたらくので、さわった感じや足の位置を伝える太い神経から先におやすみ（さわってもわからない）、立つと血がどっともどって神経がいっせいに合図を出すのが「ジンジン」（やめて3分ごろが山、5〜10分で消える）、しびれた足ですぐ歩くとふらつく、が見せ場。わざと長く正座してためさない・しびれているうちは歩きまわらず壁や大人につかまって立つ注意を入れる。メモは ideas/notes/numb-legs.md） | 候補 |
| bed-hair | 朝起きると、どうして寝ぐせがつくの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/nails-hair-bedhead.md)。かみの中の「よわい て」はぬれるとはなれ・かわくとつながる、ぬれたかみはふにゃふにゃ・かわくとかちかち、しめったまま寝ると頭の重さで曲がったままかわいて形がのこる、ねている間に子どもは1時間に4回ほど向きをかえる、ぬらして根元から毛先へのばし・あたためてひやして直す、が見せ場。ドライヤーは大人が使う注意を入れる。メモは ideas/notes/bed-hair.md） | 候補 |
| bruise | 強くぶつけると、どうして青あざができるの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/bruise-color.md)。ぶつけると皮ふの下の細い血管がプチッと切れて血がたまる・皮ふは切れていないので外に出ない、赤い血が皮ふごしに青っぽく見える、おそうじの細胞マクロファージが血をこわし色のもとがヘム→ビリベルジン（緑）→ビリルビン（黄）と変わるので あざも青→緑→黄色→消える（たいてい2週間）、歩くようになるとすねとひざにふえる、が見せ場。あざは押さない・わざとぶつけない・冷やすのは大人とタオルでつつんだ氷で、の注意を入れる。メモは ideas/notes/bruise.md） | 候補 |
| blinking | 人は、どうして何回もまばたきをするの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/eye-blink-why.md)。目を開けたままだと なみだの膜が切れて乾く・まぶたは なみだを ぬりなおすワイパー、閉じるのは速く開けるのはゆっくり、1日に合わせて約1時間まばたきしているのに脳が気づかせない、赤ちゃんは1分に2〜3回、が見せ場。なみだの通り道の話は eye-tears-blink の回と重ねない。目にさわらない・指や物を近づけてためさない・まばたきをがまんしつづけない注意を入れる。メモは ideas/notes/blinking.md） | 候補 |
| earwax | 耳の中には、どうして耳あかがたまるの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/ear-earwax.md)。耳あかを作るせんは入り口がわの3分の1だけ・あぶら＋はがれた古い皮ふ（重さの約6割）＋ほこり、耳の穴の皮ふは鼓膜のまん中から外へ動くベルトコンベアで耳あかを入り口へ運ぶ（鼓膜につけたインクの点が外へ動く・つめがのびるくらいの速さ）、日本人の7〜8割はカサカサで遺伝子の1文字で決まる、が見せ場。耳の穴にぼうや指を入れない・おくまでいじると押しこんでふさがる・そうじは大人が入り口をそっとふくくらい・めんぼうは小さな子のとどかない所に、の注意を入れる。メモは ideas/notes/earwax.md） | 候補 |
| motion-sickness | 車やバスに乗ると、どうして乗り物酔いするの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/motion-sickness-car.md)。耳のおくには おみずの入った3つの輪（半規管）と石のつぶ（耳石器）があり体の動きを感じる、車で絵本を見ると耳のおくは「ゆれてる」・目は「止まってる」と知らせがくいちがって脳がとまどう、5秒に1回くらいのゆっくりしたゆれほど酔いやすい、運転する人は酔いにくい、2歳まではほとんど酔わず小学生のころがいちばん、耳のおくのバランスの係がはたらかない人は酔わない（ギャローデットの11人）、が見せ場。シートベルトはしめたまま・窓から顔や手を出さない・気持ちが悪くなったら早めに大人に言う・わざと本や画面を見てためさない注意を入れる。メモは ideas/notes/motion-sickness.md） | 候補 |
| snoring | 寝ているとき、どうしていびきをかくの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/snoring-sleep.md)。ねむるとのどの筋肉がゆるんで舌が奥へ下がり、せまくなった空気の通り道でのどのやわらかいところがブルブルふるえるのが「グーッ」の音、起きているときとねむっているときの のどの断面くらべ、あおむけで大きくなりやすく横向きで静かになることも、子どもは のどのおくの扁桃と鼻のおくのアデノイドが2〜6歳でいちばん大きい、が見せ場。ねている人の口や鼻をふさがない・体をおさない、息が止まるいびきは大人がお医者さんに相談、の注意を入れる。メモは ideas/notes/snoring.md） | 候補 |
| sunburn | 外で遊ぶと、どうして肌が黒く日焼けするの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/sunburn-tan.md)。しがいせん（UV-B）がひふの細胞の設計図に傷をつけると、表皮のいちばん下の「いろの さいぼう」がメラニンをどんどん作ってまわりに配り、もらった細胞はメラニンを核の上にぼうしのようにのせて設計図を守る、あかく ひりひりは数時間後・くろくなるのは赤みが消えた数日後、くもりでも晴れの約6わり・日陰でも約半分とどく、日焼けは健康のしるしではなく守りの反応、が見せ場。おひさまを直接見ない・日焼けをためすために日なたに長くいない注意を入れる。メモは ideas/notes/sunburn.md） | 候補 |
| dark-adaptation | 暗い部屋に入ると、どうしてだんだん見えてくるの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/eye-dark-adaptation.md)。暗い所ではたらく「かんたい」の光をつかまえる「ロドプシン」は明るい光でこわれ、暗い所で少しずつ作り直すのでだんだん見える、先にすいたい・約10分でかんたいに交代・30分ほどでいちばんよく見える、ひとみが大きくなるだけでは足りない、明るい光を見ると数秒でもとどおり、暗いと色がわからない、が見せ場。暗い中では歩きまわらずすわってじっと・電気は大人が、の注意を入れる。メモは ideas/notes/dark-adaptation.md） | 候補 |
| ice-cream-headache | かき氷やアイスを食べると、どうして頭がキーンとするの？ | 記事作成待ち |
| tape-sticky | テープは、どうしてペタッとくっつくの？ | 記事作成待ち |
| suction-cup | 吸盤は、どうして壁にくっつくの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/suction-cup-sticks.md)。吸盤は「すいつく」のではなく まわりの空気に押されている：ぎゅっと押すと中の空気がふちから出ていき、ゴムがもとのおわんの形にもどろうとして中の空気がうすくなる、外の空気は強く・中は弱く押すので壁に押しつけられる（1cm²に約1kg、直径6cmの吸盤で19kgまでたえた）、空気をぬいた入れものの中では10秒ほどで全部落ちる、ざらざらの壁やすりガラスではふちのすき間から空気が入って中からも押すので落ちる、が見せ場。窓や鏡でためすときは大人と・吸盤にぶらさがらない・顔や体にくっつけない注意を入れる。メモは ideas/notes/suction-cup.md） | 候補 |
| straw | ストローで吸うと、どうしてジュースが上がってくるの？ | 記事作成待ち |
| magnifying-glass | 虫めがねでのぞくと、どうして物が大きく見えるの？ | 記事作成待ち |
| coin-holes | 5円玉と50円玉に穴があいているのは、どうして？ | 記事作成待ち |
| siren-doppler | 救急車が通りすぎると、どうしてサイレンの音が変わるの？ | 記事作成待ち |
| contrail | 飛行機が飛んだあと、どうして空に白い線がのこるの？ | 記事作成待ち |
| summer-winter | どうして夏は暑くて、冬は寒いの？ | 記事作成待ち |
| water-strider | アメンボは、どうして水の上を歩けるの？ | 記事作成待ち |
| spider-silk | クモは、どうしておしりから糸を出せるの？ | 記事作成待ち |

※ 問いの例は目安。元記事リンクがある行は、リンク先の問いをその動画で扱う。動画IDは制作フォルダ名として使う。

## 動画化を見送る題材

以下は制作順に入れない。動画にしたくなる具体的な問いが見つかったときに見直す。自動で候補を補充するときは、この表の項目を追加しない。

| サイトのもの | 見送りの理由 |
|---|---|
| rubber | 消しゴムの問いを鉛筆の回にまとめる。サイトの「ゴム」は別の題材。 |
| tofu | 材料の紹介が中心になりやすい。 |
| bandage | 粘着の説明が中心で、けがの題材はかさぶたの回がある。 |
| plastic-bag | 素材と製法の説明が中心になりやすい。 |
| paper | 材料と製法の説明が中心。紙の意外な使い方は段ボールの回で扱える。 |
| plate | 「割れる」だけでは問いが広く、答えを想像しやすい。 |
| melamine-cup | 名前を聞いただけでは普段使うコップと結びつきにくい。 |
| outlet | 穴の長さの違いが小さく、子どもに見せる場面が作りにくい。 |
| lights | 「電気はどうして光る？」では題材が広く、説明に寄りやすい。 |
| air-conditioner | 冷たい風の仕組みを伝えるまでに、冷媒や熱の移動の説明が要る。 |
| curtain | 光をさえぎるという問いは、答えを想像しやすい。 |
| car | 「どう走る？」では題材が広い。乗りものは具体的な謎のある回を先にする。 |
| road | わずかな傾きを画面で伝えにくく、横断歩道のほうが違いを見せやすい。 |
| stairs | 段の高さがそろう理由は想像しやすい。階段の動きはエスカレーターの回で扱う。 |
| vinyl | 素材名と材料の説明が中心で、身近な場面から入りにくい。 |
| toothpaste | 制作見送り。歯みがき粉のしましまは、どうして混ざらずに出てくる？ |
| microwave | 制作見送り。中が見える電子レンジのドアは、どうして電波を外に逃がさない？ |
| ketchup | 制作見送り。ケチャップは、どうして出ないと思ったら急にドバッと出る？ |
| pill-bug-turn | 制作見送り。ダンゴムシは、右に曲がったら次は左に曲がる？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/pill-bug-turn.md)） |
| train | 制作見送り。電車の上の電線は、どうしてジグザグなの？ |
| station | 制作見送り。改札に入れたきっぷは、どうやって人より先に出てくる？ |
| building | 制作見送り。ビルの屋上のクレーンは、工事が終わったらどうやって降りる？ |
| crosswalk | 制作見送り。横断歩道の白い線は、どうして車のライトで光る？ |
| remote-and-wifi | 制作見送り。テレビのリモコンは、どうやって見えない光で合図する？ |
| tunnel | 制作見送り。トンネルは、どうして入口だけライトが多いの？ |
| moon-illusion | 制作見送り。のぼったばかりの月は、どうして大きく見える？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/moon-illusion.md)） |
| cardboard | 制作見送り。段ボールは、どうして紙だけで重い荷物を支えられる？ |
| emergency-exit | 制作見送り。非常口のマークは、どうして停電しても光る？ |
| photo | 制作見送り。小さな穴を通ると、どうして景色がさかさまに映る？ |
| rice | 制作見送り。お米をとぐと、どうして水が白くなる？ |
| futon | 制作見送り。干したふとんの「お日さまのにおい」って、なんのにおい？ |
| crayon | 制作見送り。クレヨンで描いたところは、どうして絵の具をはじく？ |
| mayonnaise | 制作見送り。マヨネーズは、どうして油とお酢が分かれない？ |
| body-fat | 制作見送り。体が使った脂肪は、最後にどこへ行くの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/body-fat-where-it-goes.md)） |
| height | 制作見送り。朝と夜で、背の高さが変わるってほんと？ |
| eyes | 制作見送り。目を開けているのに、見えない場所があるってほんと？ |
