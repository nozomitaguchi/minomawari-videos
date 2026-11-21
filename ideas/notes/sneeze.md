# sneeze（くしゃみ）動画用メモ

元記事：[くしゃみはなぜ出るのか、鼻の見張り役から脳の奥へ、「吸う・ためる・ドカン」の3段階…](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/sneeze-reflex.md)（2026-11-22 作成）
サイト：https://nozomitaguchi.github.io/everyday-trivia/i/sneeze/
図：`everyday-trivia/assets/figures-sneeze.js`（名前はすべて `sn-` ではじまる。いちばん上の絵は `sneeze-reflex`）
色の約束：しらせ（神経）＝きいろ、すう息＝あお、だす息＝オレンジ、延髄＝むらさき

## 問い

くしゃみは、どうして出るの？
答えの軸：**くしゃみは、鼻に入ったほこりや花粉などの じゃまものを、いきおいよく外へ追い出すための「反射」（考える前に体が勝手に動くしくみ）。鼻の中の見張り役の神経（三叉神経）が気づき、知らせが脳の奥の「延髄」にとどき、そこから「すう → ためる → ドカン」の順で命令が出る。**

## 見せ場

- 予想の3択の例：「くしゃみが でる まえに、からだは まず なにを する？」（いきを とめる／いきを いっぱい すう／いきを はく → 正解は いきを いっぱい すう）。または「はなに はいった ほこりに、だれが きづく？」（め／はなの なかの しんけい／みみ → はなの なかの しんけい）。正解の番号は cast.py に従う
- 「ムズムズ…はっ はっ…ハクション！」を、からだの横の断面で 3段階のアニメにする：1 すう（肺がふくらみ、横隔膜が下がる、`sn-step1`）→ 2 ためる（口の天井のやわらかいところ＝軟口蓋が下がって、鼻の奥への通り道をふさぐ、`sn-step2`）→ 3 ドカン（声門が開いて、速い空気が鼻から出る、`sn-step3`）
- 鼻の中の見張り役（きいろの線）が光って、知らせが脳の奥の延髄（むらさき）へ走り、そこから胸・おなかの筋肉へ赤い点線で命令が下りる（`sn-trigeminal` → `sn-center`）
- 延髄の右側の血管がつまった人は、右の鼻をくすぐってもくしゃみが出なかったのに、左の鼻ならふつうに出た（2005年、スペイン。`sn-case`）
- 鼻の内がわを大きく見ると、細い毛（線毛）が鼻水を運んでいる。くしゃみの押す力で「スイッチ オン」、コンピューターの再起動みたい（2012年、ペンシルベニア大学。`sn-reset`）
- まぶしい日ざしでくしゃみが出る人もいる。わけは まだ わかっていない（`sn-light`）

## 場面の順番（説明は5場面）

1. 鼻の中の見張り役：鼻の内がわ（粘膜）にある三叉神経の先が、ほこり・花粉・煙、急に吸った冷たい空気などに気づく（`sn-trigeminal`、`sn-triggers`）
2. 知らせは脳の奥の延髄へ。そこが「くしゃみの場所」。右側がつまった人の例（`sn-center`、`sn-case`）。余裕があればマウスの実験：知らせを運ぶ神経をなくすと、くしゃみが止まった（2021年、ワシントン大学。`sn-mouse`）
3. 「すう → ためる → ドカン」の3段階（`sn-step1`、`sn-step2`、`sn-step3`）
4. くしゃみの息は速い：いちばん速いときで1秒に10〜30メートル（MIT、2020年）。しぶきは2メートルほど飛ぶ（厚生労働省）（`sn-speed`、`sn-droplets`）。だから手ではなく、そでやティッシュで口と鼻をおおう（`sn-etiquette`）
5. くしゃみは鼻の中の「リセット」。ほこりを追い出し、鼻水を運ぶはたらきのスイッチを入れる（`sn-reset`、`sn-out`）。まぶしいと出る人もいる（`sn-light`）

みてみよう：家族がくしゃみをしそうなとき、出る前の「はっ、はっ」（すう）と「ハクション！」（ドカン）を見くらべる。自分は、そでの内がわで口と鼻をおおう（`sn-look`）。

## 注意書き・言いかたの注意

- **鼻の中に指や物を入れない。こしょうなどで わざとくしゃみを出させない。人のほうを向いてくしゃみをしない。** 動画の「みてみよう」で必ず言う
- くしゃみは手でおさえず、そで・ティッシュ・マスクで口と鼻をおおう（厚生労働省の咳エチケット）。ティッシュはすぐごみ箱へ
- 「くしゃみの息は時速100キロ」「しぶきが何万個」は記事に書いていない（もとの測定をたどれなかった。inbox）。言うのは「1秒に10〜30メートルに達することがある」「しぶきは2メートルほど飛ぶ」まで。「7〜8メートル先まで」は MIT の研究者の見つもり（しぶきをかかえた空気のかたまり）なので、言うなら「〜まで いく ことも ある」と弱めに
- 「くしゃみをすると目が閉じる」「目を開けたままだと目が飛び出す」は確かめていない（inbox）。言わない。キャラクターが目を細める絵はよいが、ナレーションで理由を言わない
- 光でくしゃみが出るしくみは「まだ わかっていない」と言う。割合（57％、35％）は子ども向けには言わない
- かぜやアレルギーなどの病気の話にはふみこまない（かぜは別の記事 `common-cold.md` で扱っている）。こわがらせない
- 吹き出しの例：おとうと「はっ…はっ…」（すう場面）／おねえちゃん「そでで かくすんだよね！」（エチケットの場面）／カメレオン（ルーペで鼻の中の線毛を見る）

## 出典（概要欄用）

- Rui ほか 2025, The sneeze reflex in physiological and pathological states: a mini review（Frontiers in Neuroscience 19巻）https://www.frontiersin.org/journals/neuroscience/articles/10.3389/fnins.2025.1598027/full
- Seijo-Martínez ほか 2006, Sneeze related area in the medulla: localisation of the human sneezing centre?（Journal of Neurology, Neurosurgery & Psychiatry 77巻）https://pmc.ncbi.nlm.nih.gov/articles/PMC2077498
- ワシントン大学医学部「What makes us sneeze?」（2021年）https://source.washu.edu/2021/06/what-makes-us-sneeze/
- Bourouiba 2020, Turbulent Gas Clouds and Respiratory Pathogen Emissions（JAMA 323巻）https://jamanetwork.com/journals/jama/fullarticle/2763852
- 厚生労働省「咳エチケット」https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/0000187997.html
- ペンシルベニア大学「The biology of a sneeze: rebooting」（2012年）https://pennmedicine.org/news/news-blog/2012/may/biology-of-a-sneeze-rebooting
- FASEB「Sneezing is the body's natural reboot」（EurekAlert!, 2012年）https://www.eurekalert.org/news-releases/735403
- Kulas ほか 2017, photo-induced sneezing reflex in the German population（European Archives of Oto-Rhino-Laryngology 274巻）https://pubmed.ncbi.nlm.nih.gov/27568353/
