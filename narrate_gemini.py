"""Process one narration batch from VIDEOS.md using the Gemini API."""
import base64
from datetime import datetime
import json
import os
from pathlib import Path
import re
import subprocess
import sys
from urllib.error import HTTPError
from urllib.parse import urlencode
from urllib.request import Request, urlopen
import wave
from zoneinfo import ZoneInfo

from split_batch import ntexts

VIDEOS = Path("VIDEOS.md")
VOICES = Path("VOICES.md")
API = "https://generativelanguage.googleapis.com/v1beta"
MODEL = "gemini-3.8-flash-tts"
WAITING = "ナレーション待ち"
READY = "仕上げ待ち"
ROWS = re.compile(r"^(\| ([a-z0-9][a-z0-9-]*) \|[^\n]*?\| )([^|\n]+?)( \|\s*)$", re.M)
LAST_VOICE = re.compile(r"^最後に使った声: (.+)$", re.M)


def git(*args):
    return subprocess.check_output(["git", *args], text=True).strip()


def statuses(source):
    return {row[2]: row[3] for row in ROWS.finditer(source)}


def change_status(slugs, current, new):
    source = VIDEOS.read_text()
    state = statuses(source)
    if any(state.get(slug) != current for slug in slugs):
        raise RuntimeError("対象動画の進捗が変わったため、中断しました")
    VIDEOS.write_text(ROWS.sub(
        lambda row: row[1] + new + row[4] if row[2] in slugs else row[0], source
    ))


def next_voice(source):
    rows = [
        [part.strip() for part in line.strip().strip("|").split("|")]
        for line in source.splitlines()
        if re.match(r"^\| \d+ \|", line)
    ]
    last = LAST_VOICE.search(source)[1]
    start = next(i for i, row in enumerate(rows) if row[1] == last) + 1
    _, voice, gender, _, style, _ = next(
        row for row in rows[start:] + rows[:start] if not row[-1].startswith("NG")
    )
    instruction = re.search(rf"^- {gender}・{style}：(.+)$", source, re.M)[1]
    return voice, instruction


def request(key, endpoint, payload=None):
    data = json.dumps(payload, ensure_ascii=False).encode() if payload else None
    msg = Request(
        API + endpoint, data=data,
        headers={"x-goog-api-key": key, "Content-Type": "application/json"},
    )
    try:
        with urlopen(msg, timeout=720 if payload else 30) as response:
            return json.load(response)
    except HTTPError as error:
        raise RuntimeError(f"Gemini API HTTP {error.code} ({endpoint.split('?')[0]})") from None


def voice_id(key, display_name):
    query = {"search": display_name, "type": "prebuilt", "page_size": 100}
    results = request(key, "/voices?" + urlencode(query))
    matches = [
        voice["id"] for voice in results.get("voices", [])
        if voice.get("display_name", voice.get("displayName", "")).casefold()
        == display_name.casefold()
    ]
    if len(set(matches)) != 1:
        raise RuntimeError(f"Gemini APIの音声一覧で {display_name} を一意に特定できません")
    return matches[0]


def generate(key, voice, style, text):
    response = request(key, "/interactions", {
        "model": MODEL,
        "input": [{"type": "user_input", "content": [{
            "type": "text",
            "text": text,
            "annotations": [{"type": "speech_metadata", "style": style}],
        }]}],
        "response_format": {"type": "audio"},
        "generation_config": {"speech_config": [{"voice": voice}]},
    })
    audio = [
        block["data"] for step in response.get("steps", [])
        if step.get("type") == "model_output"
        for block in step.get("content", [])
        if block.get("type") == "audio" and block.get("data")
    ]
    if response.get("status") not in (None, "completed") or len(audio) != 1:
        raise RuntimeError("Gemini APIの応答に完全なWAVが1個ありません")
    return base64.b64decode(audio[0], validate=True)


def push(message, paths):
    git("add", "--", *paths)
    git("commit", "-m", message)
    git("push", "origin", "HEAD:main")


class SplitMismatch(RuntimeError):
    """音声はできたが、1行ずつに切った尺が原稿の見つもりと合わない。"""


