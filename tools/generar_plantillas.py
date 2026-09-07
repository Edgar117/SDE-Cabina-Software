# -*- coding: utf-8 -*-
"""
Generador de plantillas para SDE Cabina.
Cada plantilla produce en public/templates/<id>/:
  background.svg  -> fondo completo 600x1800
  overlay.svg     -> adornos que van ENCIMA de las fotos
  preview.svg     -> miniatura (fondo + cajas grises + adornos)
  template.json   -> definicion que lee el renderer

Uso:  python tools/generar_plantillas.py

OJO: las plantillas de Halloween, Navidad, Fiesta Neon y graduacion_002
viven en tools/generar_plantillas_extra.mjs (Node), porque la maquina de la
cabina no tiene Python. Este script conserva las demas y respeta el catalogo.
"""
import json, os, random, math

W, H = 600, 1800
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "public", "templates")
ROOT = os.path.normpath(ROOT)


def wrap(body, w=W, h=H):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" '
            f'viewBox="0 0 {W} {H}">\n{body}\n</svg>\n')


# ---------------------------------------------------------------- utilidades
def sparkles(p, seed, colors, count=180, rmin=0.8, rmax=3.2, ymin=0, ymax=H,
             opacity=(0.25, 0.9)):
    rnd = random.Random(seed)
    out = []
    for _ in range(count):
        x = rnd.uniform(0, W)
        y = rnd.uniform(ymin, ymax)
        r = rnd.uniform(rmin, rmax)
        c = rnd.choice(colors)
        o = rnd.uniform(*opacity)
        out.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{r:.2f}" fill="{c}" opacity="{o:.2f}"/>')
    return '<g>' + ''.join(out) + '</g>'


def stars4(p, seed, color, count=40, ymin=0, ymax=H, smin=3, smax=9, opacity=0.9):
    """Estrellas de 4 puntas tipo destello."""
    rnd = random.Random(seed)
    out = []
    for _ in range(count):
        x = rnd.uniform(0, W); y = rnd.uniform(ymin, ymax)
        s = rnd.uniform(smin, smax); o = rnd.uniform(opacity * 0.45, opacity)
        d = (f'M0,{-s} C{s*0.18:.1f},{-s*0.22:.1f} {s*0.22:.1f},{-s*0.18:.1f} {s},0 '
             f'C{s*0.22:.1f},{s*0.18:.1f} {s*0.18:.1f},{s*0.22:.1f} 0,{s} '
             f'C{-s*0.18:.1f},{s*0.22:.1f} {-s*0.22:.1f},{s*0.18:.1f} {-s},0 '
             f'C{-s*0.22:.1f},{-s*0.18:.1f} {-s*0.18:.1f},{-s*0.22:.1f} 0,{-s}Z')
        out.append(f'<path transform="translate({x:.1f},{y:.1f})" d="{d}" fill="{color}" opacity="{o:.2f}"/>')
    return '<g>' + ''.join(out) + '</g>'


def crown(x, y, fill, stroke, scale=1.0, gem="#FFF9E6"):
    return (f'<g transform="translate({x},{y}) scale({scale})" fill="{fill}" '
            f'stroke="{stroke}" stroke-width="0.8">'
            '<path d="M-46,4 L-35,-21 L-21,-6 L0,-31 L21,-6 L35,-21 L46,4 L42,13 L-42,13Z"/>'
            f'<circle cx="-31" cy="-13" r="3.4" fill="{gem}"/>'
            f'<circle cx="0" cy="-23" r="4.4" fill="{gem}"/>'
            f'<circle cx="31" cy="-13" r="3.4" fill="{gem}"/>'
            '<rect x="-42" y="11" width="84" height="6.5" rx="2"/></g>')


def rose(x, y, s, light, mid, dark, core):
    petals_out = ''.join(
        f'<ellipse cx="0" cy="-9" rx="10" ry="14" transform="rotate({a})"/>' for a in range(0, 360, 51))
    petals_mid = ''.join(
        f'<ellipse cx="0" cy="-6" rx="7" ry="10" transform="rotate({a})"/>' for a in range(25, 360, 60))
    return (f'<g transform="translate({x},{y}) scale({s})">'
            f'<g fill="{light}" opacity="0.95">{petals_out}</g>'
            f'<g fill="{mid}">{petals_mid}</g>'
            f'<circle r="5.5" fill="{dark}"/>'
            f'<path d="M0,1 C2,-3 4,-6 0,-9 C-4,-6 -2,-3 0,1Z" fill="{core}" opacity="0.8"/></g>')


def leaf(x, y, s, fill, rot=0):
    return (f'<g transform="translate({x},{y}) rotate({rot}) scale({s})">'
            f'<path d="M0,0 C12,-8 22,0 12,18 C6,10 0,0 0,0Z" fill="{fill}"/></g>')


def eucalyptus(x, y, s, fill, rot=0, n=7):
    """Rama de eucalipto: hojas redondas a lo largo de un tallo."""
    out = [f'<path d="M0,0 C{18*n*0.25:.0f},-6 {14*n*0.55:.0f},-10 {12*n:.0f},-16" '
           f'stroke="{fill}" stroke-width="1.6" fill="none" opacity="0.8"/>']
    for i in range(n):
        px = 12 * (i + 1) - 4
        py = -2 - i * 2.2
        rr = 8 - i * 0.5
        out.append(f'<ellipse cx="{px:.0f}" cy="{py-7:.0f}" rx="{rr:.1f}" ry="{rr*0.8:.1f}" fill="{fill}" opacity="0.85"/>')
        out.append(f'<ellipse cx="{px:.0f}" cy="{py+7:.0f}" rx="{rr:.1f}" ry="{rr*0.8:.1f}" fill="{fill}" opacity="0.7"/>')
    return f'<g transform="translate({x},{y}) rotate({rot}) scale({s})">' + ''.join(out) + '</g>'


