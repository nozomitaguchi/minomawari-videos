"""ナレーションの「耳のレビュー」。1行ずつの音声を Gemini に聞かせて、台本どおりかを確かめる。
  python tools/review_audio.py <slug> [<slug> ...]
余分な言葉（次の行の出だしなど）・欠け・読みまちがいがあれば <slug>/audio_review.md に書き、終了コード1で終わる。
問題がなければ「OK」と書く。GEMINI_API_KEY が要る（GitHub Actions の「ナレーションの耳レビュー」から使う）。"""
import base64, json, os, pathlib, sys, time

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent.parent))
from narrate_gemini import request  # noqa: E402

MODEL = os.environ.get("REVIEW_MODEL", "gemini-3.8-flash")
PROMPT = """あなたは子ども向け動画のナレーションの検品係です。
このあと「行 N」「台本: …」に続けて、その行の音声が1つずつ入っています。
それぞれの音声を実際に聞いて、台本と同じ言葉が、過不足なく読まれているかを確かめてください。
とくに次を見つけてください。
- 台本にない言葉が、はじめや終わりに入っている（別の行の言葉がまぎれこんでいる）
- 台本の言葉が、はじめや終わりで欠けている
- 読みまちがい（別の言葉に聞こえる）
漢字とかなの違い、句読点、間の長さは問題にしません。
JSON の配列だけを返してください。要素は {"line": 行番号, "ok": true/false, "heard": "聞こえたとおりの文", "problem": "問題の説明（okなら空）"} です。
すべての行について1つずつ返してください。"""


def review(key, slug):
    root = pathlib.Path(slug)
    texts = [l["text"] for l in json.load(open(root / "narration.json"))["lines"] if l["who"] == "N"]
    parts = [{"text": PROMPT}]
    for i, text in enumerate(texts):
        wav = root / "lines" / f"N_{i:02d}.wav"
        parts.append({"text": f"行 {i}\n台本: {text}"})
        parts.append({"inline_data": {"mime_type": "audio/wav", "data": base64.b64encode(wav.read_bytes()).decode()}})
    payload = {
        "contents": [{"role": "user", "parts": parts}],
        "generationConfig": {"temperature": 0, "responseMimeType": "application/json", "maxOutputTokens": 16384},
    }
    for attempt in range(4):  # 混雑（503）や一時的な上限（429）は、待ってやり直す
        try:
            response = request(key, f"/models/{MODEL}:generateContent", payload)
            break
        except RuntimeError as error:
            if attempt == 3 or not any(code in str(error) for code in ("HTTP 503", "HTTP 429", "HTTP 500")):
                raise
            time.sleep(40 * (attempt + 1))
    out = "".join(p.get("text", "") for p in response["candidates"][0]["content"]["parts"])
    rows = {int(r["line"]): r for r in json.JSONDecoder().raw_decode(out[out.index("["):])[0]}
    lines = [f"# {slug} ナレーションの耳レビュー（{MODEL}）", ""]
    bad = []
    for i, text in enumerate(texts):
        r = rows.get(i)
        if r is None:
            bad.append(i); lines.append(f"- 行 {i}: 判定なし（台本: {text}）")
        elif not r.get("ok"):
            bad.append(i)
            lines.append(f"- 行 {i}: **{r.get('problem', '')}**\n  - 台本: {text}\n  - 聞こえた: {r.get('heard', '')}")
    lines.insert(2, f"{len(texts)}行のうち、問題 {len(bad)}行。" + ("" if bad else " OK"))
    (root / "audio_review.md").write_text("\n".join(lines) + "\n")
    print("\n".join(lines))
    return bad


if __name__ == "__main__":
    key = os.environ["GEMINI_API_KEY"]
    failed = []
    for slug in sys.argv[1:]:
        try:
            if review(key, slug):
                failed.append(slug)
        except Exception as error:  # 1本でつまずいても、ほかの動画は見る
            print(f"# {slug}: レビューできませんでした（{type(error).__name__}: {str(error)[:120]}）")
            failed.append(slug)
    sys.exit(1 if failed else 0)
