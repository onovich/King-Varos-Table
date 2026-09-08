"""Losslessly replace large review PNGs; requires Pillow with WebP support.

Dry-run by default. --apply updates references after checking decoded pixels.
Original PNGs remain recoverable from Git history (see the generated manifest).
"""
import argparse
import hashlib
import io
import json
from pathlib import Path
import subprocess

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
REPORT = ROOT / 'docs/development/image-optimization.json'
FOLDERS = ('docs/ui-concepts/', 'web/prototypes/imperial-table/assets/', 'tmp/')


def pixels(image):
    return hashlib.sha256(image.convert('RGBA').tobytes()).hexdigest()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--apply', action='store_true')
    parser.add_argument('--check', action='store_true', help='Verify optimized assets against recorded original pixels')
    args = parser.parse_args()
    if args.check:
        report = json.loads(REPORT.read_text(encoding='utf-8'))
        for entry in report['images']:
            path = ROOT / entry['output']
            with Image.open(path) as image:
                assert list(image.size) == entry['dimensions'], path
                assert pixels(image) == entry['rgba_sha256'], path
            assert path.stat().st_size == entry['output_bytes'], path
        print(f"Verified {len(report['images'])} images: dimensions and decoded pixels match originals.")
        return
    tracked = subprocess.check_output(['git', 'ls-files', '-z'], cwd=ROOT).decode().split('\0')
    candidates = [p for p in tracked if p.endswith('.png') and p.startswith(FOLDERS) and (ROOT / p).exists()]
    entries, outputs = [], []
    for relative in candidates:
        source = ROOT / relative
        destination = source.with_suffix('.webp')
        if destination.exists():
            raise FileExistsError(destination)
        with Image.open(source) as original:
            original.load()
            buffer = io.BytesIO()
            original.save(buffer, 'WEBP', lossless=True, exact=True, method=6,
                          icc_profile=original.info.get('icc_profile', b''))
            data = buffer.getvalue()
            if len(data) >= source.stat().st_size * .85:
                continue
            with Image.open(io.BytesIO(data)) as decoded:
                assert decoded.size == original.size and pixels(decoded) == pixels(original), source
            entries.append(dict(source=relative, output=destination.relative_to(ROOT).as_posix(),
                                source_bytes=source.stat().st_size, output_bytes=len(data),
                                dimensions=list(original.size), rgba_sha256=pixels(original)))
            outputs.append((source, destination, data))
    before, after = sum(e['source_bytes'] for e in entries), sum(e['output_bytes'] for e in entries)
    print(f'{len(entries)} images: {before:,} -> {after:,} bytes; saved {before-after:,} bytes.')
    if not args.apply or not entries:
        return
    # Verify all candidates before changing any files. Every source is tracked.
    for source, destination, data in outputs:
        destination.write_bytes(data)
    for relative in tracked:
        path = ROOT / relative
        if path.suffix not in ('.md', '.html', '.css', '.js', '.mjs') or not path.is_file():
            continue
        old = path.read_text(encoding='utf-8')
        new = old
        for entry in entries:
            new = new.replace(Path(entry['source']).name, Path(entry['output']).name)
        if new != old:
            path.write_text(new, encoding='utf-8')
    for source, _, _ in outputs:
        source.unlink()
    REPORT.write_text(json.dumps(dict(
        original_commit=subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=ROOT).decode().strip(),
        encoding='WebP lossless, method=6, exact=True; original dimensions and ICC profile retained',
        source_bytes=before, output_bytes=after, saved_bytes=before-after, images=entries,
    ), ensure_ascii=False, indent=2) + '\n', encoding='utf-8')


if __name__ == '__main__':
    main()
