"""Genera el tablero de wordmarks KL0REN / Archivo 01 a partir de los símbolos de build_board."""
from pathlib import Path

from build_board import CREAM, INK, LIME, onda, tunel


def stripes_ellipse(w=90, h=130, color=CREAM, bars=7):
    """Un '0' hecho de franjas verticales que se angostan hacia los bordes (ref. 31)."""
    out, x = "", 0.0
    widths = [1, 1.6, 2.4, 3.2, 2.4, 1.6, 1][:bars]
    unit = w / (sum(widths) + (bars - 1) * 0.6)
    for i, k in enumerate(widths):
        bw = unit * k
        bh = h * (0.45 + 0.55 * (1 - abs(i - (bars - 1) / 2) / ((bars - 1) / 2)))
        out += f'<rect x="{x:.1f}" y="{(h-bh)/2:.1f}" width="{bw:.1f}" height="{bh:.1f}" rx="{bw/2:.1f}" fill="{color}"/>'
        x += bw + unit * 0.6
    return f'<svg width="{w}" height="{h}" viewBox="0 0 {w} {h}">{out}</svg>'


def orbit(w=760, h=210, color=CREAM):
    """Elipse que abraza la palabra y la cruza (ref. Cometta / Studio Rocket)."""
    return (f'<svg class="orbit" width="{w}" height="{h}" viewBox="0 0 {w} {h}">'
            f'<ellipse cx="{w/2}" cy="{h/2}" rx="{w/2-3}" ry="{h/2-3}" fill="none" stroke="{color}" stroke-width="3"/>'
            f'<ellipse cx="{w/2}" cy="{h/2}" rx="{w/2-30}" ry="{h/2-26}" fill="none" stroke="{color}" stroke-width="1.5"/></svg>')


def stripes_over(n=6, color=INK, top=52, gap=9, thick=3):
    """Franjas del color de fondo sobre la mitad inferior de la palabra (ref. NOVA)."""
    return "".join(f'<i style="top:{top + i*gap}%;height:{thick + i*0.8:.1f}px;background:{color}"></i>' for i in range(n))


CARDS = [
    ("W1", "Órbita", "Serif editorial + una elipse que abraza el nombre. El 0 es la onda. Periodismo con oficio.",
     INK, f'''<div class="w1">{orbit()}<span>KL</span>{onda(size=118, rings=4, gap=4)}<span>REN</span></div>'''),
    ("W2", "Señal", "Grotesca pesada rebanada en franjas, como una transmisión que se corta. El 0 se abre al centro.",
     LIME, f'''<div class="w2"><span>KL</span>{onda(size=150, color=INK, rings=4, gap=5)}<span>REN</span>{stripes_over(color=LIME)}</div>'''),
    ("W3", "Blando", "Minúsculas redondas, cercanas y un poco Y2K. El 0 es el túnel: la gota que cae.",
     CREAM, f'''<div class="w3"><span>kl</span>{tunel(size=118, a=INK, b=CREAM)}<span>ren</span></div>'''),
    ("W4", "Condensada", "Sans alta y apretada, tipo afiche. El 0 son franjas que se angostan: un sonido visto de frente.",
     INK, f'''<div class="w4"><span>KL</span>{stripes_ellipse(color=LIME)}<span>REN</span></div>'''),
]

ARCHIVO = f'''
<div class="arch" style="background:{INK}">
  <div class="seal">{orbit(w=420, h=420)}<div class="in"><span class="mono s1">FOTOGRAFÍA · TEMUCO</span><span class="a1">Archivo</span><span class="a2">{tunel(size=96, a=CREAM, b=INK)}<b>1</b></span></div></div>
  <span class="lbl mono">Archivo 01 · sello</span>
</div>
<div class="arch" style="background:{CREAM};color:{INK}">
  <div class="line"><span>ARCHIVO</span>{onda(size=110, color=INK, rings=4, gap=4)}<span>1</span></div>
  <span class="lbl mono">Archivo 01 · horizontal</span>
</div>'''


def card(code, name, desc, bg, art):
    fg = INK if bg in (LIME, CREAM) else CREAM
    return f'''<div class="card"><div class="art" style="background:{bg};color:{fg}">{art}</div>
<div class="meta"><span class="code">{code}</span><div><h3>{name}</h3><p>{desc}</p></div></div></div>'''


