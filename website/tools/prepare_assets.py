"""Derives the website's product imagery from the original Zorvilo product photos.

The source photos are studio line-ups on white/grey sweeps plus one two-panel
composite. This script lifts the products off the sweep into transparent WebP
cut-outs, splits the line-ups into individual bottles, and slices the composite.
Re-run it whenever the source photography is refreshed:

    python tools/prepare_assets.py

Cut-out approach: flood-fill inwards from the frame border (which reliably
removes the sweep and its soft shadows), then repair the mask with morphology.
The repair matters because clear PET necks are the same tone as the sweep, so
the raw fill leaks into the bottles and has to be closed and hole-filled again.
"""

from __future__ import annotations

from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage

SRC = Path(__file__).resolve().parents[2] / "source-photos"
OUT = Path(__file__).resolve().parents[1] / "assets" / "img"
OUT.mkdir(parents=True, exist_ok=True)

SENTINEL = (255, 0, 255)

CAN_BACK = SRC / "WhatsApp Image 2026-08-09 at 11.13.42 AM.jpeg"
CAN_PACK = SRC / "WhatsApp Image 2026-08-09 at 11.13.42 AM (2).jpeg"
SOFT_DRINKS = SRC / "WhatsApp Image 2026-08-09 at 11.14.06 AM.jpeg"
FRUIT_DRINKS = SRC / "WhatsApp Image 2026-08-09 at 11.14.33 AM.jpeg"
COMPOSITE = SRC / "WhatsApp Image 2026-08-09 at 11.14.54 AM.jpeg"


def disk(radius: int) -> np.ndarray:
    y, x = np.ogrid[-radius:radius + 1, -radius:radius + 1]
    return x * x + y * y <= radius * radius


