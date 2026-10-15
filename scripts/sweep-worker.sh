#!/bin/bash
# Sweep tool pages: load each, capture page errors + UI presence.
# Usage: sweep-worker.sh <partfile> <session> <outfile>
PART="$1"; SES="$2"; OUT="$3"
: > "$OUT"
while IFS= read -r slug; do
  [ -z "$slug" ] && continue
  title=$(agent-browser --session "$SES" open "http://localhost:3001/$slug" 2>&1 | head -1)
  errs=$(agent-browser --session "$SES" errors 2>&1 | grep -vE "^\s*$" | head -3)
  errs_clean=$(echo "$errs" | grep -qiE "error" && echo "$errs" | head -2 | tr '\n' ' ' || echo "")
  ui=$(agent-browser --session "$SES" eval "JSON.stringify({h1: !!document.querySelector('h1'), ui: !!document.querySelector('input[type=file]') || !!document.querySelector('canvas')})" 2>&1 | tail -1)
  echo "$slug | $title | $ui | ${errs_clean:-none}" >> "$OUT"
done < "$PART"
echo "DONE $SES" >> "$OUT"
