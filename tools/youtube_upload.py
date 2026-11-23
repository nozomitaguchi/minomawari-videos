"""Check a finished video, or upload it privately from GitHub Actions."""

import argparse
import json
import os
import re
import subprocess
from pathlib import Path

REPOSITORY = "nozomitaguchi/minomawari-videos"
CHANNEL_ID = "UCqZe9KhfVAEqn28cTl8hZmg"
SCOPES = [
    "https://www.googleapis.com/auth/youtube.upload",
    "https://www.googleapis.com/auth/youtube.readonly",
]


def video_metadata(slug):
    if not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", slug):
        raise SystemExit("動画IDは半角英数字の小文字とハイフンで指定してください。")

    states = []
    for line in Path("VIDEOS.md").read_text(encoding="utf-8").splitlines():
        if line.startswith("|"):
            cells = line.strip("|").split("|")
            if cells[0].strip().strip("`").rstrip("/") == slug:
                states.append(cells[-1].strip())
    if states != ["完成"]:
        raise SystemExit("VIDEOS.md で「完成」になっている動画を指定してください。")

    folder = Path(slug)
    if not (folder / "finish.sh").is_file():
        raise SystemExit("この動画には 4K 書き出し用の finish.sh がありません。")

    text = (folder / "youtube-description.txt").read_text(encoding="utf-8-sig")
    match = re.fullmatch(r"\s*【タイトル案】\s*([^\n]+)\n\s*【概要欄】\s*(.+)", text, re.S)
    if not match:
        raise SystemExit("youtube-description.txt に【タイトル案】と【概要欄】が必要です。")
    title, description = (field.strip() for field in match.groups())
    description = fit_description(description)
    if not title or not description or len(title) > 100 or len(description.encode()) > 5000:
        raise SystemExit("YouTube のタイトルまたは概要欄の長さを確認してください。")
    if any(ch in title or ch in description for ch in "<>"):
        raise SystemExit("YouTube のタイトルと概要欄に < > は使用できません。")
    return title, description


LIMIT = 4950  # YouTube の概要欄は 5000 バイトまで


def fit_description(description):
    """長すぎる概要欄を、出典の URL の行（下から）→ 出典の項目（下から）の順にけずって収める。
    出典の全体はサイトの記事にあるので、けずったときはその旨を1行足す。"""
    if len(description.encode()) <= LIMIT:
        return description
    lines = description.split("\n")
    try:
        start = next(i for i, line in enumerate(lines) if line.strip().startswith("▼ 出典"))
    except StopIteration:
        return description
    end = next((i for i in range(start + 1, len(lines)) if not lines[i].strip()), len(lines))
    note = "（出典の URL など、くわしくは上のサイトの記事にあります）"
    body = lines[start + 1:end]

    def joined():
        return "\n".join(lines[:start + 1] + body + [note] + lines[end:])

    for index in range(len(body) - 1, -1, -1):  # まず URL の行を下からけずる
        if len(joined().encode()) <= LIMIT:
            break
        if body[index].strip().startswith("http"):
            del body[index]
    while body and len(joined().encode()) > LIMIT:  # まだ長ければ、出典の項目を下からけずる
        del body[-1]
    return joined()



def verify_render(path):
    info = json.loads(subprocess.check_output(
        ["ffprobe", "-v", "error", "-show_streams", "-show_format", "-of", "json", str(path)]
    ))
    streams = info["streams"]
    if not any(
        stream["codec_type"] == "video"
        and (stream.get("width"), stream.get("height")) == (3840, 2160)
        for stream in streams
    ) or not any(stream["codec_type"] == "audio" for stream in streams):
        raise SystemExit("書き出した動画に 3840×2160 の映像と音声が必要です。")
    if float(info["format"].get("duration", 0)) <= 0:
        raise SystemExit("動画の長さを確認できませんでした。")


def authorized_channel(youtube):
    items = youtube.channels().list(part="id", mine=True, maxResults=50).execute()["items"]
    if [item["id"] for item in items] != [CHANNEL_ID]:
        raise SystemExit("OAuth が @minomawari-zukan に接続されていません。")


