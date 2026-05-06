# Plan de Implementación — Wedding Invitation App

## Tasks

- [x] 1. Configuración del proyecto GAS
  - [x] 1.1 Crear el archivo `Code.gs` con la estructura base del proyecto (funciones vacías con JSDoc: `setupBaseDatos`, `doGet`, `guardarConfirmacion`, `enviarCorreo`, `validarEmail_`, `getDashboardData_`)
  - [x] 1.2 Crear el archivo `Index.html` con la estructura HTML base (doctype, viewport meta, secciones vacías con IDs: `#hero`, `#historia`, `#ubicacion`, `#timeline`, `#dresscode`, `#rsvp`, `#footer`, `#confetti-canvas`)
  - [x] 1.3 Crear el archivo `Dashboard.html` con la estructura HTML base (doctype, viewport meta, contenedor de métricas vacío)
  - [x] 1.4 Crear el archivo `appsscript.json` con la configuración de la Web App (`"access": "ANYONE_ANONYMOUS"`, `"executeAs": "USER_DEPLOYING"`)
  - [x] 1.5 Crear el archivo `package.json` para el entorno de tests con dependencias: `jest`, `fast-check` (versiones exactas)
  - [x] 1.6 Crear la estructura de carpetas `tests/unit/` y `tests/integration/` con archivos `.test.js` vacíos para cada módulo

- [x] 2. Implementación de `setupBaseDatos()`
  - [x] 2.1 Implementar la lógica de creación idempotente de `Hoja_Invitados` con columnas: ID, Nombre, ID_Vinculado, Estado
  - [x] 2.2 Implementar la lógica de creación idempotente de `Hoja_Respuestas` con columnas: ID, Fecha, Enviar_Correo, Correo_Electrónico, Asistentes, Restricciones, Bebida, Canciones, Consejo
  - [x] 2.3 Implementar la lógica de creación idempotente de `Hoja_Dashboard` con fórmulas COUNTA/COUNTIF/SUM en celdas B2:B5
  - [x] 2.4 Escribir test de propiedad (Property 1 — idempotencia): verificar que ejecutar `setupBaseDatos()` dos veces produce el mismo estado que ejecutarla una vez, para cualquier combinación de hojas preexistentes

- [x] 3. Implementación de `doGet(e)` con enrutamiento completo
  - [x] 3.1 Implementar la rama `?page=dashboard`: detectar `e.parameter.page === 'dashboard'`, llamar a `getDashboardData_()`, inyectar métricas en `Dashboard.html` y retornar sin verificar fecha ni ID
  - [x] 3.2 Implementar la verificación de fecha límite para la rama de invitación: comparar `new Date()` con `new Date('2026-06-15T23:59:59-05:00')` y retornar vista `"cerrado"` si se superó
  - [x] 3.3 Implementar la extracción y búsqueda del parámetro `id` en `Hoja_Invitados`; retornar vista `"enlace_invalido"` si el parámetro está ausente
  - [x] 3.4 Implementar el enrutamiento por estado del invitado: `"no_encontrado"` si el ID no existe, `"ya_confirmado"` si Estado = "Confirmado", `"rsvp"` si Estado = "Pendiente"
  - [x] 3.5 Implementar la construcción del objeto `templateData` con `nombre`, `nombreVinculado` (null si no aplica o vinculado ya confirmado), `id` y `vista`
  - [x] 3.6 Escribir test de propiedad (Property 2 — partición por fecha): para cualquier fecha `d`, verificar que exactamente una de las dos condiciones (cerrado / no cerrado) es verdadera
  - [x] 3.7 Escribir test de propiedad (Property 3 — enrutamiento por estado): para cualquier ID, verificar que la vista retornada pertenece al conjunto `{"no_encontrado", "ya_confirmado", "rsvp", "enlace_invalido"}` y que cada condición mapea a exactamente una vista
  - [x] 3.8 Escribir test de propiedad (Property 4 — round-trip de templateData): para cualquier invitado Pendiente, verificar que `templateData.nombre` coincide con el campo `Nombre` en Sheets y que `templateData.nombreVinculado` es correcto según el estado del vinculado