def butterfly(x, y, s, fill, body):
    return (f'<g transform="translate({x},{y}) scale({s})" fill="{fill}">'
            '<ellipse cx="-9" cy="0" rx="11" ry="15" transform="rotate(-28 -9 0)"/>'
            '<ellipse cx="9" cy="0" rx="11" ry="15" transform="rotate(28 9 0)"/>'
            f'<ellipse cx="0" cy="1" rx="2.5" ry="9" fill="{body}"/></g>')


def gold_defs(p, c1="#F7E08A", c2="#D4AF37", c3="#9C7A16"):
    return (f'<linearGradient id="{p}gold" x1="0" y1="0" x2="1" y2="1">'
            f'<stop offset="0%" stop-color="{c1}"/><stop offset="45%" stop-color="{c2}"/>'
            f'<stop offset="100%" stop-color="{c3}"/></linearGradient>')


def frame_lines(rects, stroke, width=1.5, opacity=0.5, inset=-6):
    out = []
    for (x, y, w, h) in rects:
        out.append(f'<rect x="{x+inset}" y="{y+inset}" width="{w-inset*2}" height="{h-inset*2}" '
                   f'fill="none" stroke="{stroke}" stroke-width="{width}" opacity="{opacity}"/>')
    return '<g>' + ''.join(out) + '</g>'


def photo_boxes(rects, stroke=None, sw=4):
    """Cajas grises con silueta recortada, para el preview."""
    tones = ["#E8E8E8", "#DCDCDC", "#D0D0D0"]
    out = []
    for i, (x, y, w, h) in enumerate(rects):
        cid = f"pc{i}"
        cx = x + w / 2
        out.append(f'<clipPath id="{cid}"><rect x="{x}" y="{y}" width="{w}" height="{h}"/></clipPath>')
        out.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{tones[i % 3]}"/>')
        out.append(f'<g clip-path="url(#{cid})" fill="#C4C4C4">'
                   f'<circle cx="{cx}" cy="{y+h*0.40:.0f}" r="{h*0.13:.0f}"/>'
                   f'<ellipse cx="{cx}" cy="{y+h*1.02:.0f}" rx="{h*0.27:.0f}" ry="{h*0.24:.0f}"/></g>')
        if stroke:
            out.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="none" '
                       f'stroke="{stroke}" stroke-width="{sw}"/>')
    return '<g>' + ''.join(out) + '</g>'


# ================================================================ LAYOUTS
LAY_A = [(45, 150, 510, 352), (45, 522, 510, 352), (45, 894, 510, 352)]   # cartucho abajo
LAY_B = [(36, 236, 528, 384), (36, 648, 528, 384), (36, 1060, 528, 384)]  # titulo arriba

TEMPLATES = []


def add(t):
    TEMPLATES.append(t)


# ---------------------------------------------------------------- XV 003
def _xv003_bg(p):
    return f'''
  <defs>
    <linearGradient id="{p}bg" x1="0" y1="0" x2="0.3" y2="1">
      <stop offset="0%" stop-color="#DCEBD9"/><stop offset="35%" stop-color="#C6DDC3"/>
      <stop offset="70%" stop-color="#D6E7D2"/><stop offset="100%" stop-color="#BFD8BC"/>
    </linearGradient>
    {gold_defs(p)}
  </defs>
  <rect width="{W}" height="{H}" fill="url(#{p}bg)"/>
  {sparkles(p, 3001, ["#FFFFFF", "#F2E3B0", "#E8D89A"], 320, 0.7, 3.0, 0, H, (0.2, 0.85))}
  {stars4(p, 3002, "#FFFFFF", 26, 0, H, 3, 7, 0.75)}'''


def _xv003_ov(p):
    car_x, car_y, car_w, car_h = 58, 1300, 484, 325
    return f'''
  <defs>{gold_defs(p)}</defs>
  {frame_lines(LAY_A, f"url(#{p}gold)", 1.6, 0.55, -9)}
  <g opacity="0.95">
    {eucalyptus(28, 96, 0.95, "#7FA37B", 12)}
    {eucalyptus(572, 96, 0.95, "#7FA37B", 168)}
  </g>
  <rect x="{car_x}" y="{car_y}" width="{car_w}" height="{car_h}" rx="10"
        fill="#FFFFFF" opacity="0.94" stroke="url(#{p}gold)" stroke-width="3"/>
  <rect x="{car_x+9}" y="{car_y+9}" width="{car_w-18}" height="{car_h-18}" rx="6"
        fill="none" stroke="url(#{p}gold)" stroke-width="1" opacity="0.75"/>
  {crown(300, 1368, f"url(#{p}gold)", "#9C7A16", 0.95)}
  <g stroke="url(#{p}gold)" stroke-width="1.4" opacity="0.85">
    <line x1="196" y1="1478" x2="266" y2="1478"/>
    <line x1="334" y1="1478" x2="404" y2="1478"/>
  </g>
  <circle cx="300" cy="1478" r="3.2" fill="url(#{p}gold)"/>
  <g opacity="0.97">
    {eucalyptus(18, 1712, 1.5, "#7FA37B", -10)}
    {eucalyptus(582, 1712, 1.5, "#7FA37B", 190)}
    {rose(70, 1742, 2.1, "#FFFFFF", "#F3F6F0", "#DFE8DA", "#C6D4BE")}
    {rose(126, 1700, 1.4, "#FCFEFA", "#EEF3EA", "#DAE4D4", "#BFCFB8")}
    {rose(530, 1742, 2.1, "#FFFFFF", "#F3F6F0", "#DFE8DA", "#C6D4BE")}
    {rose(474, 1700, 1.4, "#FCFEFA", "#EEF3EA", "#DAE4D4", "#BFCFB8")}
    {leaf(112, 1758, 1.5, "#8FB08A", 40)}
    {leaf(488, 1758, 1.5, "#8FB08A", 100)}
  </g>'''


