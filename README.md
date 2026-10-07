# Tutorial Restaurante

Proyecto independiente para mostrar la preparación administrativa de un restaurante en ODO. Incluye diagrama, ocho videos por flujo, recorrido completo e informe de viabilidad. Conserva la guía existente y sus límites de verificación.

## Ejecutar y construir

Requisito: Node.js 20 o posterior. No tiene dependencias externas; no necesita `npm install`, ODO, backend, cuenta ni variables de entorno.

Desde esta carpeta:

```sh
npm run dev
```

Abra http://127.0.0.1:4173. Para generar la entrega:

```sh
npm run build
npm run preview
```

La vista previa sirve **dist** en http://127.0.0.1:4174. Ctrl+C detiene el servidor. Ambos servidores admiten rangos HTTP para avanzar o retroceder en los videos.

## Compartir

Publique **todo el contenido de dist** en un hosting estático, conservando las carpetas. Los enlaces son relativos y funcionan también si se publica dentro de una subcarpeta. El hosting debe servir `.webm` como `video/webm` y admitir rangos HTTP para una navegación fluida.

La entrega `tutorial-restaurante.zip` contiene el sitio construido; descomprima todo junto. También puede abrir su `index.html` directamente para una presentación local. Para comprobar reproducción y saltos de tiempo use preferentemente un servidor HTTP.

Para que otra persona edite y construya el proyecto, comparta esta carpeta completa (HTML, assets, scripts, package.json y README), omitiendo dist y el ZIP si quiere evitar duplicados.

`tutorial-restaurante-proyecto.zip` contiene precisamente esos archivos fuente. Descomprímalo en una carpeta nueva y ejecute allí `npm run build`; no depende de la ubicación original en ODO.

## Editar

| Ubicación | Contenido |
| --- | --- |
| `index.html` | Estructura y texto del tutorial |
| `viabilidad.html` | Informe de alcance, mediciones y dudas pendientes |
| `assets/css/site.css` | Estilos de la guía, móvil e impresión |
| `assets/css/report.css` | Estilos del informe |
| `assets/js/main.js` | Zoom, impresión y velocidad de reproducción |
| `assets/videos/` | Nueve videos WebM |
| `assets/images/` | Portadas y favicon |
| `assets/diagrams/` | Diagrama SVG, PNG y fuente Mermaid |
| `assets/docs/` | Fuentes documentales del recorrido |
| `assets/data/` | Mediciones, capítulos y verificación de videos |
| `scripts/` | Build y servidor local, sin paquetes externos |

Después de editar ejecute `npm run build`. El build comprueba los enlaces del HTML, copia exclusivamente las páginas y assets públicos, y genera `build-manifest.json` con tamaños y hashes SHA-256. No incluye scripts de automatización, sesiones, dependencias ni el código de ODO.

## Alcance del tutorial

Los videos se grabaron con datos ficticios y API simulada. No son un formulario conectado a ODO y no realizan cambios reales. Las mediciones automáticas no demuestran facilidad ni rapidez para una persona nueva. El informe conserva las comprobaciones y pendientes del recorrido original.

El sitio utiliza HTML, CSS y JavaScript estáticos. No reproduce ni reemplaza el stack de la aplicación ODO; su publicación es independiente.
