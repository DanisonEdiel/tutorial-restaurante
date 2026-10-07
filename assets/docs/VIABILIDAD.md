# Viabilidad del recorrido administrativo — 2026-10-06

El recorrido se puede completar con la interfaz actual y API simulada. **Todavía no está demostrada su rapidez ni comprensión para una persona nueva.**

La prueba sin pausas añadió un restaurante vacío, un área con dos mesas, cocina y turno; seleccionó tres productos a la carta, construyó un menú fijo con dos entradas, tres principales y una bebida, configuró dos opciones de extras y las asignó a dos ofertas. Guardó, recargó, recuperó el borrador, comprobó $7 + $2 + $1,50 = $10,50 y aplicó una sola vez. Resultado: nueve ofertas (tres a la carta y seis de menú fijo), un menú, seis componentes, un grupo con dos opciones, revisión 1 y sin borrador pendiente.

## Medición y alcance

- 82 acciones instrumentadas; 15,093 segundos en una ejecución automática local sin pausas de tutorial.
- “Acción” cuenta clic, llenado, selección de casilla, Escape y recarga explícitos del guion. No cuenta desplazamientos automáticos, pulsaciones de cada letra, esperas ni decisiones humanas. No equivale a 82 clics.
- Menú: 20 acciones instrumentadas. Extras: 16. Productos a la carta: 8. Estas cifras corresponden al caso de ejemplo, no a todos los menús posibles.
- La selección de 30 productos a la carta tardó 4,5 segundos automatizada sin el espaciado del video: reutilizó tres ofertas existentes y preparó 27 nuevas. Se recuperó desde otra página del mismo contexto simulado. Una aplicación fallida dejó intactas las ofertas publicadas y el reintento incrementó la revisión una vez. Son comprobaciones del doble de API, no de PostgreSQL.
- Los videos añaden capítulos y pausas para leer; su duración no es el tiempo del benchmark.
- Se usa el frontend servido en localhost:5173 con una sesión ficticia separada. Las rutas API se interceptan en el navegador antes de llegar a localhost:8080. WebSockets y llamadas externas están bloqueados. Ninguna escritura del recorrido llega al backend real.
- Se reutiliza `odo-front/tests/helpers/catalog-api.mjs`. La simulación tiene validaciones parciales y persistencia en memoria del contexto; recargar y abrir otra página conservan el borrador mientras viva esa sesión de Playwright. No prueba persistencia PostgreSQL, otra sesión autenticada independiente, concurrencia, aislamiento real ni transacción real.
- La primera ejecución en Vite separado (5179) no terminó de cargar. La prueba final usa el servidor disponible con interceptación completa; no se presenta ese intento fallido como cobertura.
- No se cambió el código de la aplicación ni sus contratos, autenticación o perfiles.
- La grabación inicial a 30 fps produjo archivos truncados aunque la interfaz terminó el recorrido. Se descartaron esas salidas y se volvió a grabar a 15 fps, verificando el cierre correcto del codificador. Los clips separados se extrajeron del recorrido continuo, conservando los capítulos. La integridad final se documenta en `videos-verificados.json`.

## Fricciones actuales que impiden declararlo fácil

1. **Inventario mezcla ingredientes y productos vendibles.** Consulta real autorizada: 49 registros, 36 RAW_MATERIAL, 9 FINISHED_GOOD y 4 RECIPE. El selector actual filtra activos, nombre/código y categoría; no distingue intención de venta. Además hay nombres iguales, como Arroz premium. Clasificar como terminado tampoco demuestra que sea un plato. Hace falta identificar el producto que se vende por nombre, código y uso; recomendar vendibles y explicar los ingredientes sin ocultarlos ni reclasificarlos silenciosamente.
2. **Preparar el local requiere saltar entre cuatro pantallas.** Información, sala, cocina y turnos conservan formularios separados. El borrador unifica solo productos, menús y extras. Un siguiente paso útil sería una lista de preparación que explique requisitos y lleve a la acción pendiente, con retorno al punto de partida.
3. **Un menú y una oferta son conceptos diferentes.** Se necesita explicar que el mismo producto puede tener modalidades distintas. Seleccionar primero carta y luego menú crea ofertas distintas válidas; para un negocio que solo vende menú se puede empezar directamente en “Crear un menú completo” y omitir la rama a la carta.
4. **El constructor exige desplazarse.** Secciones vacías, límites y recargos alargan el editor. Hay atajos, pero conviene observar dónde una persona pierde contexto antes de cambiarlo.
5. **Guardar y aplicar son dos decisiones.** El estado explica el borrador, pero la persona debe entender que guardar no publica. El tutorial destaca la revisión y los afectados, y evita presentar “incluido” como gratuidad.
6. **Extras compartidos tienen efecto amplio.** Cambiar un grupo afecta las ofertas asignadas y sus menús. Hay que comprobar que una persona entiende el impacto antes de publicar.
7. **El resumen de preparación es limitado.** Comprueba nombre/código, área/mesa, cocina, turno, oferta y estado activo. No acredita recetas completas, pagos, servicio, impresoras ni integración externa.

## Prueba de tarea antes de afirmar rapidez

Entregar a una persona nueva, sin video ni instrucciones de botones: “Prepare un local con dos mesas y un almuerzo de $7. Dos entradas y tres principales son alternativas; el cliente elige una de cada sección y una bebida. Añada queso por $1,50 a dos principales. Guarde, cierre la página, retome y aplique cuando esté listo”.

Registrar tiempo total, dudas textuales, retrocesos, ayudas necesarias, límites incorrectos y comprensión de guardar/aplicar. Verificar que obtiene $10,50 al elegir la hamburguesa con suplemento de $2 y queso. Ofrecer el video solo después del primer intento. No se ha ejecutado esta prueba humana.

## Fuentes y límites del grafo

Se consultó el grafo existente. La consulta amplia con vocabulario verificado se truncó (32 de 234 nodos). Después se inspeccionó `RestaurantCatalogWorkspace.vue` y sus dependencias; el grafo señala código cambiado y requiere comprobación, que se complementó leyendo las fuentes actuales. La consulta concreta está en `graphify-consulta.txt`.

Reglas revisadas en `RestaurantOperationsService.configurationStatus`, `RestaurantCatalogWorkspace`, `CatalogProductSelector`, `CatalogMenusEditor`, `CatalogGroupsEditor` y `catalogPreview`. El diagrama es una explicación del recorrido verificado, no una extracción nueva de Graphify ni certificación completa del negocio.

El diagrama incluye los caminos de error, conflicto y servicio activo por su lógica actual; los ocho videos principales muestran el camino correcto con cero atenciones. No incluyen creación de productos base, recetas, alta de empresas/permisos, impresoras físicas, pagos ni cierres.