add(dict(
    id="xv_003", category="xv_anos", name="XV Años — Verde Salvia y Dorado",
    description="Glitter verde salvia con marcos dorados, corona, rosas blancas y eucalipto",
    rects=LAY_A, bg=_xv003_bg, ov=_xv003_ov,
    photo=dict(radius=0, border="#C9A227", borderWidth=4),
    preview_stroke="#C9A227",
    logo=dict(x=300, y=42, width=150, height=74),
    texts=[
        dict(binding="subtitleText", text="Valeria", x=300, y=1432,
             font="'Dancing Script', cursive", size=60, color="#A8842A",
             align="center", weight="bold", maxWidth=430),
        dict(binding="eventLabel", text="QUINCEAÑERA", x=300, y=1524,
             font="'Playfair Display', Georgia, serif", size=27, color="#4F6B50",
             align="center", weight="bold", letterSpacing=7, maxWidth=430),
        dict(binding="date", x=300, y=1580,
             font="'Playfair Display', Georgia, serif", size=20, color="#7A9078", align="center", maxWidth=430),
        dict(binding="footerText", text="", x=300, y=1655,
             font="Manrope, Arial, sans-serif", size=14, color="#54704F", align="center"),
        dict(binding="footerPhone", text="", x=300, y=1692,
             font="Manrope, Arial, sans-serif", size=13, color="#54704F", align="center"),
    ],
))


# ---------------------------------------------------------------- XV 004
def _xv004_bg(p):
    return f'''
  <defs>
    <linearGradient id="{p}bg" x1="0" y1="0" x2="0.4" y2="1">
      <stop offset="0%" stop-color="#FDF3F1"/><stop offset="45%" stop-color="#F6E2E0"/>
      <stop offset="100%" stop-color="#EFD3D2"/>
    </linearGradient>
    <linearGradient id="{p}rg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#F2C9B8"/><stop offset="50%" stop-color="#C98E76"/>
      <stop offset="100%" stop-color="#9E6A54"/>
    </linearGradient>
  </defs>
  <rect width="{W}" height="{H}" fill="url(#{p}bg)"/>
  <g opacity="0.30" stroke="url(#{p}rg)" fill="none" stroke-width="1.2">
    <path d="M-20,120 C120,40 300,180 620,60"/>
    <path d="M-20,1720 C160,1640 340,1780 620,1660"/>
    <path d="M0,1290 C140,1240 260,1330 600,1268"/>
  </g>
  {sparkles(p, 4001, ["#FFFFFF", "#E7C0AC", "#D9A98F"], 210, 0.7, 2.6, 0, H, (0.18, 0.6))}
  {stars4(p, 4002, "#E3B69C", 20, 0, H, 3, 8, 0.55)}'''


def _xv004_ov(p):
    return f'''
  <defs>
    <linearGradient id="{p}rg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#F5D2C2"/><stop offset="50%" stop-color="#C98E76"/>
      <stop offset="100%" stop-color="#9E6A54"/>
    </linearGradient>
  </defs>
  {frame_lines(LAY_A, f"url(#{p}rg)", 1.2, 0.6, -8)}
  <g stroke="url(#{p}rg)" stroke-width="1.6" fill="none" opacity="0.9">
    <path d="M92,1300 L508,1300"/>
    <path d="M92,1652 L508,1652"/>
    <path d="M92,1300 L92,1332"/><path d="M508,1300 L508,1332"/>
    <path d="M92,1652 L92,1620"/><path d="M508,1652 L508,1620"/>
  </g>
  {crown(300, 1358, f"url(#{p}rg)", "#8E5C46", 0.95, "#FFF3EC")}
  <g opacity="0.97">
    {rose(58, 1450, 2.3, "#F4A7A7", "#E07E86", "#B8556A", "#8C3B52")}
    {rose(112, 1520, 1.5, "#F7BDBD", "#E793A0", "#C06B7E", "#93465F")}
    {rose(44, 1560, 1.2, "#FAD3D3", "#EFA8B2", "#CE8394", "#A15C72")}
    {rose(542, 1450, 2.3, "#F4A7A7", "#E07E86", "#B8556A", "#8C3B52")}
    {rose(488, 1520, 1.5, "#F7BDBD", "#E793A0", "#C06B7E", "#93465F")}
    {rose(556, 1560, 1.2, "#FAD3D3", "#EFA8B2", "#CE8394", "#A15C72")}
    {leaf(28, 1500, 1.6, "#A7B79A", -20)}{leaf(96, 1580, 1.6, "#A7B79A", 60)}
    {leaf(572, 1500, 1.6, "#A7B79A", 200)}{leaf(504, 1580, 1.6, "#A7B79A", 120)}
    {butterfly(120, 1700, 1.1, "#DE9E90", "#B06E5E")}
    {butterfly(480, 1700, 1.1, "#DE9E90", "#B06E5E")}
    {butterfly(300, 1738, 0.85, "#E7B3A6", "#B87F6C")}
  </g>'''


