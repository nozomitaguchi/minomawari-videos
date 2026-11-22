"""切れ目直し（realign）を AI Studio の画面でやるための材料を作る（API の上限に当たったとき用）。
  python tools/realign_export.py <出力フォルダ> <slug>
<slug>_chunks.mp3（無音で切ったチャンクのあいだに「ピッ」を入れた音声）、<slug>_chunks_first.txt（1回めに打ちこむ指示）、
<slug>_chunks_script.txt（2回めに添付：書き起こしたチャンクが台本の何行めかを数の配列で答えさせる）ができる。
答えの配列は tools/realign_import.py にわたす。"""
import pathlib, subprocess, sys, wave
import numpy as np
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import realign

FIRST = "この音声は、日本語のナレーションを短く切ったものを順につないだもので、切ったところにはかならず「ピッ」という高い電子音が1回入っています（電子音は{b}回、区間は{k}個）。区間は文の途中で切れていることが多く、「正解は」「1番。」のようにとても短い区間もあります。電子音で区切られた区間ごとに、その区間で実際に聞こえた言葉を、そのまま書き起こしてください。電子音の位置を正確に守り、区間をまとめたり分けたりしないでください。JSONの文字列の配列だけを、区間の順に{k}個返してください。"
SECOND = """これは台本です（番号つきの行）。あなたがさきほど書き起こした {k} 個の区間は、この台本を上から順に読んだものを細かく切ったものです。
音声は聞き直さず、書き起こしをそのまま使って、それぞれの区間が台本の何行めの言葉かを答えてください。
- 区間は台本の順に進みます。1つの行は、1つまたは続いたいくつかの区間でできています。
- 「正解は」「1番。」「だから、」のような短い区間も、その言葉がある行に入れてください（前の行に入れない）。
行番号だけを区間の順にならべた、数の配列だけを返してください（例: [0,0,1,1,1,2]）。配列の長さは {k} にしてください。

台本:
{script}"""


def main(out, slug):
    out = pathlib.Path(out); out.mkdir(parents=True, exist_ok=True)
    audio, sr, chunks = realign.stream_of([slug])
    t = np.arange(int(sr * 0.25)) / sr
    beep = np.sin(2 * np.pi * 1760 * t) * 0.35 * np.minimum(1, np.minimum(t, t[::-1]) / 0.01)
    gap = np.zeros(int(sr * 0.35)); pad = int(sr * 0.05); parts = []
    for i, (s, e, _, _) in enumerate(chunks):
        if i: parts += [gap, beep, gap]
        parts.append(audio[max(0, s - pad): e + pad])
    y = np.concatenate(parts); tmp = out / f"{slug}_chunks.wav"
    realign.save(tmp, y, sr)
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(tmp), "-b:a", "48k", str(out / f"{slug}_chunks.mp3")], check=True)
    tmp.unlink()
    k = len(chunks); texts = realign.texts_of(slug)
    (out / f"{slug}_chunks_first.txt").write_text(FIRST.format(k=k, b=k - 1))
    (out / f"{slug}_chunks_script.txt").write_text(SECOND.format(k=k, script="\n".join(f"{i}: {x}" for i, x in enumerate(texts))))
    print(slug, "チャンク", k, "個", round(len(y) / sr), "秒")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
