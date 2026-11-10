"""Generate a QR image that opens the café menu URL."""
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parent
DEFAULT_URL = "https://your-cafe-domain.com/menu.html"


def generate(url: str) -> Path:
    try:
        import qrcode
        from qrcode.constants import ERROR_CORRECT_M
    except ImportError as exc:
        raise SystemExit("کتابخانه QR نصب نیست. اجرا کنید: pip install -r requirements.txt") from exc

    qr = qrcode.QRCode(
        version=None,
        error_correction=ERROR_CORRECT_M,
        box_size=10,
        border=4,
    )
    qr.add_data(url)
    qr.make(fit=True)
    image = qr.make_image(fill_color="#24120c", back_color="white").convert("RGB")
    destination = ROOT / "assets" / "images" / "menu-qr.png"
    destination.parent.mkdir(parents=True, exist_ok=True)
    image.save(destination)
    print(f"QR ساخته شد: {destination}")
    print(f"نشانی داخل QR: {url}")
    return destination


if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_URL
    generate(target)
