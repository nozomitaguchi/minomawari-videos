# ice-melt（氷）動画用メモ

元記事：[氷は、どうしてとけるのか](https://github.com/nozomitaguchi/everyday-trivia/blob/main/trivia/ice-melt.md)（公開ページ https://nozomitaguchi.github.io/everyday-trivia/t/ice-melt/ ）
図はすべて `everyday-trivia/assets/figures-ice.js`（2026-11-21 作成、15枚）。図鑑の「もの」は `ice`（こおり、おうちのなか）。
（元記事は 2026-11-21 の回が作り、動画への引きわたしだけが残っていたので、2026-11-22 の回がこのメモを書いて `候補` にした）

## 問い

氷は、どうしてとけるの？
（つかみ：冷凍庫から出した氷をお皿に置いておくと、だんだん小さくなって水になる。「だれが氷をとかしているの？」）

## 見せ場

- **氷の中では、水の粒が手をつないで並んでいる**：1つの粒がまわりの4つと手をつなぎ、すきまの多い形。水になると、手をはなしてばらばらに動く。粒が並んだ絵 → 手をはなす絵の切りかえが映える
- **とかしているのは「まわりから入る熱」**：手・空気・お皿など、氷よりあたたかいものから熱がうつる。手にのせて冷たいのは、手の熱が氷にうばわれているから
- **とけている間は0℃のまま**：入った熱は手をはなすのに使われるので、温度計の針が0℃で止まる。全部とけてから上がりはじめる（温度のグラフが平らになるアニメ）
- **くらべる実験（いちばんの見せ場）**：同じ部屋に置いたアルミの板と発泡プラスチックの板に同じ氷をのせると、約1分でアルミの上は半分以上とけ、あわの板の上はほとんど凍ったまま。どちらも部屋と同じ温度なのに、さわるとアルミは冷たい。冷たく感じる板ほど氷を早くとかす（予想の3択に向く）
- おまけ：氷は水にうき、およそ10分の1が水の上に出る（すきまが多いぶん軽い）

## 説明の順番（5場面）

1. 氷は水の粒がきちんと並んだもの（手をつなぐ・すきまが多い）　図：`ice-molecules-order`（うく話を入れるなら `ice-floats-tenth`）
2. 熱はあたたかいほうから氷へうつる（手が冷たいのは熱をうばわれるから／ぶつかって渡す）　図：`ice-hand-cold`、`ice-heat-bump`
3. 入った熱は手をはなすのに使われる → 水になる　図：`ice-bonds-break`、全体 `ice-melt`
4. とけている間は0℃のまま。とかす熱はとても大きい　図：`ice-zero-flat`（数字を言うなら `ice-energy-80`）
5. くらべる：アルミとあわの板、10円玉と100円玉　図：`ice-aluminum-foam`、`ice-metal-feels-cold`、`ice-coins`（表は `ice-conductivity-table`。動画では数字を出さなくてよい）
（入れなくてよい：`ice-salt-road` 冬の道の塩。0℃より寒くてもとける）

予想の3択の案：アルミの板とあわ（発泡スチロール）の板。同じ氷をのせたら、どうなる？（正解：アルミの上のほうが早くとける）。ほかの選択肢は「あわの板のほうが早くとける」「どちらも同じ」。cast.py の番号に合わせて並べる。

## みてみよう（注意書きは必ず入れる）

- 同じ大きさの氷を2つ大人に出してもらい、アルミのバット（金属のトレー）と食品の発泡スチロールのトレーにのせる。先にトレーを両方さわって、どちらが冷たいか・どちらの氷が早くとけるかを予想してから見る　図：`ice-look-trays`
- コップの水に氷をうかべて横から見る。水の上に出ているのはどれくらいか予想する　図：`ice-look-float`
- **注意**：氷を口に入れて遊ばない。氷は大人に出してもらう。冷凍庫から出したばかりの氷を長くにぎらない（元記事にはないので、言うなら「氷は大人に出してもらう」「口に入れて遊ばない」まで）

## 言い方の注意

- 「水の粒（水分子）」「手をつなぐ（水素結合）」のたとえは元記事どおり。動画では専門の言葉を出さなくてよい
- 数字で言えるのは元記事にあるものだけ：0℃、約1分で半分以上（アルミ）、両方の板17.5℃（サンタクルーズ校の測定）、氷の約10分の1が水の上、1kgの氷をとかす熱は1kgの水を79.8℃まであたためる熱と同じ
- 「アルミは冷たい」のではなく「どちらも部屋と同じ温度なのに、アルミは手の熱を早くうばうので冷たく感じる」と言う
- 冷凍庫のしくみ、氷のでき方、氷の白いところの話は元記事にない。入れない

## 出典（概要欄用）

- 名古屋市科学館 展示解説「水分子」（PDF）https://www.ncsm.city.nagoya.jp/exhibit_files/pdf/S523.pdf
- アメリカ地質調査所（USGS）「Water Density」https://www.usgs.gov/water-science-school/science/water-density
- 三菱電機「熱の伝わり方を楽しく学ぼう」（PDF）https://www.mitsubishielectric.co.jp/corporate/philanthropy/science/pdf/science04.pdf
- OpenStax Physics（ライス大学）11.3 Phase Change and Latent Heat https://openstax.org/books/physics/pages/11-3-phase-change-and-latent-heat
- UC Santa Barbara Physics Lecture Demonstrations「Amazing Ice Melting Blocks」https://web.physics.ucsb.edu/~lecturedemonstrations/Composer/Pages/52.10.html
- UC Santa Cruz Physics Demonstration Room「Ice Melting Blocks」https://ucscphysicsdemo.sites.ucsc.edu/physics-5b6b-demos/ice-melting-blocks/
- 国土技術政策総合研究所資料 第412号「凍結防止剤散布と沿道環境」（PDF）https://www.nilim.go.jp/lab/bcg/siryou/tnn/tnn0412pdf/ks0412007.pdf