- [x] 4. Implementación de `getDashboardData_()` y `Dashboard.html`
  - [x] 4.1 Implementar `getDashboardData_()`: leer todas las filas de `Hoja_Invitados`, contar por valor del campo `Estado` para obtener `totalConfirmados`, `totalPendientes` y `totalInvitados`
  - [x] 4.2 Implementar la lectura de `Hoja_Respuestas` en `getDashboardData_()`: agrupar filas por campo `Bebida` y por campo `Restricciones` para construir los objetos `porBebida` y `porRestriccion`
  - [x] 4.3 Implementar `Dashboard.html`: tarjetas visuales con números destacados para cada métrica, usando la paleta `#efe1d1` / `#6b8e75` / `#ffffff`, diseño responsivo con CSS Grid o Flexbox
  - [x] 4.4 Conectar `Dashboard.html` con los scriptlets GAS para recibir el objeto de métricas inyectado por `doGet`
  - [x] 4.5 Escribir test de propiedad (Property 12 — invariante de suma del dashboard): para cualquier estado de las hojas, verificar que `totalConfirmados + totalPendientes === totalInvitados`

- [x] 5. Implementación de `guardarConfirmacion(datos)`
  - [x] 5.1 Implementar la validación de `datos.id` contra `Hoja_Invitados`; retornar `{ success: false, error: 'ID de invitado no encontrado' }` si no existe
  - [x] 5.2 Implementar la inserción de fila en `Hoja_Respuestas` con todos los campos, incluyendo timestamp ISO 8601 (`new Date().toISOString()`) y el campo `Canciones` como string separado por comas
  - [x] 5.3 Implementar la actualización del Estado del invitado principal a "Confirmado" en `Hoja_Invitados`
  - [x] 5.4 Implementar la actualización condicional del Estado del invitado vinculado: solo si `datos.confirmarVinculado === true` y el `ID_Vinculado` existe en `Hoja_Invitados`
  - [x] 5.5 Implementar el bloque try/catch para errores de Sheets; retornar `{ success: false, error: 'Error al guardar. Intenta de nuevo.' }` y registrar con `console.error()`
  - [x] 5.6 Escribir test de propiedad (Property 5 — guardado inserta exactamente una fila): para cualquier `datos` con ID válido, verificar que el conteo de filas en `Hoja_Respuestas` incrementa en exactamente 1 y que `success === true`
  - [x] 5.7 Escribir test de propiedad (Property 6 — estado siempre Confirmado tras guardado): para cualquier invitado Pendiente con datos válidos, verificar que el Estado es "Confirmado" después del guardado, incluyendo el vinculado si `confirmarVinculado === true`
  - [x] 5.8 Escribir test de propiedad (Property 7 — ID inválido no modifica Sheets): para cualquier string que no exista como ID, verificar que `success === false`, el conteo de filas no cambia y ningún Estado se modifica

- [x] 6. Implementación de `enviarCorreo(datos)` con QR y .ics
  - [x] 6.1 Implementar `validarEmail_(email)` con regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
  - [x] 6.2 Implementar la construcción de la URL del QR: `https://quickchart.io/qr?text=${encodeURIComponent(datos.id)}&size=200`
  - [x] 6.3 Implementar la generación del contenido .ics como string RFC 5545 con campos: `SUMMARY`, `DTSTART` (20260815T123000), `DTEND` (20260815T190000), `LOCATION`, `DESCRIPTION`
  - [x] 6.4 Implementar el envío con `GmailApp.sendEmail()`: correo HTML con nombre del invitado, fecha, ubicación e imagen QR; adjunto `evento.ics` como `Utilities.newBlob()`
  - [x] 6.5 Implementar el fallback de QR: si `UrlFetchApp.fetch()` lanza excepción, enviar el correo sin imagen QR (texto con el ID en su lugar)
  - [x] 6.6 Escribir test de propiedad (Property 8 — condición de envío de correo): para cualquier combinación `(enviarCorreo: boolean, correo: string)`, verificar que `enviarCorreo()` se invoca si y solo si `enviarCorreo === true` AND el correo pasa la regex de validación

