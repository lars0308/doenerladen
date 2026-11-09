#!/usr/bin/env python3
"""Bettet alle Modelle/Texturen/Schrift als Base64 in src/assets.js ein, damit das Spiel auch per Doppelklick (file://) läuft.
Quellen: assets/packs/* (Kenney CC0, Quaternius CC0) und assets/fonts (OFL). Lizenzen liegen in den jeweiligen Ordnern."""
import base64, glob, os
root = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
b64 = lambda p: base64.b64encode(open(p, 'rb').read()).decode()
out = ['// AUTOMATISCH ERZEUGT von tools/build_assets.py – siehe CREDITS.md', 'const ASSETS = { packs: {}, fbx: {}, font: "" };']
for pack in sorted(os.listdir(os.path.join(root, 'assets/packs'))):
    d = os.path.join(root, 'assets/packs', pack)
    glbs = sorted(glob.glob(d + '/*.glb'))
    if glbs:
        out.append('ASSETS.packs[%r] = { tex: %r, models: {} };' % (pack, b64(d + '/colormap.png')))
        for f in glbs:
            out.append('ASSETS.packs[%r].models[%r] = %r;' % (pack, os.path.basename(f)[:-4], b64(f)))
    for f in sorted(glob.glob(d + '/*.fbx')):
        out.append('ASSETS.fbx[%r] = %r;' % (os.path.basename(f)[:-4], b64(f)))
out.append('ASSETS.font = %r;' % b64(os.path.join(root, 'assets/fonts/lilita_one_regular.ttf')))
open(os.path.join(root, 'src/assets.js'), 'w').write('\n'.join(out) + '\n')
print('src/assets.js: %.1f MB' % (os.path.getsize(os.path.join(root, 'src/assets.js')) / 1e6))
