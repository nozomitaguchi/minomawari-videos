# GitHub ActionsからYouTubeへ

「完成」の動画IDを指定すると、既存のナレーションから4KのMP4を再生成できます。非公開アップロードも選ぶと、同じ実行環境から「みのまわり図鑑」(@minomawari-zukan) に送り、実行結果にYouTube Studioへのリンクを表示します。

## 自動アップロード

`VIDEOS.md` で動画が新しく「完成」になると、Actions の「完成した動画を自動で非公開アップロード」が4Kを書き出し、非公開でアップロードして、`<動画ID>/brand/thumb.jpg` をサムネイルに設定します（子ども向け：はい、リアルな改変・合成コンテンツ：いいえ）。公開は YouTube Studio で行います。前から「完成」だった動画は対象外なので、下の手動実行を使います。失敗した回も、下の手動実行でやり直せます。

## 使い方

[Actionsの「4K書き出し・YouTube非公開アップロード」](https://github.com/nozomitaguchi/minomawari-videos/actions/workflows/youtube-private.yml) の **Run workflow** で、ブランチに `main`、動画IDに [VIDEOS.md](../VIDEOS.md) の「完成」の行にあるIDを指定します。

- 初回は `render-only` で書き出しを検証できます。このモードは映像の解像度と音声トラックを確認して、結果を Actions の Summary に残します。
- アップロードする場合は、その動画がYouTube Studioにまだ無いことを確認し、`upload-private` を選びます。子ども向け設定と[リアルな改変・合成コンテンツの申告](https://support.google.com/youtube/answer/14328491)をそれぞれ選択して実行します。タイトルと概要欄は、動画フォルダの `youtube-description.txt` から取得します。サムネイルの選択と公開はStudioで行います。
- 同じIDの再送を防ぐため、送信直前に `youtube-upload/<動画ID>` タグを作ります。タグ作成後に失敗した場合は、Studioに動画が無いことを確認したうえで該当タグを削除して再実行します。Studioに動画がある場合はその動画を使ってください。

## 初回だけ行うGoogle連携

1. [Google Cloud](https://console.cloud.google.com/) のプロジェクトで [YouTube Data API v3](https://console.cloud.google.com/apis/library/youtube.googleapis.com) を有効にします。
2. [Google Auth Platform](https://console.cloud.google.com/auth/clients) でOAuthクライアントIDを「デスクトップ アプリ」として作成し、JSONを手元のPCに保存します。外部ユーザー向けの「テスト」状態で試す場合は、チャンネルを管理するGoogleアカウントをテストユーザーに登録します。[この状態の更新用トークンは7日で失効](https://developers.google.com/identity/protocols/oauth2#expiration)します。定常運用時は同意画面の設定を見直して再認可します。
3. GitHub CLIをリポジトリのSecretsを編集できるアカウントでログインし、このリポジトリのチェックアウトから次のコマンドを実行します。ブラウザが開いたら「みのまわり図鑑」チャンネルを選択します。スクリプトがチャンネルIDを確認し、認可情報を `YOUTUBE_OAUTH_JSON` としてActions Secretsに登録します。

```sh
python3 -m venv "$HOME/.venvs/minomawari-youtube"
. "$HOME/.venvs/minomawari-youtube/bin/activate"
python -m pip install 'google-api-python-client>=2,<3' 'google-auth-oauthlib>=1,<2'
python tools/authorize_youtube.py "$HOME/Downloads/ダウンロードしたOAuthファイル.json"
```

OAuth JSONと更新用トークンは手元とActions Secretsで管理し、チャットやGitには貼り付けません。連携を解除する場合はActions Secretsから `YOUTUBE_OAUTH_JSON` を削除し、Googleアカウントの接続設定からアプリの権限を取り消します。
