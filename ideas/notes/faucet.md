# faucet（蛇口）動画用メモ

元記事：[蛇口をひねると、どうしていつでも水が出てくるのか](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/faucet-water-pressure.md)（公開ページ https://nozomitaguchi.github.io/everyday-trivia/t/faucet-water-pressure/ ）
図はすべて `everyday-trivia/assets/figures-faucet.js`（2026-11-21 作成）。図鑑の「もの」は `faucet`（じゃぐち、おうちのなか）。
水はいつも青、水を押す力はいつもオレンジの矢印でそろえてある。

## 問い

蛇口をひねると、どうしていつでも水が出てくるの？
（つかみ：ハンドルをひねった瞬間にジャーッ。「いま、水はどこから来た？ 蛇口の中にためてあるの？」）

## 見せ場

- **蛇口の中の断面**：閉まっているときはコマ（ゴムのパッキン）が通り道をふさぎ、ハンドルを回すとコマが上がって水が通る。同じ断面を左右に並べて切りかえる
- **水は前から押されて待っている**：蛇口の手前の管から道路の下の配水管まで、水がつながっていて、いつも押されている。だから開けたとたんに出る。国の決まりで、配水管の圧力は家へ分かれる所で150キロパスカル（水の高さで約15メートル分）より下げない
- **だれが押している？**：高台の配水池から低い方へ流れようとする水の重さと、ポンプ。答えは「高い所にためた水と、ポンプが、いつも管の中の水を押しているから」
- **高いマンションはどうする？**：東京都では直圧は3階まで。4階より上は、増圧ポンプで押し上げるか、受水槽からポンプで屋上の高置水槽にくみ上げ、そこから流れ下る。屋上の箱のタンクを外から探す、が「みてみよう」
- 意外な一言：1分間に約12リットル（口13ミリ、水圧0.1メガパスカル、ハンドル90度。東京都水道局）

## 説明の順番（5場面）

1. 蛇口の中で何が動く？ コマが上がると通り道が開く　図：`faucet-koma-open`（必要なら `faucet-koma-types`）
2. 開けたとたんに出るのは、管の中の水がいつも押されているから。給水所 → 道路の下の配水管 → 家の給水管 → 蛇口　図：`faucet-pipes-route`、`faucet-pressure-rule`、全体図 `faucet-water-pressure`
3. 押しているのは高台の配水池（高い所から低い所へ流れる力）　図：`faucet-reservoir-gravity`
4. 高台がない所はポンプ。東京都は時間ごとに変わる使う量に合わせて、量と圧力を24時間体制で調節　図：`faucet-pump-station`、`faucet-24h-control`
5. 高い建物へ：直圧は3階まで（東京都）→ 増圧ポンプ、または受水槽→屋上の高置水槽→流れ下る　図：`faucet-building-direct`、`faucet-booster-pump`、`faucet-tank-roof`、まとめ `faucet-supply-table`

（入れなくてよい）コマパッキンがすり減ると閉めてもポタポタ `faucet-packing-wear`、1分に約12リットル `faucet-12-liters`

予想の3択の案：蛇口をひねるとすぐ水が出るのはなぜ？（正解：管の中の水が、いつも押されているから）。ほかの選択肢は「蛇口の中に水がためてあるから」「ひねると蛇口が水を吸いこむから」など。

## みてみよう（注意書きは必ず入れる）

- 大人といっしょに、ハンドルを少し回したときと、もう少し回したときで、水の太さと音をくらべる。見たらすぐ閉める　図：`faucet-look-handle`
- 高い建物の屋上に箱の形のタンク（高置水槽）があるか、低い家とくらべる　図：`faucet-look-roof-tank`
- **注意**：蛇口は大人といっしょに使う。お湯の出る蛇口は熱いのでさわらない。蛇口を分解しない。屋上や水槽には近づかず、下から見るだけ

## 言い方の注意

- 「3階まで」「4階より上は増圧か貯水槽」は**東京都**の決まり。ほかの水道局では階数や方式の決め方がちがう（千葉県は増圧を15階建て・140戸程度まで）。動画では「東京では」と添える
- コマが上がるしくみは「ハンドルを回すとコマが上下して開け閉めする」まで。「水の圧力でコマが押し上げられる」は確かめていないので言わない
- シングルレバー（レバーを上げ下げする蛇口）の中のしくみは確かめていないので扱わない
- 150キロパスカルは「水の高さにして約15メートル分の重さで押す力」（計算による換算）。740キロパスカルは上限
- 配水池の高さ（何メートル）は資料がないので言わない
- 「24時間休まず送る」ではなく「24時間体制で流れを見守り、調節している」

## 出典（概要欄用）

- 滝沢市 蛇口の水漏れの修理（PDF）https://city.takizawa.iwate.jp/uploads/contents/pages_0000001062_00/201583131630.pdf
- 富士市 第12章 給水栓と弁類（PDF）https://www.city.fuji.shizuoka.jp/documents/830/fmervo000000foe7.pdf
- SANEI 技術資料（PDF）https://www.sanei.ltd/library/support/download/img/2023_491-498.pdf
- 東京都水道局 よくある質問 https://www.waterworks.metro.tokyo.lg.jp/faq/qa-14
- 東京都水道局 水道システムの概要（PDF）https://www.waterworks.metro.tokyo.lg.jp/documents/d/waterworks/sankou_28581
- 水道施設の技術的基準を定める省令 https://laws.e-gov.go.jp/law/412M50000100015
- 神奈川県営水道 配水池及びポンプ所 https://www.pref.kanagawa.jp/docs/k5f/work/w5.html
- 横浜市水道局 配水 https://www.city.yokohama.lg.jp/kurashi/sumai-kurashi/suido-gesui/suido/suishitsu/dekirumade/haisui.html
- 東京都水道局 水道水が届くまで（PDF）https://www.waterworks.metro.tokyo.lg.jp/documents/d/waterworks/kurashi-r6-04
- 東京都水道局 給水方式について https://www.waterworks.metro.tokyo.lg.jp/kurashi/chokketsu/houshiki
- 千葉県企業局 直結給水 https://www.pref.chiba.lg.jp/suidou/kyuusui/chokketsu.html