def reserve_upload(slug):
    # GitHub's ref creation is atomic. Never replace an existing reservation.
    tag = f"youtube-upload/{slug}"
    result = subprocess.run(
        [
            "gh", "api", "--method", "POST", f"repos/{REPOSITORY}/git/refs",
            "-f", f"ref=refs/tags/{tag}", "-f", f"sha={os.environ['GITHUB_SHA']}",
        ],
        capture_output=True,
    )
    if result.returncode:
        raise SystemExit(
            f"アップロード前の記録 {tag} を作れません。"
            "タグがある場合は再実行前に YouTube Studio で登録状況を確認してください。"
        )


def upload(slug, path, title, description, kids, synthetic):
    from google.auth.exceptions import RefreshError
    from google.oauth2.credentials import Credentials
    from googleapiclient.discovery import build
    from googleapiclient.errors import HttpError
    from googleapiclient.http import MediaFileUpload

    try:
        secret = json.loads(os.environ.get("YOUTUBE_OAUTH_JSON", "{}"))
        credentials = Credentials.from_authorized_user_info(secret, scopes=SCOPES)
    except (ValueError, TypeError):
        raise SystemExit("GitHub Actions の YOUTUBE_OAUTH_JSON を設定してください。") from None

    try:
        youtube = build("youtube", "v3", credentials=credentials, cache_discovery=False)
        authorized_channel(youtube)
        request = youtube.videos().insert(
            part="snippet,status",
            notifySubscribers=False,
            body={
                "snippet": {
                    "title": title,
                    "description": description,
                    "categoryId": "27",
                    "defaultLanguage": "ja",
                    "defaultAudioLanguage": "ja",
                },
                "status": {
                    "privacyStatus": "private",
                    "selfDeclaredMadeForKids": kids,
                    "containsSyntheticMedia": synthetic,
                },
            },
            media_body=MediaFileUpload(
                str(path), mimetype="video/mp4", chunksize=8 * 1024 * 1024, resumable=True
            ),
        )
        reserve_upload(slug)
        result = None
        while result is None:
            _, result = request.next_chunk(num_retries=4)

        video_id = result.get("id", "")
        if not re.fullmatch(r"[A-Za-z0-9_-]{11}", video_id):
            raise SystemExit("YouTube から動画IDを取得できません。Studio で確認してください。")
        url = f"https://studio.youtube.com/video/{video_id}/edit"
        with open(os.environ["GITHUB_STEP_SUMMARY"], "a", encoding="utf-8") as summary:
            summary.write(f"- [YouTube Studio で非公開動画を確認する]({url})\n")
        print(f"非公開アップロード完了: {url}")

        # The video is already uploaded, so a thumbnail failure must not fail the run.
        thumb = Path(slug) / "brand" / "thumb.jpg"
        note = "サムネイルを設定しました。"
        try:
            if not thumb.is_file() or thumb.stat().st_size > 2 * 1024 * 1024:
                raise FileNotFoundError
            youtube.thumbnails().set(
                videoId=video_id, media_body=MediaFileUpload(str(thumb), mimetype="image/jpeg")
            ).execute()
        except FileNotFoundError:
            note = f"サムネイル {thumb} が無いか2MBをこえています。Studio で設定してください。"
        except HttpError as error:
            note = (
                f"サムネイルを設定できませんでした (HTTP {error.resp.status})。"
                "チャンネルの電話番号確認が済んでいるか確かめ、Studio で設定してください。"
            )
        with open(os.environ["GITHUB_STEP_SUMMARY"], "a", encoding="utf-8") as summary:
            summary.write(f"- {note}\n")
        print(note)
    except RefreshError:
        raise SystemExit("Google の OAuth 認可を更新してください。") from None
    except HttpError as error:
        raise SystemExit(f"YouTube API エラー (HTTP {error.resp.status})") from None


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("step", choices=["check", "verify", "upload"])
    parser.add_argument("slug")
    parser.add_argument("--kids", choices=["yes", "no"])
    parser.add_argument("--synthetic", choices=["yes", "no"])
    args = parser.parse_args()

    title, description = video_metadata(args.slug)
    if args.step == "check":
        if (args.kids is None) != (args.synthetic is None):
            parser.error("視聴者設定と合成コンテンツの申告を両方指定してください。")
        print(f"{args.slug}: {title}")
        return

    path = Path(args.slug) / f"{args.slug}_mimawari_4k.mp4"
    verify_render(path)
    if args.step == "upload":
        if args.kids is None or args.synthetic is None:
            parser.error("視聴者設定と合成コンテンツの申告を両方指定してください。")
        upload(args.slug, path, title, description, args.kids == "yes", args.synthetic == "yes")


if __name__ == "__main__":
    main()
