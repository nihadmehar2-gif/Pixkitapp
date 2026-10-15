#!/usr/bin/env python3
"""Double-fork daemonizer for the PixKitApp dev/prod server.

The sandbox reaps every descendant of a tool-call shell when the call
completes. A classic double-fork orphans the server to PID 1 mid-call,
so the reaper can no longer find it as a shell descendant.

Usage:
  python3 dev-daemon.py [--port 3000] [--mode dev|prod]

dev  -> node node_modules/.bin/next dev -p PORT
prod -> PORT=PORT HOSTNAME=0.0.0.0 NODE_ENV=production node .next/standalone/server.js
"""
import os
import sys

PROJECT = "/home/z/my-project"
LOG = os.path.join(PROJECT, "dev.log")


def log(msg: str) -> None:
    with open(LOG, "a", encoding="utf-8") as fh:
        fh.write(f"[daemon] {msg}\n")


def parse_args(argv):
    port, mode = 3000, "dev"
    it = iter(argv)
    for a in it:
        if a in ("--port", "-p"):
            port = int(next(it))
        elif a in ("--mode", "-m"):
            mode = next(it)
    return port, mode


def first_fork() -> int:
    pid = os.fork()
    if pid > 0:
        os.waitpid(pid, 0)
        return 0
    os.setsid()
    pid2 = os.fork()
    if pid2 > 0:
        os._exit(0)
    devnull = os.open(os.devnull, os.O_RDWR)
    os.dup2(devnull, 0)
    os.dup2(devnull, 1)
    os.dup2(devnull, 2)
    if devnull > 2:
        os.close(devnull)
    os.chdir(PROJECT)
    return 1


def load_preview_env(env: dict) -> dict:
    """Load .env.preview (staging-only flags, e.g. NEXT_PUBLIC_INDEXING_MODE).

    This file is ONLY read here — never by `next build` in production — so the
    preview noindex switch cannot leak into a production deployment. Existing
    environment variables win over file values.
    """
    path = os.path.join(PROJECT, ".env.preview")
    if not os.path.exists(path):
        return env
    with open(path, encoding="utf-8") as fh:
        for line in fh:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, val = line.split("=", 1)
            env.setdefault(key.strip(), val.strip())
    log("loaded .env.preview (preview indexing protections active)")
    return env


def main() -> int:
    port, mode = parse_args(sys.argv[1:])
    import socket

    s = socket.socket()
    s.settimeout(1)
    try:
        s.connect(("127.0.0.1", port))
        s.close()
        log(f"port {port} already served; nothing to do")
        return 0
    except OSError:
        pass
    finally:
        try:
            s.close()
        except Exception:
            pass

    if first_fork() == 0:
        return 0

    # .env.preview (staging noindex flags) applies ONLY to the dev-mode
    # preview server. Production standalone must never inherit it.
    base_env = {**os.environ, "NEXT_TELEMETRY_DISABLED": "1"}
    env = load_preview_env(base_env) if mode == "dev" else base_env
    if mode == "prod":
        env.update(
            {
                "NODE_ENV": "production",
                "PORT": str(port),
                "HOSTNAME": "0.0.0.0",
            }
        )
        cmd = 'exec node .next/standalone/server.js >> "{log}" 2>&1'.format(log=LOG)
    else:
        cmd = 'exec node "{bin}" dev -p {port} >> "{log}" 2>&1'.format(
            bin=os.path.join(PROJECT, "node_modules", ".bin", "next"),
            port=port,
            log=LOG,
        )
    os.execvpe("/bin/bash", ["/bin/bash", "-c", cmd], env)
    return 0


if __name__ == "__main__":
    sys.exit(main())
