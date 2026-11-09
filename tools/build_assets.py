#!/usr/bin/env python3
"""Bettet die Kenney-Modelle als Base64 in src/assets.js ein, damit das Spiel auch per Doppelklick (file://) läuft."""
import base64, glob, os
root = os.path.join(os.path.dirname(__file__), '..')
out = ['// AUTOMATISCH ERZEUGT von tools/build_assets.py – Kenney-Assets (CC0/MIT), siehe CREDITS.md', 'const ASSETS = { glb: {}, png: {}, font: "" };']
for f in sorted(glob.glob(os.path.join(root, 'assets/kenney/*.glb'))):
    out.append('ASSETS.glb[%r] = %r;' % (os.path.basename(f)[:-4], base64.b64encode(open(f, 'rb').read()).decode()))
for f in sorted(glob.glob(os.path.join(root, 'assets/kenney/*.png'))):
    out.append('ASSETS.png[%r] = %r;' % (os.path.basename(f)[:-4], base64.b64encode(open(f, 'rb').read()).decode()))
out.append('ASSETS.font = %r;' % base64.b64encode(open(os.path.join(root, 'assets/kenney/lilita_one_regular.ttf'), 'rb').read()).decode())
open(os.path.join(root, 'src/assets.js'), 'w').write('\n'.join(out) + '\n')
