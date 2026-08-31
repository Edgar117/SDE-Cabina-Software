# -*- coding: utf-8 -*-
"""
Adornos SVG de la PANTALLA (no de la tira impresa).
Salida: public/deco/<variante>-*.svg -> se usan desde styles.css.

Cada variante define sus 4 paletas de flor + colores de follaje + metal.
La composición (racimos de esquina y guirnalda) es la misma para todas,
así que agregar una variante es solo agregar una entrada en VARIANTES.

Uso:  python tools/generar_deco_pantalla.py
"""
import os, math, random

OUT = os.path.normpath(
    os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "public", "deco")
)
os.makedirs(OUT, exist_ok=True)

PETALO = "M0,0 C-0.58,-0.30 -0.66,-1.02 0,-1.28 C0.66,-1.02 0.58,-0.30 0,0 Z"

# Cada paleta: (claro, medio, oscuro, corazón). Los roles son:
#   p1 flor principal · p2 secundaria · p3 acento · p4 acento fuerte
VARIANTES = {
    # Boda Premium (blush + crema, la original)
    "boda": dict(
        paletas={
            "p1": ("#FFFFFF", "#F6F0E9", "#E2D6C9", "#C9B9A8"),
            "p2": ("#FFF9EE", "#F7E9D2", "#E6D2B2", "#CBB491"),
            "p3": ("#FBD9DE", "#F2AFBA", "#DE8797", "#B96479"),
            "p4": ("#F9C4CD", "#EB98A6", "#D0748A", "#A9566D"),
        },
        hojas=["#7E9B76", "#94AF8B", "#5F7C59", "#6E8F68"],
        hoja_grad=("#9CB894", "#5F7C59"), vena="#4E6A49",
        metal="#C9A227", gyp="#FFFDF8",
    ),
    # Boda Jardín: blanco y muchísimo verde
    "boda-jardin": dict(
        paletas={
            "p1": ("#FFFFFF", "#F4F7F2", "#DDE6D8", "#C2CFBC"),
            "p2": ("#FFFDF6", "#F3F0E2", "#DCD8C2", "#BFBAA0"),
            "p3": ("#F7FBF4", "#E4EFDE", "#C7D9C0", "#A6BC9E"),
            "p4": ("#FDF6E4", "#F0E2BC", "#D8C695", "#B5A272"),
        },
        hojas=["#5E8A57", "#7FA877", "#416B3E", "#6B9663"],
        hoja_grad=("#8CB683", "#3F6A3C"), vena="#33562F",
        metal="#B08F2C", gyp="#FFFFFF",
    ),
    # Boda Borgoña: vino profundo + oro
    "boda-borgona": dict(
        paletas={
            "p1": ("#B8324C", "#8E1E38", "#6B1028", "#48091A"),
            "p2": ("#D9556C", "#B23350", "#84203A", "#5A1226"),
            "p3": ("#F6D9D2", "#E8B6AC", "#CE9084", "#A96C60"),
            "p4": ("#FBEAD2", "#EFD3A4", "#D6B575", "#B29352"),
        },
        hojas=["#3F5F42", "#557A56", "#2C4630", "#496B4B"],
        hoja_grad=("#5E8560", "#2A4530"), vena="#1F3524",
        metal="#D4AF37", gyp="#FFF6EA",
    ),
    # XV Lila: lavanda y plata
    "xv-lila": dict(
        paletas={
            "p1": ("#FFFFFF", "#F6F2FA", "#E2DAEE", "#C7BBDC"),
            "p2": ("#EFE2FA", "#D8C2F0", "#B99CDD", "#9678C0"),
            "p3": ("#F9E8F4", "#EDC9E4", "#D3A4C9", "#B080A8"),
            "p4": ("#E6DDF7", "#C9B8EA", "#A793D2", "#8570B4"),
        },
        hojas=["#8AA294", "#A2B7A9", "#6C8579", "#93A99B"],
        hoja_grad=("#A9BEB0", "#6C8579"), vena="#5A7166",
        metal="#B9C3CE", gyp="#FFFFFF",
    ),
}