add(dict(
    id="xv_004", category="xv_anos", name="XV Años — Rosa y Oro Rosa",
    description="Rosa palo con líneas de oro rosa, corona y rosas; estilo suave y moderno",
    rects=LAY_A, bg=_xv004_bg, ov=_xv004_ov,
    photo=dict(radius=6, border="#C98E76", borderWidth=3),
    preview_stroke="#C98E76",
    logo=dict(x=300, y=40, width=150, height=72),
    texts=[
        dict(binding="subtitleText", text="Valeria", x=300, y=1425,
             font="'Dancing Script', cursive", size=62, color="#A8604F",
             align="center", weight="bold", maxWidth=380),
        dict(binding="eventLabel", text="MIS XV AÑOS", x=300, y=1512,
             font="'Playfair Display', Georgia, serif", size=26, color="#7C4A3C",
             align="center", weight="bold", letterSpacing=8, maxWidth=380),
        dict(binding="date", x=300, y=1572,
             font="'Playfair Display', Georgia, serif", size=20, color="#9E6A54", align="center", maxWidth=380),
        dict(binding="footerHashtag", text="", x=300, y=1616,
             font="Manrope, Arial, sans-serif", size=15, color="#A8604F", align="center"),
        dict(binding="footerPhone", text="", x=300, y=1700,
             font="Manrope, Arial, sans-serif", size=13, color="#A8604F", align="center"),
    ],
))


# ---------------------------------------------------------------- XV 005
def _xv005_bg(p):
    return f'''
  <defs>
    <radialGradient id="{p}bg" cx="50%" cy="28%" r="82%">
      <stop offset="0%" stop-color="#25397A"/><stop offset="55%" stop-color="#15214F"/>
      <stop offset="100%" stop-color="#0A0F2B"/>
    </radialGradient>
    <linearGradient id="{p}sv" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FFFFFF"/><stop offset="45%" stop-color="#D7DEE8"/>
      <stop offset="100%" stop-color="#93A2B8"/>
    </linearGradient>
  </defs>
  <rect width="{W}" height="{H}" fill="url(#{p}bg)"/>
  {sparkles(p, 5001, ["#FFFFFF", "#CFE0FF", "#9FB6E8"], 380, 0.6, 2.4, 0, H, (0.25, 0.95))}
  {stars4(p, 5002, "#FFFFFF", 34, 0, H, 4, 11, 0.95)}
  <g opacity="0.22" fill="none" stroke="#BFD0F0" stroke-width="1">
    <path d="M-10,1300 C140,1250 300,1330 610,1270"/>
    <path d="M-10,1345 C150,1300 320,1370 610,1315"/>
  </g>'''


def _xv005_ov(p):
    return f'''
  <defs>
    <linearGradient id="{p}sv" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FFFFFF"/><stop offset="45%" stop-color="#D7DEE8"/>
      <stop offset="100%" stop-color="#8FA0B8"/>
    </linearGradient>
  </defs>
  {frame_lines(LAY_A, f"url(#{p}sv)", 1.3, 0.65, -9)}
  {crown(300, 1352, f"url(#{p}sv)", "#7E8DA6", 1.0, "#E9F1FF")}
  <g stroke="url(#{p}sv)" stroke-width="1.3" opacity="0.9">
    <line x1="176" y1="1470" x2="262" y2="1470"/>
    <line x1="338" y1="1470" x2="424" y2="1470"/>
  </g>
  <g fill="url(#{p}sv)" opacity="0.95">
    <circle cx="300" cy="1470" r="3.4"/>
    <circle cx="284" cy="1470" r="1.8"/><circle cx="316" cy="1470" r="1.8"/>
  </g>
  {stars4(p, 5003, "#FFFFFF", 12, 1290, 1760, 4, 10, 0.9)}'''


add(dict(
    id="xv_005", category="xv_anos", name="XV Años — Azul Real y Plata",
    description="Noche azul con estrellas plateadas, corona y tipografía elegante",
    rects=LAY_A, bg=_xv005_bg, ov=_xv005_ov,
    photo=dict(radius=8, border="#C9D4E4", borderWidth=3),
    preview_stroke="#C9D4E4",
    logo=dict(x=300, y=42, width=150, height=72),
    texts=[
        dict(binding="subtitleText", text="Valeria", x=300, y=1428,
             font="'Dancing Script', cursive", size=62, color="#F2F6FF",
             align="center", weight="bold", shadow=True),
        dict(binding="eventLabel", text="MIS XV AÑOS", x=300, y=1524,
             font="'Playfair Display', Georgia, serif", size=26, color="#C6D3E8",
             align="center", weight="bold", letterSpacing=8),
        dict(binding="date", x=300, y=1584,
             font="'Playfair Display', Georgia, serif", size=20, color="#9FB0CC", align="center"),
        dict(binding="footerText", text="", x=300, y=1700,
             font="Manrope, Arial, sans-serif", size=15, color="#8FA2C0", align="center"),
        dict(binding="footerPhone", text="", x=300, y=1745,
             font="Manrope, Arial, sans-serif", size=13, color="#8FA2C0", align="center"),
    ],
))


def confetti(seed, colors, count=170, ymin=0, ymax=H, opacity=(0.5, 0.95)):
    rnd = random.Random(seed)
    out = []
    for _ in range(count):
        x = rnd.uniform(0, W); y = rnd.uniform(ymin, ymax)
        c = rnd.choice(colors); o = rnd.uniform(*opacity)
        rot = rnd.uniform(0, 360); kind = rnd.random()
        if kind < 0.45:
            w = rnd.uniform(5, 11); h = rnd.uniform(2.5, 5)
            out.append(f'<rect x="{-w/2:.1f}" y="{-h/2:.1f}" width="{w:.1f}" height="{h:.1f}" rx="1" '
                       f'fill="{c}" opacity="{o:.2f}" transform="translate({x:.0f},{y:.0f}) rotate({rot:.0f})"/>')
        elif kind < 0.75:
            r = rnd.uniform(2, 4.5)
            out.append(f'<circle cx="{x:.0f}" cy="{y:.0f}" r="{r:.1f}" fill="{c}" opacity="{o:.2f}"/>')
        else:
            s = rnd.uniform(4, 8)
            out.append(f'<path d="M0,{-s:.1f} L{s*0.6:.1f},{s*0.5:.1f} L{-s*0.6:.1f},{s*0.5:.1f}Z" '
                       f'fill="{c}" opacity="{o:.2f}" transform="translate({x:.0f},{y:.0f}) rotate({rot:.0f})"/>')
    return '<g>' + ''.join(out) + '</g>'


