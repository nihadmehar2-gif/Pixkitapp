#!/bin/bash
# PART 5: start server, run a11y scan in one invocation.
set -u
cd /home/z/my-project
LABEL="${1:-run}"
PORT=3100
# Robustly clear the port (fuser -k is unreliable against next-server).
for i in 1 2 3 4 5; do
  PIDS=$(ss -tlnp 2>/dev/null | grep ":${PORT} " | grep -oE 'pid=[0-9]+' | cut -d= -f2 | sort -u)
  [ -z "$PIDS" ] && break
  for pid in $PIDS; do kill -9 "$pid" 2>/dev/null; done
  sleep 1
done
if ss -tln 2>/dev/null | grep -q ":${PORT} "; then echo "PORT_STILL_BUSY"; exit 1; fi
NODE_ENV=production PORT=$PORT HOSTNAME=127.0.0.1 node .next/standalone/server.js >/tmp/a11y-server.log 2>&1 &
SERVER_PID=$!
ready=0
for i in $(seq 1 40); do
  if curl -s -o /dev/null -w "%{http_code}" "http://127.0.0.1:$PORT/" | grep -q 200; then ready=1; break; fi
  sleep 1
done
if [ "$ready" != "1" ]; then echo "SERVER_FAILED"; cat /tmp/a11y-server.log; kill $SERVER_PID 2>/dev/null; exit 1; fi
# Stale-build guard: served HTML must reference chunks that exist on disk.
FIRST_CHUNK=$(curl -s "http://127.0.0.1:$PORT/" | grep -o '/_next/static/chunks/[a-z0-9]*\.js' | head -1)
# URL /_next/static/... lives at .next/standalone/.next/static/... on disk.
REL_PATH="${FIRST_CHUNK//\_next//.next}"
if [ -z "$FIRST_CHUNK" ] || [ ! -f ".next/standalone$REL_PATH" ]; then
  echo "STALE_SERVER_DETECTED (chunk $FIRST_CHUNK missing) — aborting"; fuser -k ${PORT}/tcp 2>/dev/null; exit 1
fi
echo "server up (build chunk check OK)"
node scripts/a11y-scan.mjs "http://127.0.0.1:$PORT" "$LABEL" > "scripts/a11y-$LABEL.jsonl"
kill $SERVER_PID 2>/dev/null
echo "DONE -> scripts/a11y-$LABEL.jsonl"