# Variante tropical: usa composición propia (hojas de palma + hibisco)
TROPICAL = dict(
    paletas={
        "p1": ("#FF8A5B", "#F2603A", "#C93F24", "#952A16"),
        "p2": ("#FFD166", "#F5B73C", "#D9941E", "#A66E12"),
        "p3": ("#FF6FA5", "#EE4785", "#C62E66", "#941D49"),
        "p4": ("#FFF2D8", "#FFE0AE", "#EDC583", "#C9A25E"),
    },
    hojas=["#1F8A70", "#2FA98A", "#146B55", "#3CBF9E"],
    hoja_grad=("#3CBF9E", "#0F5C48"), vena="#0B4437",
    metal="#F5B73C", gyp="#FFF6DC",
)


# ── primitivas ───────────────────────────────────────────────────────
def wrap(defs, body, w, h):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" '
            f'viewBox="0 0 {w} {h}">\n<defs>{defs}</defs>\n{body}\n</svg>\n')


def defs_de(v, uid):
    out = []
    for name, (c1, c2, c3, c4) in v["paletas"].items():
        for i, (a, b) in enumerate([(c1, c2), (c2, c3), (c3, c4)]):
            out.append(f'<radialGradient id="{uid}{name}{i}" cx="50%" cy="78%" r="78%">'
                       f'<stop offset="0%" stop-color="{a}"/>'
                       f'<stop offset="100%" stop-color="{b}"/></radialGradient>')
    g1, g2 = v["hoja_grad"]
    out.append(f'<linearGradient id="{uid}hoja" x1="0" y1="0" x2="1" y2="1">'
               f'<stop offset="0%" stop-color="{g1}"/>'
               f'<stop offset="100%" stop-color="{g2}"/></linearGradient>')
    return "".join(out)


def rosa(v, uid, x, y, s, name, seed=0, rot=0):
    rnd = random.Random(seed)
    g = [f'<g transform="translate({x:.1f},{y:.1f}) rotate({rot}) scale({s:.2f})">',
         '<ellipse cx="0" cy="2" rx="15" ry="13" fill="#5A4636" opacity="0.12"/>']
    for n, radio, offset, capa in [(7, 15.5, 0, 0), (6, 10.5, 26, 1), (5, 6.4, 52, 2)]:
        for i in range(n):
            a = offset + i * (360 / n) + rnd.uniform(-4, 4)
            r = radio * rnd.uniform(0.93, 1.07)
            g.append(f'<path d="{PETALO}" transform="rotate({a:.0f}) scale({r:.1f})" '
                     f'fill="url(#{uid}{name}{capa})" stroke="rgba(70,50,40,0.10)" stroke-width="0.06"/>')
    c1, c2, c3, c4 = v["paletas"][name]
    g.append(f'<circle r="3.6" fill="{c3}"/>')
    g.append(f'<path d="M0,2.6 C2.6,-1 3.6,-3.6 0,-5.2 C-3.6,-3.6 -2.6,-1 0,2.6Z" fill="{c4}" opacity="0.85"/>')
    g.append(f'<path d="M-4,-6 C-1,-9 2,-9 5,-6" fill="none" stroke="#FFFFFF" stroke-width="0.9" opacity="0.32"/>')
    g.append("</g>")
    return "".join(g)


def capullo(v, uid, x, y, s, name, rot=0):
    c1, c2, c3, c4 = v["paletas"][name]
    return (f'<g transform="translate({x:.0f},{y:.0f}) rotate({rot}) scale({s:.2f})">'
            f'<path d="M0,10 C-7,4 -7,-8 0,-12 C7,-8 7,4 0,10Z" fill="url(#{uid}{name}0)"/>'
            f'<path d="M0,9 C-3,3 -3,-7 0,-11" fill="none" stroke="{c3}" stroke-width="1.1" opacity="0.7"/>'
            f'<path d="M-5,9 C-2,14 2,14 5,9 L0,13Z" fill="{v["hojas"][0]}"/></g>')


def hoja(v, uid, x, y, s, rot=0, color=None):
    fill = color or f"url(#{uid}hoja)"
    return (f'<g transform="translate({x:.0f},{y:.0f}) rotate({rot}) scale({s:.2f})">'
            f'<path d="M0,0 C9,-11 22,-8 24,4 C16,14 4,11 0,0Z" fill="{fill}"/>'
            f'<path d="M1,1 C9,0 17,3 23,4" fill="none" stroke="{v["vena"]}" '
            f'stroke-width="0.8" opacity="0.45"/></g>')