def balloon(x, y, s, fill, hi="#FFFFFF"):
    return (f'<g transform="translate({x},{y}) scale({s})">'
            f'<path d="M0,52 C-3,44 -3,42 0,38" stroke="#B8B8B8" stroke-width="1.2" fill="none"/>'
            f'<ellipse cx="0" cy="0" rx="22" ry="27" fill="{fill}"/>'
            f'<path d="M-6,34 L0,26 L6,34Z" fill="{fill}"/>'
            f'<ellipse cx="-7" cy="-9" rx="5" ry="8" fill="{hi}" opacity="0.45" transform="rotate(-20 -7 -9)"/>'
            f'</g>')


# ---------------------------------------------------------------- BODA 002
def _boda002_bg(p):
    return f'''
  <defs>
    <linearGradient id="{p}wc" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#7FA98B"/><stop offset="55%" stop-color="#3F6E52"/>
      <stop offset="100%" stop-color="#264A38"/>
    </linearGradient>
    <filter id="{p}blur" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="7"/>
    </filter>
    <filter id="{p}blur2" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="14"/>
    </filter>
  </defs>
  <rect width="{W}" height="{H}" fill="#FCFCFA"/>
  <g fill="url(#{p}wc)">
    <path filter="url(#{p}blur2)" opacity="0.30"
      d="M-30,-20 C120,-40 250,40 300,20 C360,-4 430,60 520,30 C580,10 620,60 620,90 C560,140 470,110 380,130 C280,152 150,120 40,140 C-10,148 -40,90 -30,-20Z"/>
    <path filter="url(#{p}blur)" opacity="0.55"
      d="M-10,10 C90,-24 200,50 268,26 C330,4 380,54 452,34 C510,18 560,46 560,72 C500,112 420,86 340,104 C250,124 140,98 50,114 C6,122 -20,80 -10,10Z"/>
    <path opacity="0.85"
      d="M20,34 C90,10 170,58 226,40 C280,22 320,60 372,46 C420,34 462,54 460,70 C408,96 340,78 274,92 C204,108 122,90 58,100 C24,105 10,72 20,34Z"/>
  </g>
  <g fill="url(#{p}wc)">
    <path filter="url(#{p}blur)" opacity="0.35"
      d="M600,1720 C520,1700 470,1746 400,1734 C330,1722 290,1760 300,1800 L620,1800Z"/>
    <path opacity="0.7"
      d="M600,1748 C540,1734 500,1768 448,1760 C398,1752 372,1780 380,1800 L620,1800Z"/>
  </g>'''


def _boda002_ov(p):
    return f'''
  <g stroke="#3F6E52" stroke-width="1" opacity="0.55">
    <line x1="238" y1="1372" x2="362" y2="1372"/>
  </g>
  <g opacity="0.9">
    {eucalyptus(44, 1690, 0.9, "#5C8567", -12)}
    {eucalyptus(556, 1620, 0.9, "#5C8567", 168)}
  </g>'''


add(dict(
    id="boda_002", category="boda", name="Boda — Acuarela Verde",
    description="Minimalista blanco con acuarela verde y tipografía caligráfica",
    rects=[(48, 176, 504, 348), (48, 546, 504, 348), (48, 916, 504, 348)],
    bg=_boda002_bg, ov=_boda002_ov,
    photo=dict(radius=0, border=None, borderWidth=0),
    preview_stroke=None,
    logo=dict(x=300, y=1660, width=120, height=54),
    texts=[
        dict(binding="subtitleText", text="Ana & Luis", x=300, y=1330,
             font="'Dancing Script', cursive", size=54, color="#2F4A38", align="center"),
        dict(binding="date", x=300, y=1418,
             font="'Playfair Display', Georgia, serif", size=19, color="#5C7A66",
             align="center", letterSpacing=4),
        dict(binding="eventLabel", text="", x=300, y=1466,
             font="'Playfair Display', Georgia, serif", size=16, color="#7C8F82",
             align="center", letterSpacing=5),
        dict(binding="footerText", text="", x=300, y=1540,
             font="Manrope, Arial, sans-serif", size=14, color="#8A9A90", align="center"),
        dict(binding="footerPhone", text="", x=300, y=1585,
             font="Manrope, Arial, sans-serif", size=13, color="#8A9A90", align="center"),
    ],
))


# ---------------------------------------------------------------- BODA 003
def _boda003_bg(p):
    return f'''
  <defs>
    <linearGradient id="{p}bg" x1="0" y1="0" x2="0.3" y2="1">
      <stop offset="0%" stop-color="#1C1C1C"/><stop offset="50%" stop-color="#0D0D0D"/>
      <stop offset="100%" stop-color="#141414"/>
    </linearGradient>
    {gold_defs(p, "#F3DFA2", "#C9A227", "#8A6B12")}
  </defs>
  <rect width="{W}" height="{H}" fill="url(#{p}bg)"/>
  {sparkles(p, 6001, ["#D4AF37", "#F0E0A8"], 110, 0.5, 1.8, 0, H, (0.12, 0.4))}
  <g fill="none" stroke="url(#{p}gold)" stroke-width="1.2" opacity="0.55">
    <rect x="22" y="22" width="{W-44}" height="{H-44}"/>
    <rect x="30" y="30" width="{W-60}" height="{H-60}" stroke-width="0.6" opacity="0.7"/>
  </g>'''


