#!/usr/bin/env python3
"""Regenerate the EN design files from the ES ones using en.json.
Run from the design dir:  python3 -I i18n/make_en.py
Translates only visible text nodes and alt/aria-label/title/placeholder attributes."""
import json, re, sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
MAP = json.loads((HERE / "en.json").read_text(encoding="utf-8"))
FILES = [("landing-v2.html", "landing-v2-en.html"),
         ("landing-v2-mobile.html", "landing-v2-mobile-en.html"),
         ("extras.html", "extras-en.html")]
ATTRS = ("alt", "aria-label", "title", "placeholder")
TOKEN = re.compile(r'<(style|script)\b[^>]*>.*?</\1>|<!--.*?-->|<[^>]+>|[^<]+', re.S)
unmapped = {}

def tr_text(t, fname):
    core = t.strip()
    if not core:
        return t
    if core in MAP:
        return t.replace(core, MAP[core])
    if re.search(r"[A-Za-zÁÉÍÓÚáéíóúñÑ]{2}", core):
        unmapped.setdefault(fname, set()).add(core)
    return t

def tr_tag(tag, fname):
    for a in ATTRS:
        def rep(m):
            v = m.group(2)
            if v.strip() and not v.startswith("data:") and v.strip() in MAP:
                v = v.replace(v.strip(), MAP[v.strip()])
            return m.group(1) + v + '"'
        tag = re.sub(r'(\b' + a + r'=")([^"]*)"', rep, tag)
    return tag

def convert(src, fname):
    out = []
    for m in TOKEN.finditer(src):
        t = m.group(0)
        if t.startswith("<"):
            if not (t.startswith("<!--") or t.startswith("<style") or t.startswith("<script")):
                t = tr_tag(t, fname)
        else:
            t = tr_text(t, fname)
        out.append(t)
    s = "".join(out)
    s = s.replace('<html lang="es">', '<html lang="en">')
    # language toggles: make EN the active one
    s = s.replace('<span class="on">ES</span><i>/</i><span>EN</span>',
                  '<span>ES</span><i>/</i><span class="on">EN</span>')
    s = s.replace('<span class="on">ES</span><span>/</span><span>EN</span>',
                  '<span>ES</span><span>/</span><span class="on">EN</span>')
    s = s.replace('<b>ES</b> / EN', 'ES / <b>EN</b>')
    return s

for src, dst in FILES:
    text = (ROOT / src).read_text(encoding="utf-8")
    (ROOT / dst).write_text(convert(text, src), encoding="utf-8")
    print("wrote", dst)
for f, items in unmapped.items():
    print("UNMAPPED in", f)
    for i in sorted(items):
        print("   ", i[:100])
