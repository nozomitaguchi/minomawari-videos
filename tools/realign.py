"""ナレーションの切れ目を「耳」で直す。
  python tools/realign.py <slug> [<slug> ...]   （いっしょに作った動画は、作った順にならべて書く）
いまの lines/N_xx.wav を、無音ごとの小さなかたまり（チャンク）に分け、Gemini に聞かせて
「どのチャンクが台本の何行めか」を答えてもらい、その答えどおりに行を組み直す。
無音の長さや文字数からの見つもりだけで切ると、「正解は」「2番。」のような出だしが前の行に付いたり、
行がまるごとずれたりすることがあるため。GEMINI_API_KEY が要る。"""
import base64, io, json, os, pathlib, re, sys, time, wave
import numpy as np

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent.parent))
from narrate_gemini import request  # noqa: E402

MODEL = os.environ.get("REVIEW_MODEL", "gemini-3.8-flash")
JOIN = 0.40      # もとの行と行のあいだに入れる無音（秒）
MIN_GAP = 0.20   # これより長い無音でチャンクに分ける
PROMPT = """あなたは子ども向け動画のナレーションの編集係です。
下に、台本の行（番号つき）があります。そのあとに、ナレーションの音声を無音で細かく切った「チャンク」が、読まれた順に入っています。
それぞれのチャンクを実際に聞いて、台本の何行めの言葉かを答えてください。
- チャンクは台本の順に進みます。1つの行は、1つまたは続いたいくつかのチャンクでできています。
- チャンクが2つの行にまたがることはありません。聞こえた言葉がある行に入れてください。
- 「正解は」「1番。」「だから、」のような短いチャンクも、その言葉がある行に入れてください（前の行に入れない）。
行番号だけをチャンクの順にならべた、数の配列だけを返してください（例: [0,0,1,1,1,2]）。配列の長さは、チャンクの数と同じにしてください。"""


def texts_of(slug):
    return [l["text"] for l in json.load(open(pathlib.Path(slug) / "narration.json"))["lines"] if l["who"] == "N"]


def load(path):
    with wave.open(str(path)) as w:
        return np.frombuffer(w.readframes(w.getnframes()), "<i2").astype(np.float32) / 32768, w.getframerate()


