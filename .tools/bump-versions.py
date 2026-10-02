#!/usr/bin/env python3
"""Stamp the stylesheet, scripts and hero image in index.html with a hash of their contents (?v=...).

Why: browsers cache these files for several minutes. Without a stamp, a visitor can end up with the new
index.html next to an OLD styles.css / script.js, which breaks the page. With a stamp, a changed file always
has a new URL, so the page and its files always match.

Run after changing styles.css, script.js, logo.js or any stamped image:   python3 .tools/bump-versions.py
"""
import hashlib, re, pathlib
root = pathlib.Path(__file__).resolve().parent.parent
files = ['styles.css', 'script.js', 'why.js', 'logo.js', 'assets/logo-base.webp', 'assets/platform-skull.webp', 'assets/platform-surgery.webp', 'assets/platform-splint.webp', 'assets/founder.webp']
html = (root / 'index.html').read_text()
for f in files:
    v = hashlib.sha1((root / f).read_bytes()).hexdigest()[:8]
    html, n = re.subn(r'(["\'])' + re.escape(f) + r'(?:\?v=[0-9a-f]+)?\1', lambda m: m.group(1) + f + '?v=' + v + m.group(1), html)
    print(f'{f:24s} v={v}  ({n} reference{"s" if n != 1 else ""})')
(root / 'index.html').write_text(html)
