# Biblioteca PDF — Handoff de diseño

App React: pantalla principal con portadas de libros en PDF; al elegir un libro se abre un lector de doble página que voltea la hoja con un clic. Estética nocturna, portadas iluminadas.

**Archivo de vistas:** `Biblioteca-PDF-Handoff.html` — ábrelo en el navegador. Incluye un prototipo interactivo (clic en portada → abre el pliego; clic en la mitad derecha/izquierda → pasar página; `Esc` → volver), las vistas de escritorio y móvil, los estados y las especificaciones.

---

## Pantallas

| # | Vista | Notas |
|---|---|---|
| 00 | Biblioteca (escritorio 1280) | Barra superior con buscador y "+ Añadir PDF"; rejilla de portadas con barra de progreso |
| 01 | Detalle del libro | Panel lateral de 520 px sobre la biblioteca oscurecida; progreso, marcadores, "Seguir leyendo" |
| 02 | Lector con índice | Pliego doble sobre fondo nocturno; cajón de contenido de 300 px |
| 03 | Biblioteca móvil (390) | 2 columnas, filtros en chips, barra inferior de 3 destinos |
| 04 | Lector móvil (390) | Una página por pantalla, barra de progreso arrastrable |
| 05 | Estados | Vacío · subiendo PDFs · página renderizando |

## Tokens de color

| Token | Valor | Uso |
|---|---|---|
| `--bg-canvas` | `#0F1116` | Fondo del documento |
| `--bg-app` | `#14161C` | Fondo de la app |
| `--bg-surface` | `#191C24` | Paneles, tarjetas |
| `--ink` | `#ECEAE4` | Texto principal |
| `--ink-muted` | `#A6A6AF` | Texto secundario |
| `--line` | `#262A34` | Bordes y separadores |
| `--accent` | `#2A3F73` | Rellenos: botones, chips |
| `--accent-lift` | `#93A9E4` | Texto, líneas y progreso sobre oscuro (4.5:1) |
| `--page-paper` | `#F2EDE4` | Página del PDF |

> El acento sólido nunca se usa como color de texto sobre fondo oscuro; para eso está `--accent-lift`.

## Tipografía

| Rol | Fuente | Tamaño |
|---|---|---|
| Título | EB Garamond 500 | 44/46, tracking -1.5% |
| Encabezado | EB Garamond 500 | 24/28 |
| Cuerpo de interfaz | IBM Plex Sans 400 | 15/24 |
| Título de libro en rejilla | IBM Plex Sans 500 | 13.5/17 |
| Metadatos | IBM Plex Mono 400 | 11, tracking +10% |

## Rejilla y espaciado

- Escala base 4 px. Padding de contenedor: 28 px escritorio, 20 px móvil.
- Rejilla de portadas: 6 columnas ≥1280 · 4 en 768–1279 · 3 en 560–767 · 2 en <560. Gap 26/20/18 px.
- Portada: relación 2:3, radio 2 px, lomo oscuro de 3–4 px a la izquierda.
- Brillo de portada: `box-shadow: 0 18px 40px -16px rgba(0,0,0,.9), 0 8px 30px -12px rgba(147,169,228,.28)` + sheen diagonal `linear-gradient(150deg, rgba(255,255,255,.12), transparent 46%)`.
- Objetivos táctiles ≥44 px en móvil; las zonas de avance son las mitades de la pantalla.

## Movimiento

| Transición | Duración | Curva |
|---|---|---|
| Portada → lector (shared element) | 420 ms | `cubic-bezier(.2,.8,.2,1)` |
| Fondo del lector (fade) | 320 ms | `ease` |
| Volteo de hoja (`rotateY`) | 520 ms | `cubic-bezier(.35,.05,.2,1)` |
| Página móvil (slide + fade) | 280 ms | `cubic-bezier(.32,.72,0,1)` |
| Aparición de portadas | 240 ms, +25 ms escalonado | `ease-out` |
| Controles (auto-ocultar) | 2.5 s espera, 200 ms fade | `ease-in-out` |

Contenedor del pliego con `perspective: 2400px`; la hoja que gira usa `transform-origin: left center`, `backface-visibility: hidden` y una sombra interna que se intensifica hacia el lomo. Con `prefers-reduced-motion` sustituye el volteo por un fundido de 160 ms.

## Componentes React sugeridos

```
<App>
├─ <LibraryScreen>
│  ├─ <TopBar search onAdd />
│  ├─ <ShelfSection title>
│  │  └─ <BookCard book onOpen />      // portada + progreso
│  ├─ <BookDetailPanel book open onClose />
│  └─ <EmptyState /> / <UploadQueue />
└─ <ReaderScreen book initialPage>
   ├─ <ReaderChrome onBack onToc autoHide />
   ├─ <TocDrawer chapters current />
   ├─ <PageSpread mode="spread|single">
   │  └─ <PdfPage index scale />       // react-pdf
   └─ <PageProgress page total onSeek />
```

## Notas de implementación

- **Portadas:** renderiza la primera página del PDF una vez a 400 px de ancho y guarda la miniatura (IndexedDB o carpeta `/covers`). Los marcadores rayados de las vistas son placeholders.
- **Modelo:** `{ id, title, author, file, cover, pages, lastPage, bookmarks[] }`.
- **Rendimiento:** pre-renderiza la página siguiente y la anterior para que el clic no espere.
- **Responsivo:** pliego doble solo ≥1024 px de ancho; por debajo, una página por pantalla.
- **Teclado:** ← → y espacio pasan página, `Esc` vuelve a la biblioteca. Progreso persistido por libro.