def foreground_mask(path: Path, thresh: int, close: int = 6, open_: int = 4) -> tuple[Image.Image, np.ndarray]:
    """Return the original image plus a cleaned boolean foreground mask."""
    original = Image.open(path).convert("RGB")
    w, h = original.size
    work = original.copy()
    seeds = [
        (0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1),
        (w // 2, 0), (w // 2, h - 1), (0, h // 2), (w - 1, h // 2),
        (w // 4, 0), (3 * w // 4, 0), (w // 4, h - 1), (3 * w // 4, h - 1),
    ]
    for seed in seeds:
        ImageDraw.floodfill(work, seed, SENTINEL, thresh=thresh)

    filled = np.array(work)
    mask = ~np.all(filled == np.array(SENTINEL, dtype=np.uint8), axis=-1)
    mask = ndimage.binary_closing(mask, structure=disk(close))
    mask = ndimage.binary_fill_holes(mask)
    mask = ndimage.binary_opening(mask, structure=disk(open_))
    return original, mask


def components(mask: np.ndarray, min_area_frac: float = 0.01, min_height_frac: float = 0.25) -> list[np.ndarray]:
    """Split a mask into per-product masks, ordered left to right."""
    labels, count = ndimage.label(mask)
    total = mask.shape[0] * mask.shape[1]
    keep = []
    for index in range(1, count + 1):
        part = labels == index
        rows = np.where(part.any(axis=1))[0]
        if part.sum() < total * min_area_frac:
            continue
        if (rows.max() - rows.min()) < mask.shape[0] * min_height_frac:
            continue
        cols = np.where(part.any(axis=0))[0]
        keep.append((cols.min(), part))
    keep.sort(key=lambda item: item[0])
    return [part for _, part in keep]


def to_rgba(original: Image.Image, mask: np.ndarray) -> Image.Image:
    """Feather a boolean mask into a premultiplied-looking alpha channel."""
    eroded = ndimage.binary_erosion(mask, structure=disk(1))
    alpha = Image.fromarray((eroded * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.8))
    rgba = original.convert("RGBA")
    rgba.putalpha(alpha)
    return rgba


def pad(box, amount: int, size) -> tuple[int, int, int, int]:
    left, top, right, bottom = box
    return (
        max(0, left - amount), max(0, top - amount),
        min(size[0], right + amount), min(size[1], bottom + amount),
    )


def save(image: Image.Image, name: str, max_side: int = 1000, quality: int = 86) -> None:
    image = image.copy()
    scale = max_side / max(image.size)
    if scale < 1:
        image = image.resize((round(image.width * scale), round(image.height * scale)), Image.LANCZOS)
    target = OUT / name
    params: dict = {"quality": quality, "method": 6}
    if image.mode == "RGBA":
        params["exact"] = True
    image.save(target, "WEBP", **params)
    print(f"  {name:<26} {image.size[0]:>4}x{image.size[1]:<4}  {target.stat().st_size / 1024:5.0f} KB")


def uniform(image: Image.Image, height: int) -> Image.Image:
    """Line-ups are shot in perspective, so identical bottles differ in size.

    Rendering them to one height keeps the product grid visually honest.
    """
    scale = height / image.height
    return image.resize((max(1, round(image.width * scale)), height), Image.LANCZOS)


def export_lineup(path: Path, names: list[str], thresh: int, height: int = 820, **kwargs) -> None:
    original, mask = foreground_mask(path, thresh, **kwargs)
    parts = components(mask)
    print(f"  {path.name} -> {len(parts)} components (expected {len(names)})")
    if len(parts) != len(names):
        raise SystemExit(f"  !! component count mismatch for {path.name}")
    for part, name in zip(parts, names):
        rgba = to_rgba(original, part)
        save(uniform(rgba.crop(pad(rgba.getbbox(), 14, rgba.size)), height), name, max_side=height)


def export_soft_drinks(names: list[str], height: int = 820) -> None:
    """Split the soft-drink line-up without clipping the clear necks.

    A high flood threshold separates the four bottles cleanly but eats their
    transparent neck and cap, which are the same tone as the sweep. A low
    threshold keeps the full silhouette but merges the bottles into one blob.
    So: take the positions from the high-threshold pass and the shape from the
    low-threshold pass, cutting between bottles at the midpoints.
    """
    original, separated = foreground_mask(SOFT_DRINKS, thresh=55, close=4, open_=4)
    _, whole = foreground_mask(SOFT_DRINKS, thresh=32, close=4, open_=4)

    parts = components(separated)
    print(f"  {SOFT_DRINKS.name} -> {len(parts)} components (expected {len(names)})")
    if len(parts) != len(names):
        raise SystemExit("  !! component count mismatch for the soft drinks")

    centres = []
    for part in parts:
        cols = np.where(part.any(axis=0))[0]
        centres.append((cols.min() + cols.max()) / 2)

    for index, name in enumerate(names):
        left = 0 if index == 0 else int((centres[index - 1] + centres[index]) / 2)
        right = whole.shape[1] if index == len(names) - 1 else int((centres[index] + centres[index + 1]) / 2)

        window = np.zeros_like(whole)
        window[:, left:right] = whole[:, left:right]
        # Drop any shadow fragments that fall inside the window.
        labels, count = ndimage.label(window)
        if count > 1:
            sizes = ndimage.sum(window, labels, range(1, count + 1))
            window = labels == (int(np.argmax(sizes)) + 1)

        rgba = to_rgba(original, window)
        save(uniform(rgba.crop(pad(rgba.getbbox(), 14, rgba.size)), height), name, max_side=height)


def whiten(image: Image.Image, floor: int = 150, ceiling: int = 232) -> Image.Image:
    """Ramp near-white, low-saturation pixels up to pure white.

    Used for the clear-PET fruit bottles: their empty upper half is the same
    tone as the backdrop, so a flood-fill cut-out eats the bottle. Cleaning the
    cloth backdrop to pure white instead lets the crop sit on a white card.
    Anything at or above the ceiling goes fully white so the creased backdrop
    does not read as a grey panel behind the bottle.
    """
    data = np.array(image.convert("RGB"), dtype=np.float32)
    lo, hi = data.min(axis=2), data.max(axis=2)
    neutral = (hi - lo) < 26
    ramp = np.clip((lo - floor) / float(ceiling - floor), 0, 1)[..., None]
    lifted = data + (255.0 - data) * ramp
    out = np.where(neutral[..., None], lifted, data)
    return Image.fromarray(out.clip(0, 255).astype(np.uint8))


def export_fruit_drinks(names: list[str], height: int = 820) -> None:
    """Locate the bottles via their labels, then crop full-height from a whitened plate."""
    original, mask = foreground_mask(FRUIT_DRINKS, thresh=70, close=4, open_=4)
    parts = components(mask)
    print(f"  {FRUIT_DRINKS.name} -> {len(parts)} components (expected {len(names)})")
    if len(parts) != len(names):
        raise SystemExit("  !! component count mismatch for the fruit drinks")

    plate = whiten(original)
    ink = np.array(plate.convert("L")) < 244

    spread = np.where(ink.sum(axis=1) > 6)[0]
    columns = np.where(ink.sum(axis=0) > 6)[0]
    save(plate.crop((columns.min() - 20, spread.min() - 20, columns.max() + 20, spread.max() + 20)),
         "lineup-fruit.webp", max_side=1400, quality=84)

    # Two of these bottles are clear above the label, so the detected components
    # cover the label rather than the silhouette and bleed into their neighbour.
    # The windows below are measured off the source photo (1536 px wide) and give
    # each bottle its own centred frame; rows are still found from the ink.
    windows = [(307, 582), (602, 875), (917, 1205)]
    if plate.width != 1536:
        raise SystemExit(f"  !! fruit windows assume a 1536 px source, got {plate.width}")

    for (left, right), name in zip(windows, names):
        rows = np.where(ink[:, left:right].sum(axis=1) > 4)[0]
        box = (left, max(0, int(rows.min()) - 14), right, min(plate.height, int(rows.max()) + 15))
        save(uniform(plate.crop(box), height), name, max_side=height)


def export_cans() -> None:
    original, mask = foreground_mask(CAN_BACK, thresh=30)
    rgba = to_rgba(original, mask)
    save(rgba.crop(pad(rgba.getbbox(), 14, rgba.size)), "can-back.webp", max_side=1000)

    # The can stands in front of the party carton, so they share one silhouette.
    # The carton starts lower down the frame, so the widest point of the upper
    # rows is the can's true right edge — cut there to slice the two apart.
    original, mask = foreground_mask(CAN_PACK, thresh=30)
    rgba = to_rgba(original, mask)
    rows = np.where(mask.any(axis=1))[0]
    upper = mask[rows.min():rows.min() + (rows.max() - rows.min()) // 4]
    cut = int(np.where(upper.any(axis=0))[0].max()) + 2
    print(f"  can/carton split at x={cut}")
    can = rgba.crop((0, 0, cut, rgba.height))
    save(can.crop(pad(can.getbbox(), 14, can.size)), "can-front.webp", max_side=1200)
    save(rgba.crop(pad(rgba.getbbox(), 14, rgba.size)), "party-pack.webp", max_side=1200)


def export_composite() -> None:
    """The composite stacks a juice line-up over a beer line-up, each captioned."""
    image = Image.open(COMPOSITE).convert("RGB")
    w, h = image.size
    rows = np.array(image.convert("L"), dtype=float).mean(axis=1)
    divider = int(h * 0.25) + int(np.argmin(rows[int(h * 0.25):int(h * 0.6)]))
    print(f"  panel divider at y={divider} of {h}")

    juices = image.crop((0, int(h * 0.055), w, divider - 4))
    beers = image.crop((0, divider + int(h * 0.058), w, h))
    save(juices, "lineup-juices.webp", max_side=1600, quality=82)
    save(beers, "lineup-beers.webp", max_side=1600, quality=82)

    # Evenly spaced studio line-ups, so fixed slices give clean per-bottle cards.
    slice_panel(juices, 7, 0.035, 0.975, [
        "juice-wildberry.webp", "juice-orange.webp", "juice-litchi.webp", "juice-pineapple.webp",
        "juice-anaar.webp", "juice-kiwi.webp", "juice-guava.webp",
    ])
    slice_panel(beers, 5, 0.030, 0.980, [
        "beer-green-apple.webp", "beer-malty.webp", "beer-cranberry.webp",
        "beer-classic.webp", "beer-candied-malt.webp",
    ])


TILE_ASPECT = 0.62


def pad_to_aspect(image: Image.Image, aspect: float = TILE_ASPECT) -> Image.Image:
    """Widen a crop to the product tile's aspect by replicating its edge pixels.

    The line-up backdrops are smooth and out of focus, so stretching the outermost
    column outwards extends them seamlessly. This lets a photographic crop fill the
    same tile shape as a transparent cut-out without cropping the bottle.
    """
    target = round(image.height * aspect)
    if target <= image.width:
        return image
    data = np.array(image.convert("RGB"))
    extra = target - image.width
    left = extra // 2
    padded = np.concatenate([
        np.repeat(data[:, :1], left, axis=1),
        data,
        np.repeat(data[:, -1:], extra - left, axis=1),
    ], axis=1)
    out = Image.fromarray(padded)
    # Soften the replicated bands so no hard seam or streak reads as an edge.
    band = Image.new("L", out.size, 0)
    ImageDraw.Draw(band).rectangle([0, 0, left + 10, out.height], fill=255)
    ImageDraw.Draw(band).rectangle([left + image.width - 10, 0, out.width, out.height], fill=255)
    return Image.composite(out.filter(ImageFilter.GaussianBlur(9)), out, band.filter(ImageFilter.GaussianBlur(6)))


def slice_panel(panel: Image.Image, count: int, x0: float, x1: float, names: list[str]) -> None:
    width = panel.width * (x1 - x0) / count
    for index, name in enumerate(names):
        left = panel.width * x0 + index * width
        crop = panel.crop((round(left), 0, round(left + width), panel.height))
        save(pad_to_aspect(crop), name, max_side=560, quality=84)


def main() -> None:
    print("Energy range:")
    export_cans()

    print("Soft drinks:")
    export_soft_drinks([
        "soft-cola.webp", "soft-jeera.webp", "soft-orange.webp", "soft-lemon.webp",
    ])

    print("Fruit drinks:")
    export_fruit_drinks(["fruit-mango.webp", "fruit-nimbu.webp", "fruit-litchi.webp"])

    print("Composite panels:")
    export_composite()


if __name__ == "__main__":
    main()
