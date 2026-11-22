#!/usr/bin/env python3
"""Pixel-diff helper for matching the dashboard against the Figma exports.

The Figma frames in `admin-portal/` are exported at 2x; `admin-portal/1x/`
holds them at true CSS-pixel size, which is what the browser screenshots are
compared against.

    python3 pixel.py probe  admin-portal/1x/Patients.png --col 120
    python3 pixel.py probe  admin-portal/1x/Patients.png --row 40
    python3 pixel.py diff   admin-portal/1x/Patients.png live/patients.png
"""

import argparse
import sys

import numpy as np
from PIL import Image


def load(path):
    return np.asarray(Image.open(path).convert("RGB"), dtype=np.int16)


def hexof(px):
    return "#%02x%02x%02x" % tuple(int(v) for v in px)


def runs(line, min_len):
    """Collapse a scanline into (start, end, hex) runs of one colour."""
    out, start = [], 0
    for i in range(1, len(line) + 1):
        if i == len(line) or not np.array_equal(line[i], line[start]):
            if i - start >= min_len:
                out.append((start, i - 1, i - start, hexof(line[start])))
            start = i
    return out


def cmd_probe(args):
    img = load(args.image)
    h, w, _ = img.shape
    print(f"{args.image}: {w}x{h}")
    if args.col is not None:
        print(f"\ncolumn x={args.col}  (y_start, y_end, len, colour)")
        for r in runs(img[:, args.col], args.min_len):
            print("  %5d %5d %5d  %s" % r)
    if args.row is not None:
        print(f"\nrow y={args.row}  (x_start, x_end, len, colour)")
        for r in runs(img[args.row, :], args.min_len):
            print("  %5d %5d %5d  %s" % r)
    if args.at:
        x, y = args.at
        print(f"\npixel ({x},{y}) = {hexof(img[y, x])}")


def cmd_diff(args):
    ref, live = load(args.ref), load(args.live)
    rh, rw, _ = ref.shape
    lh, lw, _ = live.shape
    print(f"ref  {rw}x{rh}\nlive {lw}x{lh}")
    if rw != lw:
        print(f"WIDTH MISMATCH: resize the browser to {rw}px before shooting.")

    h, w = min(rh, lh), min(rw, lw)
    a, b = ref[:h, :w], live[:h, :w]
    delta = np.abs(a - b).max(axis=2)
    bad = delta > args.tol
    print(f"compared {w}x{h}: {bad.mean() * 100:.2f}% of pixels differ "
          f"(tolerance {args.tol})")

    # Which horizontal bands are worst — tells you which row of the layout to
    # fix next instead of hunting the whole page.
    band = max(1, h // 40)
    scores = [(bad[y:y + band].mean(), y) for y in range(0, h, band)]
    print("\nworst bands (y range, % differing):")
    for score, y in sorted(scores, reverse=True)[:8]:
        if score > 0.001:
            print(f"  y {y:5d}-{min(y + band, h):5d}  {score * 100:5.1f}%")

    if args.out:
        heat = np.zeros((h, w, 3), dtype=np.uint8)
        heat[..., 0] = np.where(bad, 255, 0)
        blend = (b[:, :, :3] * 0.35 + heat * 0.65).astype(np.uint8)
        canvas = Image.new("RGB", (w * 3 + 32, h), "white")
        canvas.paste(Image.fromarray(a.astype(np.uint8)), (0, 0))
        canvas.paste(Image.fromarray(b.astype(np.uint8)), (w + 16, 0))
        canvas.paste(Image.fromarray(blend), (w * 2 + 32, 0))
        canvas.save(args.out)
        print(f"\nwrote {args.out}  (ref | live | diff)")


def main():
    p = argparse.ArgumentParser()
    sub = p.add_subparsers(dest="cmd", required=True)

    pr = sub.add_parser("probe")
    pr.add_argument("image")
    pr.add_argument("--col", type=int)
    pr.add_argument("--row", type=int)
    pr.add_argument("--at", type=int, nargs=2, metavar=("X", "Y"))
    pr.add_argument("--min-len", type=int, default=3)
    pr.set_defaults(func=cmd_probe)

    df = sub.add_parser("diff")
    df.add_argument("ref")
    df.add_argument("live")
    df.add_argument("--out")
    df.add_argument("--tol", type=int, default=16)
    df.set_defaults(func=cmd_diff)

    args = p.parse_args()
    args.func(args)


if __name__ == "__main__":
    sys.exit(main())
