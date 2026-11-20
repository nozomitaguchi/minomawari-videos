"""Authorize the channel locally and send credentials directly to GitHub Secrets."""

import argparse
import json
import subprocess
from pathlib import Path

from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build

from youtube_upload import REPOSITORY, SCOPES, authorized_channel


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("client_json", type=Path, help="Desktop OAuth client JSON from Google Cloud")
    args = parser.parse_args()

    subprocess.run(["gh", "auth", "status", "--hostname", "github.com"], check=True)
    flow = InstalledAppFlow.from_client_secrets_file(str(args.client_json), SCOPES, autogenerate_code_verifier=True)
    credentials = flow.run_local_server(port=0, prompt="consent", authorization_prompt_message="")
    youtube = build("youtube", "v3", credentials=credentials, cache_discovery=False)
    authorized_channel(youtube)

    if not credentials.refresh_token:
        raise SystemExit("Google から更新用トークンが発行されませんでした。")
    secret = {
        "client_id": credentials.client_id,
        "client_secret": credentials.client_secret,
        "refresh_token": credentials.refresh_token,
    }
    subprocess.run(
        ["gh", "secret", "set", "YOUTUBE_OAUTH_JSON", "--repo", REPOSITORY],
        input=json.dumps(secret),
        text=True,
        check=True,
    )
    print("@minomawari-zukan の認可を GitHub Actions に登録しました。")


if __name__ == "__main__":
    main()
