#!/usr/bin/env python3
import os
import sys
from pyngrok import ngrok, conf
from pyngrok.installer import install_ngrok
from dotenv import load_dotenv

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(BASE_DIR, ".env"))

NGROK_AUTHTOKEN = os.getenv("NGROK_AUTHTOKEN")
NGROK_DOMAIN = os.getenv("NGROK_DOMAIN")
NGROK_PORT = int(os.getenv("NGROK_PORT", "8000"))
NGROK_PATH = os.path.join(BASE_DIR, "ngrok")

if not NGROK_AUTHTOKEN:
    print("ERROR: NGROK_AUTHTOKEN is not set in backend/.env")
    sys.exit(1)

from pathlib import Path

conf.get_default().auth_token = NGROK_AUTHTOKEN
conf.get_default().ngrok_path = NGROK_PATH
conf.get_default().ngrok_version = "v3"

config_path = Path.home() / ".config" / "ngrok" / "ngrok.yml"
conf.get_default().config_path = str(config_path)
if not config_path.exists():
    config_path.parent.mkdir(parents=True, exist_ok=True)
    with open(config_path, "w", encoding="utf-8") as config_file:
        config_file.write("version: \"2\"\n")
        config_file.write(f"authtoken: {NGROK_AUTHTOKEN}\n")

print("Starting ngrok tunnel...")
print(f"  Local target: http://127.0.0.1:{NGROK_PORT}")
if NGROK_DOMAIN:
    print(f"  Requested host: {NGROK_DOMAIN}")

if not os.path.exists(NGROK_PATH):
    print("Installing latest ngrok binary (v3) ...")
    install_ngrok(ngrok_path=NGROK_PATH, ngrok_version="v3")

try:
    if NGROK_DOMAIN:
        tunnel = ngrok.connect(addr=NGROK_PORT, proto="http", hostname=NGROK_DOMAIN, bind_tls=True)
    else:
        tunnel = ngrok.connect(addr=NGROK_PORT, proto="http", bind_tls=True)

    print("")
    print("Ngrok tunnel created:")
    print(f"  URL: {tunnel.public_url}")
    print("  Keep this terminal open while using the tunnel.")
    print("Press Ctrl+C to stop.")

    ngrok_process = ngrok.get_ngrok_process()
    ngrok_process.proc.wait()
except KeyboardInterrupt:
    print("\nStopping ngrok tunnel...")
    ngrok.kill()
    sys.exit(0)
except Exception as e:
    print(f"ERROR: Failed to create ngrok tunnel: {e}")
    print("If you are using a reserved domain, please confirm the domain is valid and your account supports it.")
    print("If you see an ngrok agent version error, install/upgrade the ngrok binary or use a paid ngrok plan.")
    sys.exit(1)
