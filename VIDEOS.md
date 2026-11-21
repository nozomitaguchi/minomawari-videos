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
| scab | けがのあと、どうしてかさぶたができる？ | 完成 |
| moon | 月は、どうして形が変わる？ | 公開 |
| tummy-rumble | おなかは、どうして鳴る？ | 公開 |
| mirror | 鏡は、どうして左右が反対に見える？ | 完成 |
| eye-tears-blink | 泣くと、どうして鼻水まで出るの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/eye-tears-blink.md)） | 完成 |
| sky-cloud-white | 白い雲と黒っぽい雨雲、何がちがうの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/sky-cloud-white.md)） | 完成 |
| power-lines | 電線に止まった鳥は、どうしてしびれない？ | 完成 |
| escalator | エスカレーターの階段は、消えたあとどこへ行く？ | 完成 |
| cold | かぜをひくと、どうして体は熱を出す？ | 完成 |
| autumn-leaves | 葉っぱは、どうして秋になると赤や黄色になるの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/autumn-leaves-color.md)） | ナレーション待ち |
| nails-and-hair | つめや髪は、どうして切っても痛くない？ | ナレーション待ち |
| futon-warmth | おふとんは、どうして入ったときは冷たいのに、だんだんあったかくなるの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/futon-warmth.md)） | 完成 |
| key | 鍵を回すと、ドアの中で何が動いて開くの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/key-lock.md)） | 保留 |
| winter-trees | 冬、葉っぱがなくなる木と、緑のままの木があるのはなぜ？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/tree-winter-leaves.md)） | ナレーション待ち |
| rain-snow | 空の上では何が起きて、雨になったり雪になったりするの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/rain-snow.md)） | ナレーション待ち |
| toilet | トイレは、流したあともどうして少し水が残るの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/toilet-water.md)） | ナレーション待ち |
| car-drive | アクセルを踏むと、どうやってタイヤまで力が届くの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/car-drivetrain.md)） | 保留 |
| wheel-to-car | 車輪がついた荷車は、いつ自分で走る車になったの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/car-wheel-to-car.md)） | 保留 |
| ant | アリの行列は、どうやって同じ道を見つける？ | 下書き中（2026-11-22 06:14） |
| digestion | 食べたものは、どうやってうんちになる？ | 候補 |
| pet-bottle | 炭酸のペットボトルは、どうして底が花びらみたいな形？ | 保留 |
| pencil | 鉛筆は、どうして消しゴムで消える？ | 候補 |
| baby-teeth | 子どもの歯は、どうしてぬけて生えかわるの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/baby-teeth.md)） | 候補 |
| yawn | あくびは、どうしてうつるの？（わかっていないことは「わかっていない」と言う）（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/yawn-contagious.md)） | 保留 |
| mosquito-bite | 蚊にさされると、どうしてかゆくなるの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/mosquito-bite-itch.md)） | 候補 |
| morning-glory | あさがおのつるは、どうやって棒に巻きつくの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/morning-glory-twining.md)） | 保留 |
| dandelion | たんぽぽのわたげは、どうして遠くまで飛べるの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/dandelion-seed-flight.md)） | 候補 |
| honeycomb | ハチの巣は、どうして六角形なの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/bee-honeycomb-hexagon.md)。実物には近づかない。みてみようは写真や図で） | 候補 |
| rainbow | にじは、どうして雨のあとに出て、七色に見えるの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/rainbow-after-rain.md)） | 候補 |
| thunder | かみなりは、どうして光ってから音がするの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/thunder-light-sound.md)） | 候補 |
| faucet | 蛇口をひねると、どうしていつでも水が出てくるの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/faucet-water-pressure.md)） | 候補 |
| recorded-voice | 録音した自分の声は、どうして別人みたいに聞こえるの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/voice-recorded.md)） | 候補 |
| rain-ground-water | 雨がふったあと、地面の水はどこへ行くの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/rain-ground-water.md)） | 候補 |
| ice-melt | 氷は、どうしてとけるの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/ice-melt.md)） | 候補 |
| finger-wrinkles | おふろに入ると、どうして指がしわしわになるの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/finger-wrinkles.md)。わかっていないことは「わかっていない」と言う） | 候補 |
| goosebumps | 寒いと、どうして鳥肌が立つの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/goosebumps-cold.md)） | 候補 |
| shadow | かげは、どうして自分と同じ形になるの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/shadow-shape.md)。太陽そのものは見ない） | 候補 |
| airplane | 飛行機は、あんなに重いのに、どうして空を飛べるの？ | 記事作成待ち |
| soap-bubble | シャボン玉は、どうして丸くなるの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/soap-bubble-round.md)。星の輪でふいても丸い、が見せ場。石けん水は口や目に入れない） | 候補 |
| sea-salty | 海の水は、どうしてしょっぱいの？ | 記事作成待ち |
| wind | 風は、どうしてふくの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/wind-blow.md)） | 候補 |
| snow-white | 雪は、どうして白いの？ | 記事作成待ち |
| sneeze | くしゃみは、どうして出るの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/sneeze-reflex.md)） | 候補 |
| soap | 石けんで洗うと、どうしてよごれが落ちるの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/soap-washing.md)） | 候補 |
| cicada | セミは、どうして夏になると鳴くの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/cicada-summer-song.md)） | 候補 |
| fish-gills | 魚は、どうして水の中で息ができるの？ | 記事作成待ち |
| bird-fly | 鳥は、どうして空を飛べるの？ | 記事作成待ち |
| dog-panting | 犬は、どうして舌を出してハアハアするの？ | 記事作成待ち |
| lights-off-dark | 電気を消すと、どうして部屋が暗くなるの？ | 記事作成待ち |

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