html = f'''<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Wordmarks</title><style>
*{{box-sizing:border-box;margin:0;padding:0}}
body{{width:1440px;background:#0E0E0E;color:{CREAM};font-family:"Space Grotesk",sans-serif;padding:72px 64px 80px}}
.mono{{font-family:"Space Mono",monospace}}
header{{display:flex;justify-content:space-between;align-items:flex-end;border-bottom:1px solid #2E2E2E;padding-bottom:32px}}
header h1{{font-family:"Dela Gothic One";font-size:72px;line-height:.95;text-transform:uppercase}}
header p{{max-width:460px;color:#A3A3A3;font-size:16px;line-height:1.5}}
.grid{{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:40px}}
.card{{border:1px solid #2E2E2E;border-radius:20px;overflow:hidden;background:#161616}}
.art{{height:380px;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden}}
.meta{{display:flex;gap:18px;padding:22px 26px}}
.code{{width:44px;height:40px;flex:none;border-radius:10px;background:{LIME};color:{INK};font-weight:700;display:flex;align-items:center;justify-content:center;font-size:16px}}
.meta h3{{font-size:22px;margin-bottom:6px}}
.meta p{{font-size:14px;line-height:1.5;color:#A3A3A3}}

.w1{{position:relative;display:flex;align-items:center;font-family:"Instrument Serif",serif;font-size:150px;line-height:1;letter-spacing:-2px}}
.w1 .orbit{{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%) rotate(-8deg)}}
.w1 svg:not(.orbit){{margin:0 4px}}

.w2{{position:relative;display:flex;align-items:center;font-family:"Archivo Black",sans-serif;font-size:150px;line-height:1;letter-spacing:-6px;color:{INK}}}
.w2 svg{{margin:0 6px}}
.w2 i{{position:absolute;left:-10px;right:-10px;display:block}}

.w3{{display:flex;align-items:center;font-family:"Unbounded",sans-serif;font-weight:600;font-size:140px;line-height:1;letter-spacing:-6px;color:{INK}}}
.w3 svg{{margin:0 2px;transform:translateY(16px)}}

.w4{{display:flex;align-items:center;gap:6px;font-family:"Anton",sans-serif;font-size:190px;line-height:1;letter-spacing:2px;color:{CREAM}}}
.w4 svg{{margin:0 8px}}

h2{{font-size:13px;letter-spacing:2px;text-transform:uppercase;color:{LIME};margin:64px 0 20px}}
.archs{{display:grid;grid-template-columns:1fr 1fr;gap:24px}}
.arch{{height:520px;border:1px solid #2E2E2E;border-radius:20px;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden}}
.arch .lbl{{position:absolute;left:20px;bottom:16px;font-size:12px;opacity:.6}}
.seal{{position:relative;width:420px;height:420px;display:flex;align-items:center;justify-content:center}}
.seal .orbit{{position:absolute;left:0;top:0}}
.seal .in{{display:flex;flex-direction:column;align-items:center;gap:6px}}
.seal .s1{{font-size:12px;letter-spacing:3px;opacity:.75}}
.seal .a1{{font-family:"Instrument Serif",serif;font-size:72px;line-height:1}}
.seal .a2{{display:flex;align-items:center;gap:4px}}
.seal .a2 b{{font-family:"Instrument Serif",serif;font-weight:400;font-size:110px;line-height:1}}
.line{{display:flex;align-items:center;gap:8px;font-family:"Archivo Black",sans-serif;font-size:84px;letter-spacing:-3px}}
</style></head><body>
<header><h1>KL0REN<br>Wordmarks</h1><p class="mono">A partir del moodboard de logotypes: la palabra queda limpia y solo el “0” se interviene con el símbolo. Elipse (Cometta), franjas (NOVA), letra intervenida (AURORA), condensada (mono).</p></header>
<div class="grid">{"".join(card(*c) for c in CARDS)}</div>
<h2 class="mono">Archivo 01 · mismo sistema</h2>
<div class="archs">{ARCHIVO}</div>
</body></html>'''

Path(__file__).with_name("wordmarks.html").write_text(html)
print("ok", len(html))
