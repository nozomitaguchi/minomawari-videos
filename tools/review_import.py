"""AI Studio の画面でやった耳レビューの結果を audio_review.md にする。
  python tools/review_import.py <slug> '<問題のある行の JSON 配列（なければ []）>'"""
import json, pathlib, sys

slug, bad = sys.argv[1], json.loads(sys.argv[2])
texts = [l["text"] for l in json.load(open(pathlib.Path(slug) / "narration.json"))["lines"] if l["who"] == "N"]
lines = [f"# {slug} ナレーションの耳レビュー（AI Studio の画面、台本を見せずに書き起こしてから照合）", "",
         f"{len(texts)}行のうち、問題 {len(bad)}行。" + ("" if bad else " OK")]
for r in bad:
    i = int(r["line"])
    lines.append(f"- 行 {i}: **{r.get('problem', '')}**\n  - 台本: {texts[i]}\n  - 聞こえた: {r.get('heard', '')}")
(pathlib.Path(slug) / "audio_review.md").write_text("\n".join(lines) + "\n")
print(lines[2])
