"""耳レビューを AI Studio の画面でやるための材料を作る（API の上限に当たったとき用）。
  python tools/review_export.py <出力フォルダ> <slug> [<slug> ...]
<slug>_review.mp3（行と行のあいだに「ピッ」を入れて1本にした音声）、<slug>_first.txt（1回めに打ちこむ指示：台本を見せずに書き起こさせる）、
<slug>_script.txt（2回めに添付する台本と、照らし合わせの指示）ができる。
返事の JSON は tools/review_import.py で audio_review.md にする。"""
import json, pathlib, subprocess, sys, wave
import numpy as np

PROMPT = """これは台本です。あなたがさきほど書き起こした {n} 個の区間（行0, 行1, …）を、音声は聞き直さずにそのまま使い、下の台本の同じ番号の行と1つずつ照らしてください。
とくに次を見つけてください。
- 台本にない言葉が、区間のはじめや終わりに入っている（となりの行の言葉がまぎれこんでいる）
- 台本の言葉が、はじめや終わりで欠けている
- 読みまちがい（別の言葉になっている）
漢字とかなの違い、句読点、同じ読みの表記の違いは問題にしません。
JSON の配列だけを返してください。要素は {{"line": 行番号, "ok": true/false, "heard": "書き起こしたとおりの文", "problem": "問題の説明（okなら空）"}} です。すべての行について1つずつ、{n} 個返してください。

台本:
{script}"""
# 1回めに打ちこむ指示（台本を見せずに書き起こさせる。台本を先に見せると、聞かずに台本を写すことがあった）
FIRST = "この音声は、日本語のナレーションの文と文のあいだに「ピッ」という高い電子音が1回ずつ入っています（電子音は{beeps}回、区間は{n}個）。電子音で区切られた区間ごとに、その区間で実際に聞こえた言葉を、そのまま書き起こしてください。電子音の位置を正確に守り、文の意味の切れ目で勝手に区切り直さないでください（文の途中で電子音が鳴っていたら、そこで区切る）。JSONの文字列の配列だけを、区間の順に{n}個返してください。"


def main(out, slugs):
    out = pathlib.Path(out); out.mkdir(parents=True, exist_ok=True)
    sr = 24000
    t = np.arange(int(sr * 0.25)) / sr
    beep = (np.sin(2 * np.pi * 1760 * t) * 0.35 * np.minimum(1, np.minimum(t, t[::-1]) / 0.01))
    gap = np.zeros(int(sr * 0.45))
    for slug in slugs:
        root = pathlib.Path(slug)
        texts = [l["text"] for l in json.load(open(root / "narration.json"))["lines"] if l["who"] == "N"]
        parts = []
        for i in range(len(texts)):
            with wave.open(str(root / "lines" / f"N_{i:02d}.wav")) as w:
                assert w.getframerate() == sr
                a = np.frombuffer(w.readframes(w.getnframes()), "<i2").astype(np.float32) / 32768
            if i: parts += [gap, beep, gap]
            parts.append(a)
        audio = np.concatenate(parts)
        tmp = out / f"{slug}_review.wav"
        with wave.open(str(tmp), "wb") as w:
            w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr)
            w.writeframes((np.clip(audio, -1, 1) * 32767).astype("<i2").tobytes())
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(tmp), "-b:a", "48k", str(out / f"{slug}_review.mp3")], check=True)
        tmp.unlink()
        script = "\n".join(f"行{i}: {t}" for i, t in enumerate(texts))
        (out / f"{slug}_script.txt").write_text(PROMPT.format(n=len(texts), script=script))
        (out / f"{slug}_first.txt").write_text(FIRST.format(n=len(texts), beeps=len(texts) - 1))
        print(slug, len(texts), "行", round(len(audio) / sr), "秒")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2:])