def _boda003_ov(p):
    def deco(x, y, r=0):
        return (f'<g transform="translate({x},{y}) rotate({r})" fill="none" '
                f'stroke="url(#{p}gold)" stroke-width="1.4" opacity="0.9">'
                '<path d="M0,0 L26,0"/><path d="M0,0 L0,26"/>'
                '<path d="M6,6 L18,6"/><path d="M6,6 L6,18"/></g>')
    return f'''
  <defs>{gold_defs(p, "#F3DFA2", "#C9A227", "#8A6B12")}</defs>
  {frame_lines(LAY_A, f"url(#{p}gold)", 1.1, 0.7, -10)}
  {deco(30, 30)}{deco(570, 30, 90)}{deco(570, 1770, 180)}{deco(30, 1770, 270)}
  <g stroke="url(#{p}gold)" stroke-width="1.2" opacity="0.9">
    <line x1="150" y1="1310" x2="450" y2="1310"/>
    <line x1="200" y1="1560" x2="400" y2="1560"/>
  </g>
  <g fill="url(#{p}gold)">
    <circle cx="300" cy="1310" r="4"/>
    <path d="M300,1546 L305,1556 L300,1566 L295,1556Z"/>
  </g>'''


add(dict(
    id="boda_003", category="boda", name="Boda — Negro y Oro",
    description="Art decó negro con líneas doradas, elegante y formal",
    rects=LAY_A, bg=_boda003_bg, ov=_boda003_ov,
    photo=dict(radius=0, border="#C9A227", borderWidth=3),
    preview_stroke="#C9A227",
    logo=dict(x=300, y=48, width=150, height=70),
    texts=[
        dict(binding="subtitleText", text="Ana & Luis", x=300, y=1400,
             font="'Playfair Display', Georgia, serif", size=42, color="#E8CE7A",
             align="center", weight="bold", letterSpacing=5),
        dict(binding="eventLabel", text="NUESTRA BODA", x=300, y=1478,
             font="Manrope, Arial, sans-serif", size=18, color="#BFA35A",
             align="center", letterSpacing=7),
        dict(binding="date", x=300, y=1610,
             font="'Playfair Display', Georgia, serif", size=20, color="#D4AF37",
             align="center", letterSpacing=4),
        dict(binding="footerText", text="", x=300, y=1690,
             font="Manrope, Arial, sans-serif", size=14, color="#9C8850", align="center"),
        dict(binding="footerPhone", text="", x=300, y=1734,
             font="Manrope, Arial, sans-serif", size=13, color="#9C8850", align="center"),
    ],
))


# ---------------------------------------------------------------- CUMPLEANOS 002
def _cum002_bg(p):
    return f'''
  <defs>
    <linearGradient id="{p}bg" x1="0" y1="0" x2="0.2" y2="1">
      <stop offset="0%" stop-color="#FFFDF8"/><stop offset="100%" stop-color="#FFF4E8"/>
    </linearGradient>
  </defs>
  <rect width="{W}" height="{H}" fill="url(#{p}bg)"/>
  {confetti(7001, ["#FF6B6B", "#FFD93D", "#6BCB77", "#4D96FF", "#C77DFF", "#FF9F45"], 200)}'''


def _cum002_ov(p):
    return f'''
  {frame_lines(LAY_A, "#FFB84D", 3, 0.55, -8)}
  <g>
    {balloon(66, 96, 1.05, "#FF6B6B")}
    {balloon(130, 66, 0.85, "#FFD93D")}
    {balloon(470, 66, 0.85, "#4D96FF")}
    {balloon(534, 96, 1.05, "#6BCB77")}
  </g>
  <g stroke="#FF9F45" stroke-width="3" stroke-linecap="round" opacity="0.9">
    <path d="M150,1320 C190,1300 230,1340 270,1320" fill="none"/>
    <path d="M330,1320 C370,1340 410,1300 450,1320" fill="none"/>
  </g>
  {confetti(7002, ["#FF6B6B", "#FFD93D", "#6BCB77", "#4D96FF", "#C77DFF"], 60, 1290, 1780, (0.65, 1.0))}'''


add(dict(
    id="cumpleanos_002", category="cumpleanos", name="Cumpleaños — Confeti Fiesta",
    description="Confeti multicolor, globos y marcos naranjas; ideal para fiestas infantiles",
    rects=LAY_A, bg=_cum002_bg, ov=_cum002_ov,
    photo=dict(radius=14, border="#FFFFFF", borderWidth=6),
    preview_stroke="#FFB84D",
    logo=dict(x=300, y=1690, width=130, height=58),
    texts=[
        dict(binding="subtitleText", text="Sofía", x=300, y=1420,
             font="'Dancing Script', cursive", size=68, color="#E8503A",
             align="center", weight="bold"),
        dict(binding="eventLabel", text="FELIZ CUMPLEAÑOS", x=300, y=1508,
             font="Manrope, Arial, sans-serif", size=25, color="#2F7DBF",
             align="center", weight="bold", letterSpacing=4),
        dict(binding="date", x=300, y=1566,
             font="Manrope, Arial, sans-serif", size=19, color="#7A8B99", align="center"),
        dict(binding="footerHashtag", text="", x=300, y=1622,
             font="Manrope, Arial, sans-serif", size=16, color="#E8503A",
             align="center", weight="bold"),
        dict(binding="footerPhone", text="", x=300, y=1672,
             font="Manrope, Arial, sans-serif", size=14, color="#7A8B99", align="center"),
    ],
))


# ---------------------------------------------------------------- CORPORATIVO 001
LAY_C = [(48, 208, 504, 344), (48, 576, 504, 344), (48, 944, 504, 344)]


