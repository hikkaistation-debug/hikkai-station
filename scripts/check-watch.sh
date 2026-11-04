#!/bin/sh
# チェック画面の「保存して Claude に渡す」を待つ（Claude が裏で動かす）。どのチェック画面でも使える共通版。
# 使い方：sh scripts/check-watch.sh x        … X投稿チェック（review/x-handoff.json）
#         sh scripts/check-watch.sh <名前>   … review/<名前>-handoff.json を待つ
# 待っているあいだは review/.claude-watching-<名前> を数秒ごとに更新する（画面に「Claude が待機中」と出る）。
# ボタンが押されて review/<名前>-handoff.json が新しくなったら、その中身を出して終わる。
name=${1:?使い方：sh scripts/check-watch.sh <名前>}
cd "$(dirname "$0")/.." || exit 1
f="review/$name-handoff.json"
alive="review/.claude-watching-$name"
mkdir -p review
start=$(stat -c %Y "$f" 2>/dev/null || echo 0)
trap 'rm -f "$alive"' EXIT
while :; do
  touch "$alive"
  now=$(stat -c %Y "$f" 2>/dev/null || echo 0)
  if [ "$now" != "$start" ]; then
    cat "$f"
    exit 0
  fi
  sleep 3
done
