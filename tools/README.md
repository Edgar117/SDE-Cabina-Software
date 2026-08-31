# Generador de plantillas (tira 600×1800)

## Uso

```bash
python tools/generar_plantillas.py
```

Regenera **todas** las plantillas nuevas dentro de `public/templates/<id>/` y
actualiza `public/templates/catalog.json`. Es idempotente: puedes correrlo las
veces que quieras.

Cada plantilla genera 4 archivos:

| Archivo           | Para qué sirve                                          |
|-------------------|---------------------------------------------------------|
| `background.svg`  | Fondo completo (se dibuja primero)                      |
| `overlay.svg`     | Adornos que van **encima** de las fotos                  |
| `preview.svg`     | Miniatura del panel de administración                    |
| `template.json`   | Definición que lee `src/jsonTemplates/renderer.js`       |

## Agregar una plantilla nueva

En `tools/generar_plantillas.py`, al final de la sección de diseños:

```python
def _mi_bg(p):   return f'<rect width="{W}" height="{H}" fill="#FFF"/>'
def _mi_ov(p):   return f'{frame_lines(LAY_A, "#D4AF37", 1.5, 0.6, -9)}'

add(dict(
    id="bautizo_001", category="bautizo", name="Bautizo — Celeste",
    description="...",
    rects=LAY_A,                 # LAY_A = cartucho abajo, LAY_B/LAY_C = otras
    bg=_mi_bg, ov=_mi_ov,
    photo=dict(radius=8, border="#D4AF37", borderWidth=3),
    preview_stroke="#D4AF37",
    logo=dict(x=300, y=42, width=150, height=72),   # o None
    texts=[ dict(binding="subtitleText", x=300, y=1430, size=58,
                 font="'Dancing Script', cursive", color="#333", align="center"), ],
))
```

Si usas una categoría nueva, agrega su etiqueta en `CATEGORY_LABELS`
(`src/templatesPanel.js`) para que se vea bonita en el panel.

## Bindings de texto disponibles

| binding          | Campo del panel de administración              |
|------------------|------------------------------------------------|
| `headerText`     | Texto de Cabecera (marca, ej. "SDE Eventos")   |
| `subtitleText`   | Subtítulo / Nombre (ej. "Valeria")             |
| `eventLabel`     | Etiqueta del evento (ej. "QUINCEAÑERA")        |
| `footerText`     | Texto de Pie de Página                          |
| `footerHashtag`  | Hashtag                                         |
| `footerPhone`    | Teléfono                                        |
| `date`           | Fecha del día (automática)                      |

Si el campo está vacío, se usa el `text` que traiga el elemento en el
`template.json`. Por eso `eventLabel` sirve como etiqueta fija por plantilla
("QUINCEAÑERA", "FELIZ CUMPLEAÑOS", ...) sin pisar la marca del negocio.

## Ayudantes de dibujo incluidos

`sparkles`, `stars4`, `confetti`, `crown`, `rose`, `leaf`, `eucalyptus`,
`butterfly`, `balloon`, `gold_defs`, `frame_lines`, `_grad_cap`, `_laurel`.

> Importante: los prefijos `p` en los `id` de los `<defs>` evitan que choquen
> los IDs cuando el `preview.svg` mezcla fondo y overlay en un mismo archivo.
> Siempre usa `id="{p}algo"` dentro de `defs`.

## Fuentes

Cargadas en `index.html`: **Manrope**, **Playfair Display**, **Dancing Script**.
Si usas otra, agrégala primero al `<link>` de Google Fonts.

---

# Adornos de PANTALLA (temas de la cabina)

```bash
python tools/generar_deco_pantalla.py
```

Genera `public/deco/*.svg`: las guirnaldas y racimos florales que usa el tema
**Boda Premium**. El CSS los consume como `background-image` en
`body[data-deco="floral"] .theme-deco` (ver `src/styles.css`).

Helpers disponibles: `rosa`, `capullo`, `hoja`, `rama` (eucalipto),
`nube_blanca` (gypsophila), `destellos`. Las paletas están en el diccionario
`PALETAS`, y cada una genera 3 degradados radiales (uno por anillo de pétalos),
que es lo que le da volumen a las flores.

> La guirnalda superior tiene **hueco al centro** a propósito: ahí va el título
> del evento. Si la modificas, respeta ese espacio libre.

## Temas de pantalla

Se definen en `src/themes.js`. Cada tema declara tokens (`ink`, `gold`,
`frameBorder`, `scrim`, `fontDisplay`...) que `applyTheme()` vuelca como
variables CSS, más dos atributos en `<body>`:

- `data-mood="light|dark"` — decide sombras, paneles y colores de overlay
- `data-deco="curtain|bokeh|floral|filigree|artdeco|botanical|confetti|neon|retrogrid|grid|stars"`

Para un tema nuevo basta agregarlo a `themes` reutilizando un `deco` existente;
el selector del panel se llena solo.
