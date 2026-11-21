# mosquito-bite（蚊にさされると、どうしてかゆくなるの？）動画用メモ

元記事：[蚊にさされると、どうしてかゆくなるのか](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/mosquito-bite-itch.md)（公開ページ https://nozomitaguchi.github.io/everyday-trivia/t/mosquito-bite-itch/ ）
図鑑の「もの」：`items/mosquito.md`（か、いきもの）。図はすべて `everyday-trivia/assets/figures-mosquito.js`（2026-11-21 作成）。

## 問い

蚊にさされると、どうしてかゆくなるの？
（つかみ：うでにとまった蚊が飛んでいったあと、しばらくして「ぷくっ」とふくらんでかゆくなる。蚊はもういないのに、だれがかゆくしているの？）

## 見せ場

- **1本に見える口が、さやと6本の針に分かれる**：さや（下くちびる）がうしろへ下がり、皮ふに入るのは針のたばだけ。ここを動きで見せるのが一番の見せ場
- **皮ふの中で針の先が曲がって、血管をさがす**：何度もさし直す（実験では8割が3〜5回）。さがしているあいだに、だ液を出す
- **2本の管**：だ液が下りる管（下咽頭）と、血がのぼる管（上くちびるのみぞ）が別々。だ液を入れながら血をすえる
- **かゆくしているのは自分の体**：見張り役の細胞（肥満細胞）がだ液に気づいて、ヒスタミンをいっせいに出す → 血管が広がり水がしみ出して「ぷくっ」
- **すぐのかゆみと、次の日のかゆみ**：さされて2〜3分後の赤いぷっくりと、1〜2日後のかたい赤茶色のふくらみを左右に並べる

## 説明の順番（5場面）

1. 血をすうのはメスだけ（卵を産むとき）。オスや卵を産まないメスは草の汁　図：`mq-female-male`、`mq-eggs`
2. 口はさやと6本の針。皮ふに入るのは針のたばだけ。小あごはのこぎりのような刃で、1秒に6〜7回さしこむ　図：`mq-mouth-parts`、`mq-sheath`、`mq-saw`
3. 針の先は皮ふの中で曲がって血管をさがす。さがしながらだ液を出す。だ液には血を固まりにくくするものが入っている（2本の管）　図：`mq-probe`、`mq-two-tubes`、`mq-saliva`、`mq-timeline`
4. 体の見張り役がだ液に気づいてヒスタミンを出す → ぷくっとふくらみ、かゆくなる　図：`mq-alarm`、`mq-histamine`
5. すぐのかゆみと次の日のかゆみ。どちらが出るかは人や、それまでにさされた回数で変わる　図：`mq-two-reactions`、`mq-people`（入れるなら `mq-stages`）

（入れるなら短く）だ液の中には、反対にかゆみのもとにくっついておさえるたんぱく質（D7）もあり、吸っているあいだに気づかれにくくする役に立つと説明されている　図：`mq-d7`
（使わなくてよい）しくみがまだはっきりしない3つの道 `mq-three-ways`

予想の3択の案：蚊にさされると、どうしてかゆくなる？（正解：蚊のだ液に、自分の体が気づいてこたえるから）。ほかの選択肢は「針の傷がいたむから」「蚊がどくを入れて皮ふをとかすから」など。正解の番号は cast.py に従う。

## 言い方の注意

- 「血をすうのはメスだけ」「オスはささない」は CDC と京都市の資料どおり。「多くのメスは血をすわないと卵をつくれない」（すべてではない）
- 6本の針の名前：上くちびる（上唇）、大あご2本、小あご2本、下咽頭。さやは下くちびる（下唇）。ナレーションでは「さや」「6本の はり」だけでよい
- 皮ふの中で曲がる・さし直す・時間（さがす約2分20秒、すう4分）は**ハマダラカの一種をネズミで見た実験**の結果。人で言いきらない。数字を使うなら「実験では」と添える
- かゆみの主役はヒスタミンと「考えられている」。くわしいしくみはまだはっきりしていない（「わかっていない」ことは言いきらない）
- 年齢で反応がちがう（赤ちゃんは次の日、大人はすぐ、など）は確かめられていないので**言わない**。言えるのは「人によってちがう」「さされた回数で変わっていく」まで
- 「蚊が毒を入れる」とは言わない（記事は、だ液と体のこたえで説明している）
- かゆみ止めの薬の名前・使い方は扱わない

## みてみよう と注意書き

- さされてすぐのふくらみと、次の日のふくらみを見くらべる（大きさ・色・ぷっくりかかたそうか）。予想してから見る
- **注意（必ず入れる）**：かかない（かき傷からばい菌が入ることがある）。石けんと水であらって冷やす。ふくらみが大きいときや熱をもつときは大人に見せる。蚊はつかまえたり手でたたいたりせず、口のつくりは絵で見る
- 図：`mq-look`、`mq-cool`

## 出典（概要欄用）

- CDC「About Mosquito Bites」https://www.cdc.gov/mosquitoes/about/about-mosquito-bites.html
- 京都市 蚊の解説資料（PDF）https://www.city.kyoto.lg.jp/hokenfukushi/cmsfiles/contents/0000353/353019/kanitsuite.pdf
- NC State University, ENT 425「Mouthparts」https://genent.cals.ncsu.edu/bug-bytes/mouthparts
- Lee, R.（1974）Quaestiones Entomologicae 10: 187–215 https://nature.berkeley.edu/~kipwill/QE%20documents%20for%20public/Lee%201974%20QEv10n3%20187_215%20CC%20released.pdf
- Choumet V, et al.（2012）PLoS ONE 7(12): e50464 https://pmc.ncbi.nlm.nih.gov/articles/PMC3521732/
- Vander Does A, Labib A, Yosipovitch G.（2022）Frontiers in Immunology 13: 1024559 https://www.frontiersin.org/journals/immunology/articles/10.3389/fimmu.2022.1024559/full
- 日本OTC医薬品協会「おくすりＱ＆Ａ：虫さされ薬」https://jsmi.jp/qa/mushisasare.html
