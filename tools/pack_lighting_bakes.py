"""Prepare non-color runtime lightmaps after the Blender bake (requires Pillow).
Filter sampling noise in low-frequency irradiance, preserve 1K resolution, and
encode WebP losslessly. Originals can be recreated with the Blender source script.
"""
from pathlib import Path
from PIL import Image, ImageFilter
import json

ROOT=Path(__file__).resolve().parents[1]
BASE=ROOT/'web/prototypes/imperial-table/assets/baked-lighting'
manifest=json.loads((BASE/'bake-manifest.json').read_text(encoding='utf-8'))
runtime={}
for name,radius in [('table-ao',.7),('table-indirect',1.5)]:
    source=BASE/(name+'.png')
    with Image.open(source) as image:
        prepared=image.convert('RGB').filter(ImageFilter.GaussianBlur(radius))
        if name=='table-ao':prepared=prepared.convert('L').convert('RGB')
        prepared.save(BASE/(name+'.webp'),lossless=True,method=6)
    output=BASE/(name+'.webp')
    runtime[output.name]=dict(bytes=output.stat().st_size,resolution=[1024,1024],
        encoding='8-bit linear non-color WebP lossless',sampling_noise_filter_pixels=radius)
    assert source.resolve().is_relative_to(ROOT)
    source.unlink()
manifest['runtime_maps']=runtime
manifest['note']='PNG intermediates replaced by filtered, 8-bit non-color WebP; original bake is reproducible. This is not lossless relative to floating-point Cycles output.'
(BASE/'bake-manifest.json').write_text(json.dumps(manifest,indent=2)+'\n',encoding='utf-8')
print(json.dumps(runtime))
