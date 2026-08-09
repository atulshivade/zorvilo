"""Turns the supplied Zorvilo logo PDF into web assets.

The artwork is flat vector lettering, so the primary output is an SVG cropped to
the ink — it stays crisp at any size and costs a few kilobytes. A raster copy is
written alongside it for social/Open Graph use, which cannot take SVG.

    python tools/prepare_logo.py
"""

from __future__ import annotations

import re
from pathlib import Path

import fitz
import numpy as np
from PIL import Image

SRC = Path(__file__).resolve().parents[2] / "Zorvilo LOGO (PDF)TM.pdf"
OUT = Path(__file__).resolve().parents[1] / "assets" / "img"
PROBE_ZOOM = 4.0


def ink_box(page: fitz.Page) -> fitz.Rect:
    """Finds the artwork bounds by rasterising once and measuring the ink.

    Reading the drawing commands would miss clipped or masked art, whereas what
    the renderer actually paints is exactly what needs to be cropped to.
    """
    pixmap = page.get_pixmap(matrix=fitz.Matrix(PROBE_ZOOM, PROBE_ZOOM), alpha=True)
    image = Image.frombytes("RGBA", (pixmap.width, pixmap.height), pixmap.samples)

    alpha = np.array(image.getchannel("A"))
    if alpha.min() == 255:  # opaque page: treat near-white as background
        alpha = np.where(np.array(image.convert("L")) < 245, 255, 0).astype(np.uint8)

    rows = np.where(alpha.max(axis=1) > 8)[0]
    cols = np.where(alpha.max(axis=0) > 8)[0]
    margin = 2 * PROBE_ZOOM
    return fitz.Rect(
        page.rect.x0 + cols.min() / PROBE_ZOOM - margin,
        page.rect.y0 + rows.min() / PROBE_ZOOM - margin,
        page.rect.x0 + (cols.max() + 1) / PROBE_ZOOM + margin,
        page.rect.y0 + (rows.max() + 1) / PROBE_ZOOM + margin,
    ) & page.rect


def report(name: str, extra: str = "") -> None:
    size = (OUT / name).stat().st_size
    print(f"  {name:<22}{extra:>14}{size / 1024:>8.1f} KB")


with fitz.open(SRC) as document:
    page = document[0]
    page.set_cropbox(ink_box(page))
    print(f"cropped to artwork: {page.rect.width:.0f} x {page.rect.height:.0f} pt")

    svg = page.get_svg_image()

    # The PDF paints an opaque white plate behind the lettering. Dropping it is
    # what makes the logo usable on the dark header; the counters inside the
    # letters are holes in the black paths, so they survive untouched.
    svg, plates = re.subn(r'<path\b[^>]*fill="#ffffff"[^>]*/>\s*', "", svg)
    print(f"  removed {plates} white background plate(s)")

    ink = sorted({f.lower() for f in re.findall(r'fill="(#[0-9a-fA-F]{6})"', svg)})
    print(f"  ink colours: {', '.join(ink) or 'none declared'}")

    (OUT / "logo.svg").write_text(svg, encoding="utf-8")
    report("logo.svg", f"{page.rect.width:.0f}x{page.rect.height:.0f}")

    for colour in ink:
        svg = svg.replace(f'fill="{colour}"', 'fill="#ffffff"')
    (OUT / "logo-white.svg").write_text(svg, encoding="utf-8")
    report("logo-white.svg", f"{page.rect.width:.0f}x{page.rect.height:.0f}")

    # Raster fallback for Open Graph, which cannot use SVG.
    zoom = 360 / page.rect.height
    pixmap = page.get_pixmap(matrix=fitz.Matrix(zoom, zoom), alpha=False)
    flat = Image.frombytes("RGB", (pixmap.width, pixmap.height), pixmap.samples)

# Monochrome art on a white plate: the inverse of luminance is exactly the
# coverage of the ink, which keeps the antialiased edges clean under either
# colour instead of leaving a white halo.
coverage = Image.fromarray(255 - np.array(flat.convert("L")))

for name, colour in (("logo.png", (17, 17, 17)), ("logo-white.png", (255, 255, 255))):
    layer = Image.new("RGBA", flat.size, colour + (0,))
    layer.putalpha(coverage)
    layer.save(OUT / name)
    report(name, f"{layer.width}x{layer.height}")

# Favicon: the wordmark is far too wide to read at 32 px, so the leading "z" is
# lifted out on its own. The script face joins the letters, so there is no gap
# to detect — the glyph is taken as the leading slice of the inked width.
Z_SHARE = 0.165
mask = np.array(coverage)
inked = np.where(mask.max(axis=0) > 8)[0]
left, right = int(inked.min()), int(inked.min() + (inked.max() - inked.min()) * Z_SHARE)
rows = np.where(mask[:, left:right].max(axis=1) > 8)[0]
glyph = Image.new("RGBA", flat.size, (255, 255, 255, 0))
glyph.putalpha(coverage)
glyph = glyph.crop((left, int(rows.min()), right, int(rows.max()) + 1))

side = round(max(glyph.size) * 1.42)
icon = Image.new("RGBA", (side, side), (11, 11, 13, 255))
icon.paste(glyph, ((side - glyph.width) // 2, (side - glyph.height) // 2), glyph)
icon.resize((256, 256), Image.LANCZOS).save(OUT / "favicon.png")
report("favicon.png", f"256x256 (from {glyph.width}x{glyph.height} glyph)")