def save(path, audio, sr):
    with wave.open(str(path), "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr)
        w.writeframes((np.clip(audio, -1, 1) * 32767).astype("<i2").tobytes())


def chunks_of(audio, sr):
    """声のあるところを、MIN_GAP より長い無音で分けた [(開始サンプル, 終了サンプル)]。"""
    win = int(sr * 0.02); n = len(audio) // win
    loud = np.sqrt((audio[: n * win].reshape(n, win) ** 2).mean(1)) >= 0.012
    out, i, need = [], 0, int(MIN_GAP / 0.02)
    while i < n:
        if not loud[i]:
            i += 1; continue
        j = i; last = i
        while j < n:
            if loud[j]: last = j
            elif j - last >= need: break
            j += 1
        out.append((i * win, (last + 1) * win)); i = last + 1
    return [c for c in out if c[1] - c[0] >= int(sr * 0.06)]


def small_wav(audio, sr):
    """送る量をへらすため、半分のサンプリング周波数にした WAV（バイト列）。"""
    half = audio[: len(audio) // 2 * 2].reshape(-1, 2).mean(1)
    buf = io.BytesIO()
    with wave.open(buf, "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr // 2)
        w.writeframes((np.clip(half, -1, 1) * 32767).astype("<i2").tobytes())
    return buf.getvalue()


def monotone(pred, lines):
    """予測を、0 から lines-1 まで1つずつ進む（とばさない・もどらない）ならびに、いちばん少ない書きかえで直す。"""
    C = len(pred); INF = 10 ** 9
    dp = np.full((C, lines), INF); bk = np.zeros((C, lines), int)
    dp[0][0] = pred[0] != 0
    for k in range(1, C):
        for l in range(min(k, lines - 1) + 1):
            stay = dp[k - 1][l]; step = dp[k - 1][l - 1] if l else INF
            best, arg = (stay, l) if stay <= step else (step, l - 1)
            dp[k][l] = best + (pred[k] != l); bk[k][l] = arg
    out, l = [], lines - 1
    for k in range(C - 1, -1, -1):
        out.append(l); l = bk[k][l]
    return out[::-1], int(dp[C - 1][lines - 1])


def ask(key, texts, audio, sr, chunks):
    parts = [{"text": PROMPT + "\n\n台本:\n" + "\n".join(f"{i}: {t}" for i, t in enumerate(texts))}]
    for k, (s, e) in enumerate(chunks):
        pad = int(sr * 0.05)
        parts.append({"text": f"チャンク {k}"})
        parts.append({"inline_data": {"mime_type": "audio/wav", "data": base64.b64encode(
            small_wav(audio[max(0, s - pad): e + pad], sr)).decode()}})
    payload = {"contents": [{"role": "user", "parts": parts}],
               "generationConfig": {"temperature": 0, "responseMimeType": "application/json", "maxOutputTokens": 16384}}
    for attempt in range(4):
        try:
            response = request(key, f"/models/{MODEL}:generateContent", payload); break
        except RuntimeError as error:
            if attempt == 3 or not any(c in str(error) for c in ("HTTP 503", "HTTP 429", "HTTP 500")): raise
            time.sleep(40 * (attempt + 1))
    out = "".join(p.get("text", "") for p in response["candidates"][0]["content"]["parts"])
    nums = [int(x) for x in re.findall(r"-?\d+", out)]
    print(f"答え {len(nums)}個 / チャンク {len(chunks)}個")
    if abs(len(nums) - len(chunks)) > max(3, len(chunks) // 20):
        raise RuntimeError("答えの数がチャンクの数と合いません")
    return (nums + [-1] * len(chunks))[: len(chunks)]


def realign(key, slugs, predict=None):
    groups = [(s, texts_of(s)) for s in slugs]
    texts = [t for _, ts in groups for t in ts]
    files = [pathlib.Path(s) / "lines" / f"N_{i:02d}.wav" for s, ts in groups for i in range(len(ts))]
    pieces, old = [], []           # old[k] = もとのファイルで、チャンク k が入っていた行
    sr = None; pos = 0; chunks = []
    for n, f in enumerate(files):
        a, sr = load(f)
        for s, e in chunks_of(a, sr):
            chunks.append((pos + s, pos + e)); old.append(n)
        pieces += [a, np.zeros(int(sr * JOIN), np.float32)]; pos += len(a) + int(sr * JOIN)
    audio = np.concatenate(pieces)
    pred = predict(texts, chunks) if predict else ask(key, texts, audio, sr, chunks)
    pred = [p if 0 <= p < len(texts) else o for p, o in zip(pred, old)]
    new, fixed = monotone(pred, len(texts))
    moved = [(k, old[k], new[k]) for k in range(len(chunks)) if old[k] != new[k]]
    lead, tail = int(sr * 0.04), int(sr * 0.10)
    for n, f in enumerate(files):
        ks = [k for k in range(len(chunks)) if new[k] == n]
        y = audio[max(0, chunks[ks[0]][0] - lead): chunks[ks[-1]][1] + tail].copy()
        fade = int(sr * 0.01); y[:fade] *= np.linspace(0, 1, fade); y[-fade:] *= np.linspace(1, 0, fade)
        save(f, y, sr)
    print(f"{', '.join(slugs)}: チャンク {len(chunks)}個、行 {len(texts)}。行を移したチャンク {len(moved)}個"
          f"（答えを順番にそろえるための書きかえ {fixed}個）")
    for k, o, n in moved[:40]:
        print(f"  チャンク {k}: 行 {o} → 行 {n}（{texts[n][:14]}…）")
    return moved


if __name__ == "__main__":
    realign(os.environ["GEMINI_API_KEY"], sys.argv[1:])