def rama(v, uid, x, y, s, rot, largo=7, color=None):
    fill = color or f"url(#{uid}hoja)"
    out = [f'<g transform="translate({x:.0f},{y:.0f}) rotate({rot}) scale({s:.2f})">',
           f'<path d="M0,0 C{largo*6},-4 {largo*10},-8 {largo*15},-14" fill="none" '
           f'stroke="{v["hojas"][0]}" stroke-width="2" opacity="0.8"/>']
    for i in range(largo):
        px, py, rr = 15 * (i + 1) - 8, -1.2 * i, 8.5 - i * 0.55
        out.append(f'<ellipse cx="{px:.0f}" cy="{py-8:.0f}" rx="{rr:.1f}" ry="{rr*0.82:.1f}" fill="{fill}" opacity="0.92"/>')
        out.append(f'<ellipse cx="{px:.0f}" cy="{py+8:.0f}" rx="{rr:.1f}" ry="{rr*0.82:.1f}" fill="{fill}" opacity="0.78"/>')
    out.append("</g>")
    return "".join(out)


def palma(v, uid, x, y, s, rot=0, folios=10):
    """Fronda de palma: nervadura con folíolos anchos y solapados.
    Con folíolos delgados parecía rama de pino, por eso van pocos y gordos."""
    out = [f'<g transform="translate({x:.0f},{y:.0f}) rotate({rot}) scale({s:.2f})">',
           f'<path d="M0,0 C40,-10 90,-22 140,-40" fill="none" stroke="{v["hojas"][2]}" stroke-width="3.5"/>']
    for i in range(folios):
        t = (i + 1) / folios
        px = 140 * t
        py = -40 * t * t - 2
        L = 62 * math.sin(math.pi * min(t * 1.12, 1)) + 10
        for sgn in (-1, 1):
            out.append(f'<path d="M{px:.0f},{py:.0f} '
                       f'q{L*0.62:.0f},{sgn*L*0.20:.0f} {L*0.86:.0f},{sgn*L*0.82:.0f} '
                       f'q{-L*0.24:.0f},{-sgn*L*0.62:.0f} {-L*0.86:.0f},{-sgn*L*0.82:.0f}Z" '
                       f'fill="url(#{uid}hoja)" opacity="0.92"/>')
    out.append("</g>")
    return "".join(out)


def monstera(v, uid, x, y, s, rot=0):
    return (f'<g transform="translate({x:.0f},{y:.0f}) rotate({rot}) scale({s:.2f})">'
            f'<path d="M0,0 C-42,-16 -46,-70 0,-92 C46,-70 42,-16 0,0Z" fill="url(#{uid}hoja)"/>'
            f'<g fill="{v["hojas"][2]}" opacity="0.55">'
            f'<path d="M-4,-14 L-30,-26 L-4,-30Z"/><path d="M4,-14 L30,-26 L4,-30Z"/>'
            f'<path d="M-4,-40 L-34,-50 L-4,-54Z"/><path d="M4,-40 L34,-50 L4,-54Z"/>'
            f'<path d="M-3,-64 L-26,-70 L-3,-74Z"/><path d="M3,-64 L26,-70 L3,-74Z"/></g>'
            f'<path d="M0,-2 L0,-88" stroke="{v["vena"]}" stroke-width="1.6" opacity="0.5"/></g>')


def nube(v, seed, cx, cy, n, spread):
    rnd = random.Random(seed)
    out = []
    for _ in range(n):
        a, d = rnd.uniform(0, math.tau), rnd.uniform(0, spread)
        x, y = cx + math.cos(a) * d, cy + math.sin(a) * d * 0.75
        out.append(f'<circle cx="{x:.0f}" cy="{y:.0f}" r="{rnd.uniform(1.6,3.4):.1f}" '
                   f'fill="{v["gyp"]}" opacity="{rnd.uniform(0.55,0.95):.2f}"/>')
    return "".join(out)


def destellos(v, seed, n, w, h):
    rnd = random.Random(seed)
    return "".join(
        f'<circle cx="{rnd.uniform(0,w):.0f}" cy="{rnd.uniform(0,h):.0f}" '
        f'r="{rnd.uniform(1.1,3.0):.1f}" fill="{v["metal"]}" opacity="{rnd.uniform(0.25,0.65):.2f}"/>'
        for _ in range(n))


