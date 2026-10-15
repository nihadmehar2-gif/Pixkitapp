"""Start production standalone server on :3001 as a daemon (double-fork)."""
import sys, os
sys.path.insert(0, "/home/z/my-project/scripts")
import subprocess

def daemonize_and_run():
    if os.fork() > 0:
        return  # parent returns immediately
    os.setsid()
    if os.fork() > 0:
        os._exit(0)
    with open("/home/z/my-project/prod.log", "ab") as out:
        out.write(f"\n=== prod start {__import__('time').ctime()} ===\n".encode())
        out.flush()
        subprocess.run(
            ["npx", "next", "start", "-p", "3001"],
            cwd="/home/z/my-project", stdout=out, stderr=out,
        )
    os._exit(0)

daemonize_and_run()
print("prod daemon launched")
