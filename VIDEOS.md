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
| pill-bug | だんごむしは、どうして丸くなる？ | 完成 |
| scab | けがのあと、どうしてかさぶたができる？ | 公開 |
| moon | 月は、どうして形が変わる？ | 公開 |
| tummy-rumble | おなかは、どうして鳴る？ | 公開 |
| mirror | 鏡は、どうして左右が反対に見える？ | 完成 |
| eye-tears-blink | 泣くと、どうして鼻水まで出るの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/eye-tears-blink.md)） | 公開 |
| sky-cloud-white | 白い雲と黒っぽい雨雲、何がちがうの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/sky-cloud-white.md)） | 公開 |
| power-lines | 電線に止まった鳥は、どうしてしびれない？ | 公開 |
| escalator | エスカレーターの階段は、消えたあとどこへ行く？ | 完成 |
| cold | かぜをひくと、どうして体は熱を出す？ | 完成 |
| autumn-leaves | 葉っぱは、どうして秋になると赤や黄色になるの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/autumn-leaves-color.md)） | 完成 |
| nails-and-hair | つめや髪は、どうして切っても痛くない？ | 完成 |
| futon-warmth | おふとんは、どうして入ったときは冷たいのに、だんだんあったかくなるの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/futon-warmth.md)） | 完成 |
| key | 鍵を回すと、ドアの中で何が動いて開くの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/key-lock.md)） | 保留 |
| winter-trees | 冬、葉っぱがなくなる木と、緑のままの木があるのはなぜ？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/tree-winter-leaves.md)） | 完成 |
| rain-snow | 空の上では何が起きて、雨になったり雪になったりするの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/rain-snow.md)） | 完成 |
| toilet | トイレは、流したあともどうして少し水が残るの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/toilet-water.md)） | 完成 |
| white-breath-steam | 寒いとき、湯気や白い息が見えるのはなぜ？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/steam-white-breath.md)。白いのは水蒸気ではなく小さな水のつぶ、が見せ場。湯気の出口には近づかない・さわらない注意を入れる） | 完成 |
| car-drive | アクセルを踏むと、どうやってタイヤまで力が届くの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/car-drivetrain.md)） | 保留 |
| wheel-to-car | 車輪がついた荷車は、いつ自分で走る車になったの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/car-wheel-to-car.md)） | 保留 |
| ant | アリの行列は、どうやって同じ道を見つける？ | 完成 |
| digestion | 食べたものは、どうやってうんちになる？ | 完成 |
| pet-bottle | 炭酸のペットボトルは、どうして底が花びらみたいな形？ | 保留 |
| pencil | 鉛筆は、どうして消しゴムで消える？ | 完成 |
| baby-teeth | 子どもの歯は、どうしてぬけて生えかわるの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/baby-teeth.md)） | 完成 |
| yawn | あくびは、どうしてうつるの？（わかっていないことは「わかっていない」と言う）（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/yawn-contagious.md)） | 保留 |
| mosquito-bite | 蚊にさされると、どうしてかゆくなるの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/mosquito-bite-itch.md)） | 完成 |
| morning-glory | あさがおのつるは、どうやって棒に巻きつくの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/morning-glory-twining.md)） | 保留 |
| dandelion | たんぽぽのわたげは、どうして遠くまで飛べるの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/dandelion-seed-flight.md)） | 完成 |
| honeycomb | ハチの巣は、どうして六角形なの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/bee-honeycomb-hexagon.md)。実物には近づかない。みてみようは写真や図で） | 完成 |
| rainbow | にじは、どうして雨のあとに出て、七色に見えるの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/rainbow-after-rain.md)） | 仕上げ中（2026-11-22 19:59） |
| thunder | かみなりは、どうして光ってから音がするの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/thunder-light-sound.md)） | 完成 |
| faucet | 蛇口をひねると、どうしていつでも水が出てくるの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/faucet-water-pressure.md)） | 仕上げ中（2026-11-22 20:49） |
| recorded-voice | 録音した自分の声は、どうして別人みたいに聞こえるの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/voice-recorded.md)） | 仕上げ中（2026-11-22 20:49） |
| rain-ground-water | 雨がふったあと、地面の水はどこへ行くの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/rain-ground-water.md)） | 仕上げ中（2026-11-23 02:25） |
| ice-melt | 氷は、どうしてとけるの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/ice-melt.md)） | 仕上げ中（2026-11-22 20:50） |
| finger-wrinkles | おふろに入ると、どうして指がしわしわになるの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/finger-wrinkles.md)。わかっていないことは「わかっていない」と言う） | 完成 |
| goosebumps | 寒いと、どうして鳥肌が立つの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/goosebumps-cold.md)） | 仕上げ待ち |
| shadow | かげは、どうして自分と同じ形になるの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/shadow-shape.md)。太陽そのものは見ない） | 下書き中（2026-11-22 20:56） |
| airplane | 飛行機は、あんなに重いのに、どうして空を飛べるの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/airplane-lift.md)） | 下書き中（2026-11-22 20:56） |
| soap-bubble | シャボン玉は、どうして丸くなるの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/soap-bubble-round.md)。星の輪でふいても丸い、が見せ場。石けん水は口や目に入れない） | 下書き中（2026-11-22 20:53） |
| sea-salty | 海の水は、どうしてしょっぱいの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/sea-salty.md)。海の水は飲まない注意を入れる） | 下書き中（2026-11-22 21:17） |
| wind | 風は、どうしてふくの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/wind-blow.md)） | 完成 |
| snow-white | 雪は、どうして白いの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/snow-white.md)） | 下書き中（2026-11-22 21:16） |
| sneeze | くしゃみは、どうして出るの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/sneeze-reflex.md)） | 下書き中（2026-11-22 20:54） |
| soap | 石けんで洗うと、どうしてよごれが落ちるの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/soap-washing.md)） | 下書き中（2026-11-22 21:11） |
| cicada | セミは、どうして夏になると鳴くの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/cicada-summer-song.md)） | 候補 |
| fish-gills | 魚は、どうして水の中で息ができるの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/fish-gills.md)。口とえらぶたの かわりばんこ、えらの3段ズーム、空気の中ではえらがしぼむ、が見せ場。魚は水から出さない・水そうに手を入れない注意を入れる） | 候補 |
| bird-fly | 鳥は、どうして空を飛べるの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/bird-flight.md)。打ちおろしで羽根が重なり、打ち上げではすきまが開く、が見せ場。骨は「軽いから飛べる」とは言わない。ハトに近づかない・追いかけない、太陽は見ない注意を入れる） | 候補 |
| dog-panting | 犬は、どうして舌を出してハアハアするの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/dog-panting.md)。汗をかけるのはほぼ肉球だけ、鼻から吸って口から出す、が見せ場。知らない犬に近づかない・さわるときは飼い主に聞く、暑い日の散歩と車内の注意を入れる） | 候補 |
| lights-off-dark | 電気を消すと、どうして部屋が暗くなるの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/lights-off-dark.md)。光は外へにげずに、壁や物に当たるたびに吸いこまれて熱になる、が見せ場。スイッチは大人が・暗い中は歩きまわらない注意を入れる） | 候補 |
| train-wheel-curve | 電車は、ハンドルがないのに、どうやってカーブを曲がるの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/train-wheel-curve.md）） | 候補 |
| poop-color | うんちは、どうして茶色いの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/poop-color.md）） | 候補 |
| cold-mucus-color | かぜをひくと、鼻水が黄色くなるのはどうして？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/cold-mucus-color.md）） | 候補 |
| fridge | 冷蔵庫は中を冷やしているのに、どうして外があったかくなるの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/fridge-warm-outside.md)。冷たさを作るのではなく中の熱を外へ運ぶ、外へ出す熱は中の熱＋モーターの分なのでドアを開けっぱなしでも部屋は涼しくならない、が見せ場。うしろや下の機械にさわらない・さわるのは大人、の注意を入れる） | 候補 |
| washing-machine | 洗濯機は、服を回すだけでどうして水をしぼれるの？ | 記事作成待ち |
| static-shock | 冬にドアをさわると、どうしてバチッとなるの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/static-shock-door.md)。歩くとでんしが引っこしして体にたまり、乾いた冬はにげない、金属に近づくと空気をとびこえる小さなかみなり、が見せ場。わざとバチッとさせない・ガソリンスタンドのシートと給油は大人、の注意を入れる） | 候補 |
| mochi-puff | おもちは、焼くとどうしてふくらむの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/rice-mochi-puff.md)。お正月の題材。中の水が目に見えない水蒸気になってかさが約1700倍、のびる網目が風船のゴムになる、が見せ場。焼くのは大人・焼きたては熱いのでさわらない、のどにつまらせない（小さく切る・のどをしめらせる）注意を入れる） | 候補 |
| mikan-white-threads | みかんの白いすじは、何のためにあるの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/mikan-white-threads.md)。すじは木から水と栄養を運んだ通り道、なのに中のつぶつぶには管がなく細胞から細胞へ手わたし、が見せ場。皮の内側の白いふわふわ（アルベド）とは別もの。むく前に手をあらう） | 候補 |
| hiccup | しゃっくりは、どうして急に出て止まらないの？（[元記事](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/hiccup-diaphragm.md)。横隔膜が勝手にピクッ → 声のとびらがパタンで「ヒック」、だから吸うときに鳴る、が見せ場。何のためかは「わかっていない」と言う。水を一気に飲む・袋をかぶせる・おどかす、で止めようとしない注意を入れる） | 候補 |
| heartbeat-running | 走ると、どうして心臓がドキドキするの？ | 記事作成待ち |
| sweat | あせは、どうして出るの？ | 記事作成待ち |
| navel | おへそは、何のためにあるの？ | 記事作成待ち |
| star-twinkle | 星は、どうしてキラキラまたたくの？ | 記事作成待ち |
| moon-follows-car | 車に乗ると、どうしてお月さまがずっとついてくるの？ | 記事作成待ち |
| supermarket-egg-chick | スーパーのたまごを温めたら、ひよこは生まれる？ | 記事作成待ち |
| aquarium-big-fish | 水族館の大きな魚は、となりの小さな魚を食べちゃわないの？ | 記事作成待ち |
| pigeon-babies | 公園にハトはあんなにいるのに、赤ちゃんはどこにいるの？ | 記事作成待ち |
| snail-first-shell | カタツムリの赤ちゃんは、最初の殻をどこで見つけるの？ | 記事作成待ち |
| banana-seeds | バナナには種が見当たらないのに、次のバナナはどうやって育つの？ | 記事作成待ち |
| strawberry-seeds | いちごのつぶつぶ、一粒だけ割ったら中には何があるの？ | 記事作成待ち |
| fish-thirsty | 魚ものどがかわくの？ 海の魚は海水を飲むの？ | 記事作成待ち |
| mosquito-winter | 冬にいなくなった蚊は、春になるとどこから来るの？ | 記事作成待ち |
| numb-legs | 正座をしていると、どうして足がしびれるの？ | 記事作成待ち |
| bed-hair | 朝起きると、どうして寝ぐせがつくの？ | 記事作成待ち |
| bruise | 強くぶつけると、どうして青あざができるの？ | 記事作成待ち |
| blinking | 人は、どうして何回もまばたきをするの？（なみだの回と重ならないように） | 記事作成待ち |
| earwax | 耳の中には、どうして耳あかがたまるの？ | 記事作成待ち |
| motion-sickness | 車やバスに乗ると、どうして乗り物酔いするの？ | 記事作成待ち |
| snoring | 寝ているとき、どうしていびきをかくの？ | 記事作成待ち |
| sunburn | 外で遊ぶと、どうして肌が黒く日焼けするの？ | 記事作成待ち |
| dark-adaptation | 暗い部屋に入ると、どうしてだんだん見えてくるの？ | 記事作成待ち |
| ice-cream-headache | かき氷やアイスを食べると、どうして頭がキーンとするの？ | 記事作成待ち |
| tape-sticky | テープは、どうしてペタッとくっつくの？ | 記事作成待ち |
| suction-cup | 吸盤は、どうして壁にくっつくの？ | 記事作成待ち |
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