# ── composiciones florales ───────────────────────────────────────────
def cluster_top(v, w=460, h=400, flip=False):
    u = "a"
    g = [rama(v, u, -20, 34, 1.5, 22, 8), rama(v, u, 6, 6, 1.35, 55, 7),
         rama(v, u, 78, -18, 1.35, 80, 6), rama(v, u, 176, -20, 1.15, 100, 6),
         hoja(v, u, 150, 150, 2.2, 45), hoja(v, u, 66, 214, 2.0, 100),
         hoja(v, u, 232, 84, 1.8, 12), hoja(v, u, 22, 128, 1.9, 150),
         nube(v, 5, 196, 176, 26, 48), nube(v, 6, 40, 236, 18, 36),
         rosa(v, u, 92, 108, 2.6, "p1", 1, -12),
         rosa(v, u, 176, 66, 2.1, "p3", 2, 20),
         rosa(v, u, 48, 190, 1.9, "p2", 3, 8),
         rosa(v, u, 138, 196, 1.6, "p4", 4, -25),
         rosa(v, u, 226, 148, 1.45, "p1", 5, 15),
         capullo(v, u, 20, 58, 1.5, "p3", -30),
         capullo(v, u, 252, 40, 1.3, "p2", 40),
         capullo(v, u, 100, 262, 1.3, "p4", 200),
         f'<g>{destellos(v, 9, 24, w, h)}</g>']
    body = "".join(g)
    if flip:
        body = f'<g transform="translate({w},0) scale(-1,1)">{body}</g>'
    return wrap(defs_de(v, u), body, w, h)


def cluster_bottom(v, w=420, h=340, flip=False):
    u = "b"
    g = [f'<g transform="translate(0,{h}) scale(1,-1)">',
         rama(v, u, -16, 26, 1.4, 20, 7), rama(v, u, 34, 0, 1.25, 58, 6),
         rama(v, u, 132, -12, 1.1, 86, 6), "</g>",
         hoja(v, u, 110, 214, 2.1, 215), hoja(v, u, 34, 258, 1.9, 300),
         hoja(v, u, 186, 262, 1.7, 250),
         nube(v, 15, 150, 236, 22, 42),
         rosa(v, u, 74, 240, 2.4, "p1", 11, 14),
         rosa(v, u, 152, 282, 2.0, "p3", 12, -18),
         rosa(v, u, 26, 296, 1.7, "p2", 13, 30),
         rosa(v, u, 112, 190, 1.4, "p4", 14, -6),
         capullo(v, u, 200, 224, 1.3, "p3", 150),
         f'<g>{destellos(v, 19, 16, w, h)}</g>']
    body = "".join(g)
    if flip:
        body = f'<g transform="translate({w},0) scale(-1,1)">{body}</g>'
    return wrap(defs_de(v, u), body, w, h)


def garland(v, w=1600, h=170):
    """Guirnalda superior CON HUECO AL CENTRO para el título."""
    u = "c"
    rnd = random.Random(77)
    g = []
    for x0, x1, curva in ((0, w * 0.34, 1), (w * 0.66, w, -1)):
        span = x1 - x0
        g.append(f'<path d="M{x0:.0f},{40 if curva>0 else 78} '
                 f'C{x0+span*0.35:.0f},{92 if curva>0 else 30} '
                 f'{x0+span*0.65:.0f},{34 if curva>0 else 96} '
                 f'{x1:.0f},{80 if curva>0 else 42}" fill="none" '
                 f'stroke="{v["hojas"][0]}" stroke-width="2.6" opacity="0.6"/>')
        for i in range(16):
            t = (i + 0.5) / 16
            x = x0 + span * t
            y = (40 + 40 * math.sin(t * math.pi * 1.6)) if curva > 0 else (78 - 34 * math.sin(t * math.pi * 1.6))
            g.append(hoja(v, u, x, y, rnd.uniform(1.3, 2.1), rnd.uniform(0, 360), rnd.choice(v["hojas"])))
        for k, t in enumerate((0.16, 0.44, 0.74)):
            x = x0 + span * t
            y = (52 + 30 * math.sin(t * math.pi * 1.6)) if curva > 0 else (72 - 26 * math.sin(t * math.pi * 1.6))
            g.append(rosa(v, u, x, y, 1.6, ["p1", "p3", "p2"][k], 100 + k, rnd.uniform(-25, 25)))
        g.append(nube(v, 200 + int(x0), x0 + span * 0.6, 62, 16, 40))
    return wrap(defs_de(v, u), "".join(g), w, h)


