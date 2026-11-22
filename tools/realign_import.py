"""AI Studio の画面でもらった「区間ごとの行番号」の配列で、行を組み直す。
  python tools/realign_import.py <slug> '[0,0,1,1,...]'   （realign_export.py のあと、lines をさわらずに実行する）"""
import json, pathlib, sys
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import realign

slug, nums = sys.argv[1], json.loads(sys.argv[2])
def predict(script, cs):
    if abs(len(nums) - len(cs)) > max(3, len(cs) // 20): raise SystemExit(f"答え {len(nums)}個 / チャンク {len(cs)}個：数が合いません")
    return (nums + [-1] * len(cs))[: len(cs)]
realign.realign(None, [slug], predict=predict)
