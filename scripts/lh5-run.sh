#!/bin/bash
# PART 5: Lighthouse + JS-transfer measurement against the standalone prod server.
# Usage: lh5-run.sh <label>
# Starts server on :3100, runs Lighthouse (mobile default) on / and /image-compressor,
# plus a playwright-based JS transfer-size capture, all in ONE invocation.
set -u
LABEL="$1"
cd /home/z/my-project

PORT=3100
export CHROME_PATH=/home/z/.cache/ms-playwright/chromium-1200/chrome-linux64/chrome

# Robustly clear the port: kill any PID bound to it (fuser -k is unreliable
# against next-server), then wait until nothing is listening.
for i in 1 2 3 4 5; do
  PIDS=$(ss -tlnp 2>/dev/null | grep ":${PORT} " | grep -oE 'pid=[0-9]+' | cut -d= -f2 | sort -u)
  [ -z "$PIDS" ] && break
  for pid in $PIDS; do kill -9 "$pid" 2>/dev/null; done
  sleep 1
done
if ss -tln 2>/dev/null | grep -q ":${PORT} "; then echo "PORT_STILL_BUSY"; exit 1; fi

# --- start standalone prod server ---
NODE_ENV=production PORT=$PORT HOSTNAME=127.0.0.1 node .next/standalone/server.js >/tmp/lh5-server.log 2>&1 &
SERVER_PID=$!

# --- wait for readiness ---
ready=0
for i in $(seq 1 40); do
  if curl -s -o /dev/null -w "%{http_code}" "http://127.0.0.1:$PORT/" | grep -q 200; then ready=1; break; fi
  sleep 1
done
if [ "$ready" != "1" ]; then echo "SERVER_FAILED_TO_START"; cat /tmp/lh5-server.log; kill $SERVER_PID 2>/dev/null; exit 1; fi

# Stale-build guard: the readiness probe must 200 AND the first script chunk
# referenced by the served HTML must exist on disk (catches zombie servers
# serving prerendered HTML from a previous build).
FIRST_CHUNK=$(curl -s "http://127.0.0.1:$PORT/" | grep -o '/_next/static/chunks/[a-z0-9]*\.js' | head -1)
# URL /_next/static/... lives at .next/standalone/.next/static/... on disk.
REL_PATH="${FIRST_CHUNK//\_next//.next}"
if [ -z "$FIRST_CHUNK" ] || [ ! -f ".next/standalone$REL_PATH" ]; then
  echo "STALE_SERVER_DETECTED (chunk $FIRST_CHUNK missing) — aborting"; fuser -k ${PORT}/tcp 2>/dev/null; exit 1
fi
echo "server up on :$PORT (build chunk check OK)"

# --- security headers spot check (curl) ---
echo "--- headers on / ---"
curl -sI "http://127.0.0.1:$PORT/" | grep -iE "x-content-type-options|referrer-policy|permissions-policy|content-security-policy|x-frame-options|x-robots-tag"

# --- Lighthouse runs (mobile default emulation) ---
for spec in "home:/" "tool:/image-compressor"; do
  name="${spec%%:*}"; path="${spec#*:}"
  echo "--- lighthouse $name ($path) ---"
  lighthouse "http://127.0.0.1:$PORT$path" \
    --output=json --output-path="scripts/lh5-$name-$LABEL.json" \
    --chrome-flags="--headless=new --no-sandbox --disable-dev-shm-usage --disable-gpu" \
    --only-categories=performance,accessibility,best-practices,seo \
    --quiet 2>&1 | tail -2
done

# --- JS transfer size + console errors via playwright ---
CHROME_PATH=$CHROME_PATH node scripts/lh5-transfer.mjs "http://127.0.0.1:$PORT" "$LABEL" 2>&1 | tail -20

kill $SERVER_PID 2>/dev/null
echo "DONE $LABEL"