# ── composiciones tropicales ─────────────────────────────────────────
def trop_top(v, w=460, h=400, flip=False):
    u = "a"
    g = [palma(v, u, -30, 40, 1.5, 18), palma(v, u, -10, -10, 1.25, 52),
         palma(v, u, 90, -40, 1.1, 74),
         monstera(v, u, 130, 250, 1.5, 18), monstera(v, u, 36, 300, 1.15, -16),
         rosa(v, u, 208, 118, 2.4, "p1", 1, -10),
         rosa(v, u, 120, 176, 1.9, "p3", 2, 22),
         rosa(v, u, 250, 214, 1.5, "p2", 3, 6),
         capullo(v, u, 62, 172, 1.5, "p2", -30),
         f'<g>{destellos(v, 9, 20, w, h)}</g>']
    body = "".join(g)
    if flip:
        body = f'<g transform="translate({w},0) scale(-1,1)">{body}</g>'
    return wrap(defs_de(v, u), body, w, h)


def trop_bottom(v, w=420, h=340, flip=False):
    u = "b"
    g = [f'<g transform="translate(0,{h}) scale(1,-1)">',
         palma(v, u, -24, 30, 1.3, 16), palma(v, u, 40, -6, 1.05, 50), "</g>",
         monstera(v, u, 96, 320, 1.35, 14), monstera(v, u, 210, 336, 1.0, -22),
         rosa(v, u, 60, 254, 2.2, "p3", 11, 12),
         rosa(v, u, 148, 292, 1.7, "p1", 12, -16),
         capullo(v, u, 214, 250, 1.3, "p2", 150),
         f'<g>{destellos(v, 19, 14, w, h)}</g>']
    body = "".join(g)
    if flip:
        body = f'<g transform="translate({w},0) scale(-1,1)">{body}</g>'
    return wrap(defs_de(v, u), body, w, h)


def trop_garland(v, w=1600, h=170):
    u = "c"
    rnd = random.Random(31)
    g = []
    for x0, x1, sgn in ((0, w * 0.34, 1), (w * 0.66, w, -1)):
        span = x1 - x0
        for i in range(5):
            t = (i + 0.5) / 5
            g.append(palma(v, u, x0 + span * t, 20 + 18 * (i % 2), 0.62,
                           (150 if sgn < 0 else 30) + rnd.uniform(-18, 18)))
        for k, t in enumerate((0.22, 0.62)):
            g.append(rosa(v, u, x0 + span * t, 74, 1.5, ["p1", "p3"][k], 40 + k,
                          rnd.uniform(-20, 20)))
    return wrap(defs_de(v, u), "".join(g), w, h)


# ── generación ───────────────────────────────────────────────────────
def archivos_de(prefix, v, comp):
    top, bottom, gar = comp
    return {
        f"{prefix}-top-left.svg": top(v),
        f"{prefix}-top-right.svg": top(v, flip=True),
        f"{prefix}-bottom-left.svg": bottom(v),
        f"{prefix}-bottom-right.svg": bottom(v, flip=True),
        f"{prefix}-garland.svg": gar(v),
    }


if __name__ == "__main__":
    FLOR = (cluster_top, cluster_bottom, garland)
    TROP = (trop_top, trop_bottom, trop_garland)
    todo = {}
    for prefix, v in VARIANTES.items():
        todo.update(archivos_de(prefix, v, FLOR))
    todo.update(archivos_de("tropical", TROPICAL, TROP))

    total = 0
    for name, svg in sorted(todo.items()):
        with open(os.path.join(OUT, name), "w", encoding="utf-8") as f:
            f.write(svg)
        total += len(svg)
        print("OK", "public/deco/" + name, f"({len(svg)//1024} KB)")
    print(f"\n{len(todo)} archivos, {total//1024} KB en total")
