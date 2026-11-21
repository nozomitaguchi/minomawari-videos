# goosebumps（寒いと鳥肌が立つわけ）動画用メモ

元記事：[寒いと、どうして鳥肌が立つのか…](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/goosebumps-cold.md)（2026-11-22 作成）
サイト：https://nozomitaguchi.github.io/everyday-trivia/i/goosebumps/
図：`everyday-trivia/assets/figures-goosebumps.js`（名前は `gb-` ではじまる。いちばん上の絵は `goosebumps-cold`）
色の約束：けの ねもとの きんにく（立毛筋）＝あか、こうかんしんけい＝きいろ、け＝こげちゃ、くうき＝みずいろの つぶ、ねつ＝オレンジの矢印

## 問い

寒いと、どうして鳥肌が立つの？
答えの軸：**ぶつぶつの真ん中には毛がある。毛の根もとの小さな筋肉（立毛筋）が、寒いと勝手に縮んで毛を起こし、まわりの皮ふがもり上がる。毛皮の動物や鳥は、毛や羽の間に空気をためて温かくする（空気の毛布）。人は毛が少ないので、あまり温かくならない。それでも鳥肌は立つ。**

## 見せ場

- 予想の3択の例：「鳥肌の ぶつぶつの まんなかには、なにが ある？」（1. あせの あな 2. け 3. なにも ない → 正解は け）。または「さむい ひの スズメが まるく ふくらむのは なぜ？」（たべすぎ／はねの なかに くうきを ためる／ねむいから → くうき）。正解の番号は cast.py に従う
- 皮ふの断面アニメ：ねていた毛が、赤い筋肉がきゅっと縮むと起き上がり、まわりがぽこっともり上がる（`gb-muscle`）。ルーペで腕に寄るところから入る（`goosebumps-cold`）
- 毛皮で、毛がねている → 立つ と、毛の間のみずいろの空気つぶが増え、オレンジの熱の矢印が短くなる（`gb-fur-air`）
- スズメが「ふつう → まんまる」にふくらむ（`gb-bird-fluff`）、ねこが毛をさかだてて大きく見える（`gb-bigger`）
- 人の腕：毛が少ないので立っても空気の層ができず、熱の矢印は止まらない（`gb-human-little-hair`）
- 余裕があれば：マウスでは、長く寒いと毛の根もとの「もとの細胞」が目をさまし、2週間たらずで新しい毛が生えはじめた（`gb-niche`、`gb-cold-hair-grow`）

## 場面の順番（説明は5場面）

1. ぶつぶつを近くで見ると、真ん中に細い毛。毛の根もとに小さな筋肉「りつもうきん」がある（`goosebumps-cold`、`gb-muscle`）
2. この筋肉は自分では動かせない。寒いと「こうかんしんけい」が合図を送り、勝手に縮む → 毛が立つ → まわりがもり上がる（`gb-nerve`、`gb-cold-signal`）
3. 毛皮の動物では、毛が立つと毛の間の空気が厚くなり、熱がにげにくい（`gb-fur-air`）。鳥も羽をふくらませて空気をためる（`gb-bird-fluff`）。体を大きく見せる意味もあるかもしれない（`gb-bigger`）
4. 人は毛が少ないので、あまり温かくならない。それでも鳥肌は立つ。寒いときは、ふるえて熱をつくったり、皮ふの血の流れを変えたりもしている（`gb-human-little-hair`、`gb-cold-responses`）
5. こわいときや、すてきな音楽にドキッとしたときも立つことがある（`gb-feelings`、`gb-music`）。マウスでは、鳥肌の筋肉が毛を生やす合図をつなぐ橋にもなっていた（`gb-niche`、`gb-cold-hair-grow`）

みてみよう：寒い日の着がえのとき、腕のぶつぶつの真ん中に毛があるか見る。腕と太もも、どちらに出やすいか予想してから確かめる（`gb-look-arm`）。冬の朝、スズメがまるくふくらんでいるか遠くから見る（`gb-look-bird`）。

## 注意書き・言いかたの注意

- **わざと冷たい水をかけたり、寒い所に長くいたりして鳥肌を立てようとしない**。鳥には近づかず、遠くから見るだけ。動画の「みてみよう」で必ず言う
- 「人の鳥肌は役に立たない（なごり）」と言いきらない。言うのは「人は毛が少ないので、あまり温かくならない」まで（出典：世界大百科事典「体毛の少ない人類ではあまり有用ではない」、NIH）
- 「体を大きく見せて敵をおどろかせる」は「〜のであろう」という推測。「〜かもしれない」と言う
- マウスの研究は**マウスでの結果**。「鳥肌を立てると髪がふえる」「寒いと人の毛がのびる」とは言わない
- 「手のひらには鳥肌が立たない」は確かめられていない（inbox）。言わない
- 「交感神経」は字幕だけにして、ナレーションは「からだが かってに あいずを おくる しんけい」くらいにする
- 吹き出しの例：おとうと「うで、ぶつぶつ！」／おねえちゃん「まんなかに けが ある！」／カメレオン（ルーペで毛の根もとをのぞく）

## 出典

- 平凡社『改訂新版 世界大百科事典』「鳥肌」（中山昭雄）、小学館『日本大百科全書』「鳥肌」（齋藤公子）ほか（コトバンク）https://kotobank.jp/word/%E9%B3%A5%E8%82%8C-585992
- 中村和弘「自律性体温調節」『温度生物学ハンドブック』（生理学研究所）https://www.nips.ac.jp/thermalbio/handbook/2-1v2.pdf
- NIH Research Matters "What goosebumps are for"（2020年）https://www.nih.gov/news-events/nih-research-matters/what-goosebumps-are
- Harvard Gazette "The hair-raising reason for goosebumps is revealed"（2020年）https://news.harvard.edu/gazette/story/2020/07/the-hair-raising-reason-for-goosebumps-is-revealed/ （論文 Shwartz et al. 2020, Cell, doi:10.1016/j.cell.2020.06.031）
- Smithsonian "Keeping warm in winter is for the birds"（2015年）https://si.edu/stories/keeping-warm-winter-birds
- Mori & Iwanaga (2017) Scientific Reports 7: 46063（音楽の鳥肌感）https://natureasia.com/ja-jp/srep/abstracts/87764
- ジャパンナレッジ「どんなときに“鳥肌が立つ”のか？」（2011年）https://japanknowledge.com/articles/blognihongo/entry.html?entryid=62