def split(wav, slugs, count):
    with wave.open(str(wav)) as audio:
        seconds = audio.getnframes() / audio.getframerate()
        if audio.getnchannels() != 1 or audio.getsampwidth() != 2 or not 30 <= seconds < 510:
            raise RuntimeError(f"想定外のWAV形式または長さです（{seconds:.1f}秒）")

    print(f"生成したWAV: {seconds:.1f}秒")
    output = subprocess.check_output([sys.executable, "split_batch.py", "split", str(wav), *slugs], text=True)
    print(output)
    ratios = [
        float(actual) / float(expected) if float(expected) else 0
        for actual, expected in re.findall(r"^\(([\d.]+), ([\d.]+), ", output, re.M)
    ]
    if len(ratios) != count or any(not 0.6 <= ratio <= 2.3 for ratio in ratios):
        bad = [round(r, 2) for r in ratios if not 0.6 <= r <= 2.3]
        raise SplitMismatch(f"分割の尺が想定範囲外です（{len(ratios)}/{count}行、範囲外の比 {bad[:10]}）")
    for slug in slugs:
        if len(list(Path(slug, "lines").glob("N_*.wav"))) != len(ntexts(slug)):
            raise RuntimeError(f"{slug} の分割ファイル数が原稿と一致しません")
    print(f"{seconds:.1f}秒、{count}行を分割しました。")


def main():
    slugs = [slug for slug, status in statuses(VIDEOS.read_text()).items() if status == WAITING][:2]
    if not slugs:
        print("ナレーション待ちの動画はありません。")
        return
    key = os.getenv("GEMINI_API_KEY")
    if not key:
        print("GEMINI_API_KEY が未登録です。進捗を変更せず終了します。")
        return

    voices_source = VOICES.read_text()
    voice, style = next_voice(voices_source)
    lines = [line for slug in slugs for line in ntexts(slug)]
    if not lines or any(not ntexts(slug) for slug in slugs):
        raise RuntimeError("読み上げ原稿がありません")
    speaker = voice_id(key, voice)
    stamp = datetime.now(ZoneInfo("Asia/Tokyo")).strftime("%Y-%m-%d %H:%M")
    claimed = f"ナレーション中（{stamp}）"
    names = ", ".join(slugs)
    change_status(slugs, WAITING, claimed)
    push(f"{names}: ナレーション中", [str(VIDEOS)])
    claim_commit = git("rev-parse", "HEAD")
    wav = Path(os.environ["RUNNER_TEMP"], "__".join(slugs) + ".wav")

    try:
        wav.write_bytes(generate(key, speaker, style, " <long pause> ".join(lines)))
        try:
            split(wav, slugs, len(lines))
            incoming = None
        except SplitMismatch as error:
            # 音声は捨てずに incoming/ に置き、仕上げ（Claude）で切れ目を確かめて切る。
            print(f"{error}。WAVを incoming/ に置いて仕上げに回します。")
            git("reset", "--hard", claim_commit)
            git("clean", "-fdq", "--", *[f"{slug}/lines" for slug in slugs])
            incoming = Path("incoming", "__".join(slugs) + ".wav")
        git("fetch", "origin", "main")
        git("merge", "--ff-only", "origin/main")
        if VOICES.read_text() != voices_source:
            raise RuntimeError("作業中に声のローテーションが更新されました")
        change_status(slugs, claimed, READY)
        VOICES.write_text(LAST_VOICE.sub(f"最後に使った声: {voice}", voices_source, count=1))
        paths = [str(VIDEOS), str(VOICES)]
        for slug in slugs:
            voice_file = Path(slug, "voice.txt")
            voice_file.write_text(voice + "\n")
            paths.append(str(voice_file))
            if not incoming:
                paths.append(f"{slug}/lines")
        if incoming:
            incoming.write_bytes(wav.read_bytes())
            paths.append(str(incoming))
        note = "、切り分けは仕上げで" if incoming else ""
        push(f"{names}: ナレーション（{voice}{note}）", paths)
    except Exception:
        # This script runs in the workflow's disposable checkout.
        git("reset", "--hard", claim_commit)
        git("fetch", "origin", "main")
        git("merge", "--ff-only", "origin/main")
        source = VIDEOS.read_text()
        for slug in slugs:
            if statuses(source).get(slug) == claimed:
                change_status([slug], claimed, WAITING)
        if VIDEOS.read_text() != source:
            push(f"{names}: ナレーション待ちに戻す", [str(VIDEOS)])
        raise


if __name__ == "__main__":
    if os.getenv("GITHUB_ACTIONS") != "true" or os.getenv("GITHUB_REF") != "refs/heads/main":
        sys.exit("GitHub Actionsのmainブランチで実行してください")
    main()