- [x] 7. Implementación del front-end `Index.html` — secciones estáticas
  - [x] 7.1 Implementar la sección `#hero`: textos "Jennifer & Nicolas" y "Sábado, 15 de agosto de 2026", estructura DOM para el contador de cuenta regresiva
  - [x] 7.2 Implementar `initCountdown()`: calcular diferencia entre `Date.now()` y `2026-08-15T12:30:00-05:00`, actualizar DOM cada 1 segundo con `setInterval`, mostrar "¡Hoy es el gran día!" cuando el tiempo llega a cero
  - [x] 7.3 Implementar la sección `#historia`: párrafo introductorio sobre Jennifer y Nicolas, elemento visual placeholder con perro Alaskan Malamute y dos gatos negros
  - [x] 7.4 Implementar la sección `#ubicacion`: nombre "Hacienda Angelus Campestre", dirección, botón de mínimo 48x48px que abre Google Maps en nueva pestaña
  - [x] 7.5 Implementar la sección `#timeline`: lista vertical con los 5 hitos cronológicos (12:30 PM, 1:00 PM, 2:00 PM, 4:00 PM, 7:00 PM), cada uno con icono representativo
  - [x] 7.6 Implementar la sección `#dresscode`: texto "Traje formal / Vestido largo", 3 círculos de color con línea diagonal, tarjetas "Solo adultos" y "Lluvia de sobres"
  - [x] 7.7 Implementar `initIntersectionObserver()`: aplicar clase `fade-in` a secciones cuando entran al viewport con `threshold: 0.2`
  - [x] 7.8 Implementar el CSS completo: paleta `#efe1d1` / `#4a6b55` / `#6b8e75` / `#ffffff`, tipografía sans-serif mínimo 16px, layout responsivo una columna en < 768px, smooth scrolling, botones mínimo 48x48px
  - [x] 7.9 Escribir test de propiedad (Property 9 — cuenta regresiva sin negativos): para cualquier timestamp `ahora`, verificar que los valores `{días, horas, minutos, segundos}` son todos ≥ 0 cuando `ahora < Fecha_Evento`, y que se retorna el estado especial cuando `ahora ≥ Fecha_Evento`

- [x] 8. Implementación del RSVP — checkboxes y formulario dinámico
  - [x] 8.1 Implementar los scriptlets GAS en `Index.html` para recibir `templateData` del servidor e inyectar `nombre`, `nombreVinculado` e `id` en el DOM
  - [x] 8.2 Implementar el saludo personalizado "Hola, [Nombre]" y el checkbox del invitado principal (mínimo 44x44px, etiqueta mínimo 18px)
  - [x] 8.3 Implementar la renderización condicional del checkbox del acompañante: mostrar "¿Confirmarás también por [Nombre]?" solo cuando `nombreVinculado` no es null
  - [x] 8.4 Implementar `initRsvpForm()`: mostrar/ocultar el formulario de preferencias según si al menos un checkbox está seleccionado; validar que al menos un checkbox esté marcado antes del envío
  - [x] 8.5 Implementar los campos del formulario de preferencias: `<select>` de restricciones alimentarias (6 opciones), radio buttons de bebida (4 opciones), `<textarea>` de consejo; todos con altura mínima 48px y tipografía mínimo 16px
  - [x] 8.6 Implementar el opt-in de correo: toggle/checkbox que muestra/oculta el `<input type="email">`; validar presencia y formato del correo si el toggle está activo

- [x] 9. Implementación del buscador de canciones con chips UI
  - [x] 9.1 Implementar el campo de búsqueda con placeholder "Busca una canción para la playlist" y el contenedor `#song-chips` debajo del campo
  - [x] 9.2 Implementar `initItunesSearch()` con debounce de 400ms: al escribir en el campo, esperar 400ms y luego hacer `fetch` a `https://itunes.apple.com/search?term=...&entity=song&limit=8&media=music`
  - [x] 9.3 Implementar el renderizado de la lista flotante: máximo 8 resultados con `results.slice(0, 8)`, cada ítem con carátula del álbum y "Título - Artista"; ocultar la lista si el campo queda vacío
  - [x] 9.4 Implementar la selección de canción: al hacer clic en un ítem de la lista, cerrar la lista flotante, limpiar el campo de búsqueda, agregar la canción al array `selectedSongs[]` y renderizar un chip en `#song-chips`
  - [x] 9.5 Implementar la estructura del chip: `<div class="chip"><span>Nombre - Artista</span><button class="chip-remove" aria-label="Eliminar canción">×</button></div>`
  - [x] 9.6 Implementar el botón "×" del chip: al hacer clic, filtrar `selectedSongs[]` para eliminar esa canción y remover el elemento del DOM sin afectar los demás chips
  - [x] 9.7 Implementar el manejo de errores de iTunes: mostrar "No se encontraron canciones" en la lista flotante si la API retorna error, array vacío o no responde
  - [x] 9.8 Escribir test de propiedad (Property 10 — lista flotante máximo 8): para cualquier respuesta JSON de iTunes con N resultados, verificar que la lista renderizada contiene como máximo 8 elementos `<li>`
  - [x] 9.9 Escribir test de propiedad (Property 13 — serialización de chips): para cualquier array `selectedSongs` de N canciones (N ≥ 0), verificar que `selectedSongs.join(', ')` produce string vacío si N = 0, y exactamente N-1 comas si N > 0