def _corp001_bg(p):
    return f'''
  <defs>
    <linearGradient id="{p}band" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#16202E"/><stop offset="100%" stop-color="#25384F"/>
    </linearGradient>
    <linearGradient id="{p}acc" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#0FB5A5"/><stop offset="100%" stop-color="#2F7DBF"/>
    </linearGradient>
  </defs>
  <rect width="{W}" height="{H}" fill="#F6F8FA"/>
  <rect x="0" y="0" width="{W}" height="168" fill="url(#{p}band)"/>
  <rect x="0" y="168" width="{W}" height="6" fill="url(#{p}acc)"/>
  <rect x="0" y="1620" width="{W}" height="180" fill="url(#{p}band)"/>
  <rect x="0" y="1614" width="{W}" height="6" fill="url(#{p}acc)"/>
  <rect x="0" y="1560" width="{W}" height="1" fill="#DCE3EC"/>'''


def _corp001_ov(p):
    return f'''
  <defs>
    <linearGradient id="{p}acc" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#0FB5A5"/><stop offset="100%" stop-color="#2F7DBF"/>
    </linearGradient>
  </defs>
  {frame_lines(LAY_C, "#CBD5E1", 1, 0.9, -7)}
  <rect x="250" y="1404" width="100" height="4" rx="2" fill="url(#{p}acc)"/>'''


add(dict(
    id="corporativo_001", category="corporativo", name="Corporativo — Minimalista",
    description="Limpio y profesional, banda superior para logo y pie con datos de contacto",
    rects=LAY_C, bg=_corp001_bg, ov=_corp001_ov,
    photo=dict(radius=6, border="#FFFFFF", borderWidth=5),
    preview_stroke="#E2E8F0",
    logo=dict(x=300, y=44, width=200, height=84),
    texts=[
        dict(binding="headerText", text="SDE Eventos", x=300, y=1354,
             font="Manrope, Arial, sans-serif", size=32, color="#16202E",
             align="center", weight="bold", letterSpacing=1),
        dict(binding="subtitleText", text="", x=300, y=1450,
             font="Manrope, Arial, sans-serif", size=20, color="#516175",
             align="center", letterSpacing=3),
        dict(binding="date", x=300, y=1500,
             font="Manrope, Arial, sans-serif", size=17, color="#7C8A9A", align="center"),
        dict(binding="footerText", text="", x=300, y=1676,
             font="Manrope, Arial, sans-serif", size=17, color="#E6EDF5", align="center"),
        dict(binding="footerHashtag", text="", x=300, y=1722,
             font="Manrope, Arial, sans-serif", size=16, color="#4FD1C5",
             align="center", weight="bold"),
        dict(binding="footerPhone", text="", x=300, y=1762,
             font="Manrope, Arial, sans-serif", size=15, color="#A9BACB", align="center"),
    ],
))


# ---------------------------------------------------------------- GRADUACION 001
def _grad_cap(x, y, s, gold, dark):
    return (f'<g transform="translate({x},{y}) scale({s})">'
            f'<path d="M0,-16 L52,2 L0,20 L-52,2Z" fill="{gold}"/>'
            f'<path d="M-30,9 L-30,30 C-30,40 30,40 30,30 L30,9 L0,22Z" fill="{dark}"/>'
            f'<path d="M52,2 L52,34" stroke="{gold}" stroke-width="2.6" fill="none"/>'
            f'<circle cx="52" cy="38" r="5" fill="{gold}"/>'
            f'<path d="M52,42 L48,58 M52,42 L52,60 M52,42 L56,58" stroke="{gold}" stroke-width="2"/>'
            f'</g>')


def _laurel(x, y, s, fill, flip=1):
    leaves = ''.join(
        f'<ellipse cx="{-2 - i*2:.0f}" cy="{-i*13:.0f}" rx="7" ry="4.5" fill="{fill}" '
        f'transform="rotate({-32 - i*3} {-2 - i*2:.0f} {-i*13:.0f})" opacity="0.92"/>'
        for i in range(8))
    return (f'<g transform="translate({x},{y}) scale({flip*s},{s})">'
            f'<path d="M0,0 C-14,-30 -14,-70 -4,-104" stroke="{fill}" stroke-width="2.2" fill="none"/>'
            f'{leaves}</g>')


def _grad001_bg(p):
    return f'''
  <defs>
    <linearGradient id="{p}bg" x1="0" y1="0" x2="0.25" y2="1">
      <stop offset="0%" stop-color="#16294D"/><stop offset="55%" stop-color="#0D1A33"/>
      <stop offset="100%" stop-color="#101F3D"/>
    </linearGradient>
    {gold_defs(p, "#F7E3A1", "#D4AF37", "#96741A")}
  </defs>
  <rect width="{W}" height="{H}" fill="url(#{p}bg)"/>
  {sparkles(p, 8001, ["#D4AF37", "#F2E4B0", "#FFFFFF"], 150, 0.6, 2.2, 0, H, (0.15, 0.6))}
  <g fill="none" stroke="url(#{p}gold)" stroke-width="1" opacity="0.4">
    <rect x="20" y="20" width="{W-40}" height="{H-40}"/>
  </g>'''


def _grad001_ov(p):
    return f'''
  <defs>{gold_defs(p, "#F7E3A1", "#D4AF37", "#96741A")}</defs>
  {frame_lines(LAY_A, f"url(#{p}gold)", 1.2, 0.7, -9)}
  {_grad_cap(300, 1338, 1.3, f"url(#{p}gold)", "#0B1730")}
  {_laurel(112, 1782, 1.45, f"url(#{p}gold)", 1)}
  {_laurel(488, 1782, 1.45, f"url(#{p}gold)", -1)}
  <g stroke="url(#{p}gold)" stroke-width="1.3" opacity="0.85">
    <line x1="176" y1="1652" x2="272" y2="1652"/>
    <line x1="328" y1="1652" x2="424" y2="1652"/>
  </g>
  <g fill="url(#{p}gold)"><circle cx="300" cy="1652" r="3.5"/></g>'''


