"""Local development server with a QR code that opens menu.html on the LAN."""
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
import os
import socket

ROOT = Path(__file__).resolve().parent
PORT = int(os.environ.get("PORT", "8000"))


def local_ip() -> str:
    """Find the computer's LAN IP without sending network traffic."""
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        sock.connect(("192.0.2.1", 80))  # documentation-only address; no packet is sent
        return sock.getsockname()[0]
    except OSError:
        try:
            return socket.gethostbyname(socket.gethostname())
        except OSError:
            return "127.0.0.1"
    finally:
        sock.close()


if __name__ == "__main__":
    from generate_qr import generate

    public_url = os.environ.get("CAFE_PUBLIC_URL", "").strip()
    if public_url:
        menu_url = public_url.rstrip("/")
        if not menu_url.lower().endswith("/menu.html"):
            menu_url += "/menu.html"
    else:
        menu_url = f"http://{local_ip()}:{PORT}/menu.html"

    generate(menu_url)
    os.chdir(ROOT)
    handler = lambda *args, **kwargs: SimpleHTTPRequestHandler(*args, directory=str(ROOT), **kwargs)
    server = ThreadingHTTPServer(("0.0.0.0", PORT), handler)

    print("\nکافه آرامش آماده است:")
    print(f"روی همین کامپیوتر: http://localhost:{PORT}/")
    print(f"روی گوشی (همان Wi-Fi): {menu_url}")
    if public_url:
        print("QR بر اساس نشانی عمومی تنظیم شده است.")
    else:
        print("گوشی و کامپیوتر باید به یک شبکه Wi-Fi وصل باشند.")
    print("برای توقف سرور Ctrl+C را بزنید.\n")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nسرور متوقف شد.")
        server.server_close()