- [x] 10. Implementación de confeti Canvas y estados de carga/éxito/error
  - [x] 10.1 Implementar `submitRsvp()`: recopilar datos del formulario, construir `datos.canciones = selectedSongs.join(', ')`, deshabilitar el botón de envío y mostrar estado de carga ("Enviando...")
  - [x] 10.2 Implementar el `.withSuccessHandler` de `google.script.run`: ocultar el RSVP_Form, mostrar mensaje "¡Tu confirmación fue registrada!" y ejecutar `launchConfetti()`
  - [x] 10.3 Implementar el `.withFailureHandler` de `google.script.run`: mostrar mensaje "Ocurrió un error. Por favor intenta de nuevo o contáctanos por WhatsApp" y rehabilitar el botón de envío
  - [x] 10.4 Implementar `launchConfetti()`: cargar `canvas-confetti` desde CDN de jsDelivr, ejecutar la animación durante mínimo 3 segundos; envolver en try/catch para que un fallo del CDN no interrumpa el flujo de éxito
  - [x] 10.5 Implementar el `#footer` con el botón "SOS WhatsApp" (mínimo 48px, texto mínimo 16px) que abre `https://wa.me/573213837837?text=Hola,%20tengo%20problemas%20para%20confirmar%20mi%20asistencia%20a%20la%20boda` en nueva pestaña

- [x] 11. Tests de propiedades (fast-check)
  - [x] 11.1 Completar `tests/unit/setupBaseDatos.test.js`: test de Property 1 con mocks de SpreadsheetApp; verificar idempotencia para las 8 combinaciones posibles de hojas preexistentes (2³)
  - [x] 11.2 Completar `tests/unit/dateControl.test.js`: test de Property 2 con `fc.date()` generando fechas arbitrarias; verificar partición exhaustiva y mutuamente excluyente
  - [x] 11.3 Completar `tests/unit/routing.test.js`: tests de Properties 3 y 4 con `fc.record()` generando objetos de invitado arbitrarios; verificar enrutamiento correcto y round-trip de templateData
  - [x] 11.4 Completar `tests/unit/guardarConfirmacion.test.js`: tests de Properties 5, 6 y 7 con mocks de Sheets; verificar conteo de filas, cambio de estado y comportamiento con IDs inválidos
  - [x] 11.5 Completar `tests/unit/enviarCorreo.test.js`: test de Property 8 con `fc.boolean()` y `fc.string()` generando combinaciones arbitrarias de `enviarCorreo` y `correo`; verificar condición booleana pura
  - [x] 11.6 Completar `tests/unit/countdown.test.js`: test de Property 9 con `fc.date()` generando timestamps arbitrarios; verificar que ningún valor es negativo y que el estado especial se activa correctamente
  - [x] 11.7 Completar `tests/unit/itunesSearch.test.js`: tests de Properties 10 y 13; Property 10 con `fc.array(fc.record(...), { maxLength: 50 })` verificando `slice(0, 8)`; Property 13 con `fc.array(fc.string(), { maxLength: 20 })` verificando conteo de comas
  - [x] 11.8 Completar `tests/unit/dashboard.test.js`: test de Property 12 con `fc.array()` generando filas arbitrarias de Hoja_Invitados; verificar invariante `totalConfirmados + totalPendientes === totalInvitados`
  - [x] 11.9 Completar `tests/unit/contrast.test.js`: test de Property 11 verificando los 3 pares de colores definidos en el diseño contra el umbral WCAG 4.5:1

- [x] 12. Tests de integración contra Spreadsheet de staging
  - [x] 12.1 Implementar `tests/integration/sheets.integration.test.js`: ejecutar `setupBaseDatos()` contra un Spreadsheet de staging real y verificar que las 3 hojas existen con los encabezados correctos; ejecutar `guardarConfirmacion()` con datos reales y verificar que la fila aparece en `Hoja_Respuestas`
  - [x] 12.2 Implementar `tests/integration/dashboard.integration.test.js`: insertar filas de prueba en el Spreadsheet de staging, llamar a `getDashboardData_()` y verificar que las métricas retornadas coinciden con los datos insertados; verificar la invariante de suma en datos reales
  - [x] 12.3 Implementar `tests/integration/email.integration.test.js`: ejecutar `enviarCorreo()` con una cuenta de correo de prueba y verificar la recepción del correo con imagen QR y adjunto `.ics` válido (campos RFC 5545 presentes)