add(dict(
    id="graduacion_001", category="graduacion", name="Graduación — Toga y Oro",
    description="Azul noche con birrete, laureles dorados y tipografía clásica",
    rects=LAY_A, bg=_grad001_bg, ov=_grad001_ov,
    photo=dict(radius=4, border="#D4AF37", borderWidth=3),
    preview_stroke="#D4AF37",
    logo=dict(x=300, y=44, width=150, height=68),
    texts=[
        dict(binding="subtitleText", text="Generación", x=300, y=1452,
             font="'Dancing Script', cursive", size=54, color="#F2E4B0", align="center"),
        dict(binding="eventLabel", text="GRADUACIÓN", x=300, y=1534,
             font="'Playfair Display', Georgia, serif", size=28, color="#D4AF37",
             align="center", weight="bold", letterSpacing=8),
        dict(binding="date", x=300, y=1590,
             font="'Playfair Display', Georgia, serif", size=20, color="#B9C7DE", align="center"),
        dict(binding="footerText", text="", x=300, y=1690,
             font="Manrope, Arial, sans-serif", size=15, color="#9FB0CC", align="center"),
        dict(binding="footerPhone", text="", x=300, y=1734,
             font="Manrope, Arial, sans-serif", size=13, color="#9FB0CC", align="center"),
    ],
))


# ================================================================ ESCRITURA
PREVIEW_SAMPLE = {
    "subtitleText": "Nombre",
    "eventLabel": "EVENTO",
    "headerText": "EVENTO",
    "date": "15 mar 2026",
    "footerText": "",
    "footerHashtag": "",
    "footerPhone": "",
}


def preview_text_nodes(texts):
    out = []
    for t in texts:
        label = t.get("text") or PREVIEW_SAMPLE.get(t.get("binding"), "")
        if t.get("binding") in ("subtitleText", "headerText", "eventLabel"):
            label = t.get("text") or PREVIEW_SAMPLE[t["binding"]]
        if t.get("binding") == "date":
            label = PREVIEW_SAMPLE["date"]
        if not label:
            continue
        label = (label.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;"))
        anchor = {"center": "middle", "right": "end", "left": "start"}.get(t.get("align", "left"), "start")
        font = t.get("font", "serif").replace('"', "'")
        ls = f' letter-spacing="{t["letterSpacing"]}"' if t.get("letterSpacing") else ''
        weight = ' font-weight="bold"' if t.get("weight") == "bold" else ''
        size = t.get("size", 24)
        out.append(f'<text x="{t["x"]}" y="{t["y"] + size*0.34:.0f}" text-anchor="{anchor}" '
                   f'font-family="{font}" font-size="{size}" fill="{t.get("color", "#000")}"{weight}{ls}>{label}</text>')
    return '<g>' + ''.join(out) + '</g>'


def build_template(t):
    folder = os.path.join(ROOT, t["id"])
    os.makedirs(folder, exist_ok=True)

    bg_svg = wrap(t["bg"]("b"))
    ov_svg = wrap(t["ov"]("o"))
    prev_svg = wrap(
        t["bg"]("pa") +
        photo_boxes(t["rects"], t.get("preview_stroke"), t["photo"].get("borderWidth") or 3) +
        t["ov"]("pb") +
        preview_text_nodes(t["texts"]),
        w=200, h=600,
    )

    with open(os.path.join(folder, "background.svg"), "w", encoding="utf-8") as f:
        f.write(bg_svg)
    with open(os.path.join(folder, "overlay.svg"), "w", encoding="utf-8") as f:
        f.write(ov_svg)
    with open(os.path.join(folder, "preview.svg"), "w", encoding="utf-8") as f:
        f.write(prev_svg)

    elements = [{"type": "background", "src": "background.svg"}]
    for i, (x, y, w, h) in enumerate(t["rects"], start=1):
        el = {"type": "photo", "id": f"photo{i}", "x": x, "y": y, "width": w, "height": h,
              "fit": "cover", "radius": t["photo"].get("radius", 0)}
        if t["photo"].get("border"):
            el["border"] = t["photo"]["border"]
            el["borderWidth"] = t["photo"].get("borderWidth", 3)
        elements.append(el)
    elements.append({"type": "overlay", "src": "overlay.svg", "x": 0, "y": 0, "width": W, "height": H})
    if t.get("logo"):
        elements.append({"type": "logo", "align": "center", **t["logo"]})
    for tx in t["texts"]:
        el = {"type": "text"}
        el.update(tx)
        if el.get("shadow") is True:
            el["shadow"] = True
        elements.append(el)

    definition = {
        "id": t["id"], "name": t["name"], "category": t["category"],
        "description": t["description"],
        "canvas": {"width": W, "height": H},
        "elements": elements,
    }
    with open(os.path.join(folder, "template.json"), "w", encoding="utf-8") as f:
        json.dump(definition, f, ensure_ascii=False, indent=2)
    return definition


def update_catalog(defs):
    path = os.path.join(ROOT, "catalog.json")
    with open(path, "r", encoding="utf-8") as f:
        catalog = json.load(f)
    existing = {e["id"]: e for e in catalog["templates"]}
    for d in defs:
        existing[d["id"]] = {
            "id": d["id"], "folder": d["id"], "name": d["name"],
            "category": d["category"], "preview": "preview.svg",
        }
    order = ["xv_anos", "boda", "cumpleanos", "graduacion", "corporativo", "general"]
    catalog["templates"] = sorted(
        existing.values(),
        key=lambda e: (order.index(e["category"]) if e["category"] in order else 99, e["id"]),
    )
    with open(path, "w", encoding="utf-8") as f:
        json.dump(catalog, f, ensure_ascii=False, indent=2)
    return catalog


if __name__ == "__main__":
    defs = [build_template(t) for t in TEMPLATES]
    cat = update_catalog(defs)
    for d in defs:
        print("OK", d["id"], "-", d["name"])
    print("Catalogo:", len(cat["templates"]), "plantillas")
