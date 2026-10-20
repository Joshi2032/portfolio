"""Regenerate both CVs as clean single-stream PDFs cloning the original design.

Text is taken verbatim from the current PDFs (positions/fonts/colors extracted
into _cv_dump.json), but written once, in reading order, into a fresh document
built with ReportLab: no XObject clips, no duplicated text, no patched layers,
and plain spaces so ATS parsers extract clean text.
"""
import fitz, json
from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.colors import HexColor
from reportlab.lib.utils import ImageReader

DUMP = json.loads(Path("scripts/_cv_dump.json").read_text(encoding="utf-8"))
pdfmetrics.registerFont(TTFont("cal", r"C:\Windows\Fonts\calibri.ttf"))
pdfmetrics.registerFont(TTFont("calb", r"C:\Windows\Fonts\calibrib.ttf"))

W, H = 612.18, 792.0
BLUE = HexColor("#1b5fa8")
GREEN = HexColor("#0f6e56")
GREY = HexColor("#d9d9d9")

def norm(t):
    return (t.replace("\u00a0", " ").replace("\u2010", "-").replace("\u2011", "-")
             .replace("\u2219", "·").replace("\u2212", "-").strip())

LAYOUT = {
    "ES": {"green": [146.9, 262.2, 702.2], "table": (152.0, 237.0, [180.3, 208.3])},
    "EN": {"green": [146.9, 271.1, 700.1], "table": (152.0, 245.9, [180.3, 217.2])},
}

for lang in ["ES", "EN"]:
    src_path = Path(f"public/cv/Josue-Isai-Salazar-Castro-CV-{lang}.pdf")
    src = fitz.open(src_path)
    spage = src[0]
    data = DUMP[lang]
    out = Path(f"scripts/_cv_{lang}_clean.pdf")

    c = canvas.Canvas(str(out), pagesize=(W, H))
    c.setTitle("Josue Isai Salazar Castro - CV")
    c.setAuthor("Josue Isai Salazar Castro")
    c.setSubject("Full Stack Developer - Flutter - Applied AI")

    lay = LAYOUT[lang]
    # ---- decorative rules (drawn first) ----
    c.setFillColor(BLUE)
    for y in (83.4, 127.4):
        c.rect(29.5, H - y - 1.4, 553.2, 1.4, stroke=0, fill=1)
    c.setFillColor(GREEN)
    for y in lay["green"]:
        c.rect(29.5, H - y - 0.7, 553.2, 0.7, stroke=0, fill=1)
    top, bottom, seps = lay["table"]
    c.setStrokeColor(GREY); c.setLineWidth(0.5)
    c.rect(30.9, H - bottom, 550.1, bottom - top, stroke=1, fill=0)
    c.line(312.0, H - top, 312.0, H - bottom)
    for y in seps:
        c.line(30.9, H - y, 581.0, H - y)

    # ---- social icons (original pixmaps with their alpha masks) ----
    img_boxes = []
    for item in spage.get_images(full=True):
        try:
            img_boxes.append((spage.get_image_bbox(item), item[0], item[1]))
        except Exception:
            continue
    seen = set()
    for link in spage.get_links():
        if link["kind"] != fitz.LINK_URI:
            continue
        r = link["from"]
        key = (round(r.x0), round(r.y0))
        if key in seen:
            continue
        seen.add(key)
        for (br, xr, sm) in img_boxes:
            if abs(br.x0 - r.x0) < 3 and abs(br.y0 - r.y0) < 3:
                pix = fitz.Pixmap(src, xr)
                if sm:
                    if pix.alpha:
                        pix = fitz.Pixmap(pix, 0)
                    pix = fitz.Pixmap(pix, fitz.Pixmap(src, sm))
                png = Path(f"scripts/_icon_{lang}_{xr}.png")
                pix.save(png)
                c.drawImage(ImageReader(str(png)), r.x0, H - r.y0 - 24.5,
                            width=24.5, height=24.5, mask="auto")
                break
        c.linkURL(link["uri"], (r.x0, H - r.y1, r.x1, H - r.y0), relative=0)

    # ---- text: every original span once, in reading order ----
    spans = [s for s in data["spans"] if "text" in s and norm(s["text"])]
    spans.sort(key=lambda s: (round(s["y"] / 4), s["x"]))
    for s in spans:
        c.setFont("calb" if "Bold" in s["font"] else "cal", s["size"])
        c.setFillColor(HexColor(s["color"]))
        c.drawString(s["x"], H - s["oy"], norm(s["text"]))

    c.showPage()
    c.save()
    src.close()
    print(f"{lang}: saved {out}")
