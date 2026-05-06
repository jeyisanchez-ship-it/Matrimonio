# Documento de Requisitos

## Introducción

Este documento describe los requisitos para una invitación de boda digital interactiva y de alta gama, construida como una Web App de Google Apps Script (GAS). La aplicación permite a los invitados confirmar su asistencia (RSVP) de forma personalizada por grupo, seleccionar preferencias, buscar canciones y recibir un pase de acceso digital por correo. El back-end gestiona la persistencia en Google Sheets, el envío de correos HTML con código QR y la generación de archivos de calendario (.ics). La interfaz está optimizada para adultos mayores y dispositivos móviles.

---

## Glosario

- **GAS**: Google Apps Script — plataforma de scripting en la nube de Google.
- **Web_App**: La aplicación web publicada mediante `doGet(e)` en GAS.
- **Spreadsheet**: El Google Sheets asociado al proyecto GAS que actúa como base de datos.
- **Hoja_Invitados**: Pestaña del Spreadsheet con columnas ID, Nombre, ID_Vinculado, Estado.
- **Hoja_Respuestas**: Pestaña del Spreadsheet con columnas ID, Fecha, Enviar_Correo, Correo_Electrónico, Asistentes, Restricciones, Bebida, Canciones, Consejo.
- **Hoja_Dashboard**: Pestaña del Spreadsheet con fórmulas automáticas de totales y estadísticas.
- **Invitado**: Persona identificada por un ID único en la Hoja_Invitados. Cada fila representa a un individuo.
- **ID_Vinculado**: Campo opcional en la Hoja_Invitados que contiene el ID de otro Invitado con quien se confirma en conjunto. El vínculo es unidireccional: el Invitado principal referencia al acompañante.
- **Estado**: Campo en Hoja_Invitados que puede tomar los valores "Pendiente" o "Confirmado".
- **RSVP_Form**: Formulario interactivo en el front-end para confirmar asistencia.
- **Pase_de_Acceso**: Correo HTML enviado al invitado con código QR y archivo .ics adjunto.
- **QR_API**: Servicio externo QuickChart (https://quickchart.io) usado para generar imágenes de código QR.
- **iTunes_API**: API pública de iTunes (https://itunes.apple.com/search) usada para buscar canciones.
- **Fecha_Límite**: 15 de junio de 2026 — fecha de cierre de confirmaciones.
- **Fecha_Evento**: Sábado 15 de agosto de 2026.
- **Ubicación_Evento**: Hacienda Angelus Campestre — Vía Guaymaral, Cl. 235 #Km 5, Bogotá.
- **SOS_WhatsApp**: Enlace de soporte técnico a https://wa.me/573213837837.
- **Confeti_Canvas**: Animación de confeti implementada con la API Canvas de HTML5.
- **Debounce**: Técnica que retrasa la ejecución de una función hasta que el usuario deja de escribir por un intervalo definido.
- **Chip_Canción**: Elemento visual (etiqueta interactiva) que representa una canción seleccionada por el invitado, con botón "×" para eliminarla individualmente.
- **Dashboard_View**: Vista de métricas en tiempo real para organizadores, accesible mediante el parámetro `?page=dashboard` en la URL, que muestra totales y estadísticas calculadas directamente desde el Spreadsheet.

---

## Requisitos

### Requisito 1: Inicialización de la Base de Datos

**User Story:** Como administrador de la boda, quiero ejecutar una función de configuración manual para que el Spreadsheet quede listo con todas las pestañas y columnas necesarias antes de publicar la Web_App.

#### Criterios de Aceptación

1. THE Web_App SHALL exponer una función `setupBaseDatos()` ejecutable manualmente desde el editor de GAS.
2. WHEN `setupBaseDatos()` es ejecutada, THE Web_App SHALL crear la Hoja_Invitados con las columnas: ID, Nombre, ID_Vinculado, Estado.
3. WHEN `setupBaseDatos()` es ejecutada, THE Web_App SHALL crear la Hoja_Respuestas con las columnas: ID, Fecha, Enviar_Correo, Correo_Electrónico, Asistentes, Restricciones, Bebida, Canciones, Consejo.
4. WHEN `setupBaseDatos()` es ejecutada, THE Web_App SHALL crear la Hoja_Dashboard con fórmulas automáticas que calculen: total de invitados, total confirmados, total pendientes y total de asistentes confirmados.
5. IF la Hoja_Invitados, Hoja_Respuestas o Hoja_Dashboard ya existen, THEN THE Web_App SHALL omitir su creación sin lanzar un error.

---

### Requisito 2: Control de Acceso por Fecha Límite

**User Story:** Como organizador de la boda, quiero que la Web_App deje de aceptar confirmaciones después del 15 de junio de 2026, para que no se registren respuestas fuera de plazo.

#### Criterios de Aceptación

1. WHEN un Invitado accede a la Web_App y la fecha actual es posterior al 15 de junio de 2026, THE Web_App SHALL mostrar una vista de "Cierre de confirmaciones" en lugar del RSVP_Form.
2. WHILE la vista de "Cierre de confirmaciones" está activa, THE Web_App SHALL mostrar un botón que redirija al SOS_WhatsApp.
3. WHEN un Invitado accede a la Web_App y la fecha actual es igual o anterior al 15 de junio de 2026, THE Web_App SHALL procesar la solicitud de RSVP normalmente.

---

### Requisito 3: Identificación y Enrutamiento del Invitado

**User Story:** Como invitado, quiero que la Web_App me reconozca por mi ID único en la URL para que vea mi información personalizada y no la de otro grupo.

#### Criterios de Aceptación

1. WHEN `doGet(e)` es invocada con un parámetro `id` en la URL, THE Web_App SHALL buscar el ID en la Hoja_Invitados.
2. IF el ID no existe en la Hoja_Invitados, THEN THE Web_App SHALL mostrar una vista de "Invitación no encontrada" con el botón SOS_WhatsApp.
3. WHEN el ID existe y el Estado del Invitado es "Confirmado", THE Web_App SHALL mostrar una vista de "Ya confirmaste tu asistencia" con el botón SOS_WhatsApp.
4. WHEN el ID existe y el Estado del Invitado es "Pendiente", THE Web_App SHALL retornar al front-end el campo Nombre del Invitado principal para personalizar el RSVP_Form.
5. WHEN el ID existe, el Estado del Invitado es "Pendiente" y el campo ID_Vinculado contiene un ID válido cuyo Estado también es "Pendiente", THE Web_App SHALL retornar adicionalmente al front-end el Nombre del Invitado vinculado.
6. IF el parámetro `id` está ausente en la URL, THEN THE Web_App SHALL mostrar una vista de "Enlace inválido" con el botón SOS_WhatsApp.

---

### Requisito 4: Guardado de Confirmación

**User Story:** Como invitado, quiero que mi confirmación quede registrada en la base de datos para que los organizadores puedan planificar el evento con información precisa.

#### Criterios de Aceptación

1. WHEN `guardarConfirmacion(datos)` es invocada con datos válidos, THE Web_App SHALL insertar una nueva fila en la Hoja_Respuestas con los campos: ID, Fecha (timestamp ISO 8601), Enviar_Correo, Correo_Electrónico, Asistentes, Restricciones, Bebida, Canción, Consejo.
2. WHEN `guardarConfirmacion(datos)` es invocada exitosamente, THE Web_App SHALL actualizar el Estado del Invitado principal en la Hoja_Invitados a "Confirmado".
3. WHEN `guardarConfirmacion(datos)` es invocada y el campo `confirmarVinculado` es `true`, THE Web_App SHALL actualizar también el Estado del Invitado vinculado (ID_Vinculado) en la Hoja_Invitados a "Confirmado".
4. IF `guardarConfirmacion(datos)` recibe un ID que no existe en la Hoja_Invitados, THEN THE Web_App SHALL retornar un objeto de error con el mensaje "ID de invitado no encontrado" sin modificar la Hoja_Respuestas.
5. IF `guardarConfirmacion(datos)` recibe un campo Asistentes vacío o con valor cero, THEN THE Web_App SHALL registrar la respuesta con Asistentes igual a cero e indicar que el grupo no asistirá.
6. THE Web_App SHALL retornar un objeto JSON con el campo `success: true` cuando el guardado sea exitoso.

---

### Requisito 5: Envío del Pase de Acceso por Correo

**User Story:** Como invitado, quiero recibir un correo con mi pase de acceso y el evento en mi calendario para llegar preparado el día de la boda.

#### Criterios de Aceptación

1. WHEN `guardarConfirmacion(datos)` es invocada y el campo Enviar_Correo es `true` y el campo Correo_Electrónico contiene una dirección de correo con formato válido (contiene "@" y un dominio), THE Web_App SHALL invocar `enviarCorreo(datos)`.
2. IF el campo Enviar_Correo es `false` o el campo Correo_Electrónico está vacío o tiene formato inválido, THEN THE Web_App SHALL omitir el envío de correo sin lanzar un error.
3. WHEN `enviarCorreo(datos)` es invocada, THE Web_App SHALL enviar un correo HTML al Correo_Electrónico del Invitado usando GmailApp con: nombre del invitado, fecha del evento, ubicación del evento e imagen de código QR generada por la QR_API.
4. WHEN `enviarCorreo(datos)` es invocada, THE Web_App SHALL adjuntar al correo un archivo `evento.ics` con los campos: SUMMARY (nombre del evento), DTSTART (Fecha_Evento en formato iCalendar), DTEND (hora de fin del evento), LOCATION (Ubicación_Evento), DESCRIPTION (mensaje de bienvenida).
5. IF GmailApp lanza una excepción durante el envío, THEN THE Web_App SHALL registrar el error en el log de GAS y retornar `success: true` al front-end sin interrumpir el flujo del usuario.

---

### Requisito 6: Sección Hero y Cuenta Regresiva

**User Story:** Como invitado, quiero ver los nombres de los novios, la fecha del evento y un contador en tiempo real para sentir la emoción de la boda desde el primer momento.

#### Criterios de Aceptación

1. THE Web_App SHALL mostrar en la sección Hero los textos "Jennifer & Leonardo" y "Sábado, 15 de agosto de 2026".
2. THE Web_App SHALL mostrar un contador de cuenta regresiva que calcule los días, horas, minutos y segundos restantes hasta las 12:30 PM del 15 de agosto de 2026 (hora de Colombia, UTC-5).
3. WHILE la Fecha_Evento no ha llegado, THE Web_App SHALL actualizar el contador cada 1 segundo.
4. WHEN la Fecha_Evento ha llegado o pasado, THE Web_App SHALL reemplazar el contador con el texto "¡Hoy es el gran día!".

---

### Requisito 7: Sección Historia

**User Story:** Como invitado, quiero conocer la historia de la pareja para conectar emocionalmente con la invitación.

#### Criterios de Aceptación

1. THE Web_App SHALL mostrar en la sección Historia un párrafo introductorio sobre Jennifer y Leonardo.
2. THE Web_App SHALL mostrar en la sección Historia un elemento visual (imagen o ilustración placeholder) que represente a la pareja con un perro Alaskan Malamute y dos gatos negros.
3. THE Web_App SHALL aplicar una animación de fade-in a la sección Historia cuando el usuario la desplace a la vista (Intersection Observer).

---

### Requisito 8: Sección Ubicación

**User Story:** Como invitado, quiero ver la dirección del evento y acceder fácilmente a las indicaciones para llegar sin inconvenientes.

#### Criterios de Aceptación

1. THE Web_App SHALL mostrar en la sección Ubicación el nombre "Hacienda Angelus Campestre" y la dirección "Vía Guaymaral, Cl. 235 #Km 5, Bogotá".
2. THE Web_App SHALL mostrar un botón de tamaño mínimo 48x48px que abra Google Maps con la ubicación del evento en una nueva pestaña.
3. THE Web_App SHALL aplicar una animación de fade-in a la sección Ubicación cuando el usuario la desplace a la vista.

---

### Requisito 9: Línea de Tiempo del Evento

**User Story:** Como invitado, quiero ver el programa del día en un formato visual claro para saber qué esperar y cuándo.

#### Criterios de Aceptación

1. THE Web_App SHALL mostrar una línea de tiempo vertical con los siguientes hitos en orden cronológico: 12:30 PM Bienvenida, 1:00 PM Ceremonia, 2:00 PM Fotos y Cóctel, 4:00 PM Almuerzo, 7:00 PM Fin.
2. THE Web_App SHALL mostrar un icono representativo junto a cada hito de la línea de tiempo.
3. THE Web_App SHALL aplicar una animación de fade-in a cada elemento de la línea de tiempo cuando el usuario lo desplace a la vista.

---

### Requisito 10: Sección Dress Code e Información Adicional

**User Story:** Como invitado, quiero conocer el código de vestimenta y las indicaciones especiales para asistir correctamente al evento.

#### Criterios de Aceptación

1. THE Web_App SHALL mostrar el texto "Traje formal / Vestido largo" como indicación de dress code.
2. THE Web_App SHALL mostrar 3 círculos de color (Blanco #ffffff, Crema #efe1d1, Verde #6b8e75) con una línea diagonal superpuesta que indique que esos colores están reservados para los novios.
3. THE Web_App SHALL mostrar una tarjeta con el texto "Solo adultos" indicando que el evento no admite menores de edad.
4. THE Web_App SHALL mostrar una tarjeta con el texto "Lluvia de sobres" indicando la preferencia de regalo.

---

### Requisito 11: RSVP — Confirmación Individual con Acompañante Vinculado

**User Story:** Como invitado, quiero confirmar mi asistencia de forma individual y, si aplica, confirmar también por mi acompañante vinculado, para que los organizadores tengan un conteo exacto por persona.

#### Criterios de Aceptación

1. WHEN el RSVP_Form es cargado con datos de un Invitado, THE Web_App SHALL mostrar un saludo personalizado estrictamente individual con el texto "Hola, [Nombre]" usando el Nombre del Invitado principal.
2. THE Web_App SHALL mostrar un checkbox de tamaño prominente (mínimo 44x44px) para que el Invitado principal confirme su propia asistencia.
3. WHEN el back-end retorna el Nombre de un Invitado vinculado (porque el ID_Vinculado existe y su Estado es "Pendiente"), THE Web_App SHALL mostrar la pregunta "¿Confirmarás también por [Nombre del Acompañante]?" con un checkbox independiente para ese acompañante.
4. WHEN el back-end no retorna un Invitado vinculado, THE Web_App SHALL mostrar únicamente el checkbox del Invitado principal sin sección de acompañante.
5. THE Web_App SHALL renderizar cada checkbox con un tamaño mínimo de 44x44px y una etiqueta de texto de mínimo 18px.
6. WHEN ningún checkbox está seleccionado y el usuario intenta enviar el formulario, THE Web_App SHALL mostrar un mensaje de validación "Por favor indica si asistirás" sin enviar los datos.
7. WHEN el usuario envía el formulario, THE Web_App SHALL incluir en los datos enviados a `guardarConfirmacion` el campo `confirmarVinculado: true` si el checkbox del acompañante está marcado, o `confirmarVinculado: false` en caso contrario.

---

### Requisito 12: RSVP — Formulario Dinámico de Preferencias

**User Story:** Como invitado que confirmará asistencia, quiero completar mis preferencias de comida, bebida y canción para que los organizadores puedan personalizar mi experiencia.

#### Criterios de Aceptación

1. WHEN al menos un checkbox de asistente está seleccionado, THE Web_App SHALL mostrar el formulario de preferencias con los campos: opt-in de correo, restricciones alimentarias, preferencia de bebida, buscador de canciones y buzón de sabiduría.
2. WHEN ningún checkbox de asistente está seleccionado, THE Web_App SHALL ocultar el formulario de preferencias.
3. THE Web_App SHALL mostrar el campo de restricciones alimentarias como un elemento `<select>` con las opciones: Ninguna, Vegetariano, Vegano, Sin gluten, Sin lactosa, Otro.
4. THE Web_App SHALL mostrar la preferencia de bebida como radio buttons con las opciones: Vino, Whisky, Tequila, Sin alcohol.
5. THE Web_App SHALL mostrar el buzón de sabiduría como un `<textarea>` con el placeholder "Déjanos tu mejor consejo para un matrimonio feliz".
6. THE Web_App SHALL renderizar todos los controles del formulario con altura mínima de 48px y tipografía de mínimo 16px.

---

### Requisito 13: RSVP — Opt-in de Correo Electrónico

**User Story:** Como invitado, quiero decidir si recibo mi pase de acceso por correo para no recibir comunicaciones no deseadas.

#### Criterios de Aceptación

1. THE Web_App SHALL mostrar un toggle o checkbox con el texto "¿Deseas recibir tu pase de acceso y el calendario en tu correo?" dentro del formulario de preferencias.
2. WHEN el toggle de correo está desactivado, THE Web_App SHALL ocultar el campo de input de correo electrónico.
3. WHEN el toggle de correo es activado, THE Web_App SHALL mostrar el campo de input de correo electrónico con el atributo `type="email"`.
4. IF el toggle de correo está activado y el campo de correo electrónico está vacío al momento del envío, THEN THE Web_App SHALL mostrar el mensaje de validación "Por favor ingresa tu correo electrónico" sin enviar los datos.
5. IF el toggle de correo está activado y el campo de correo electrónico contiene un formato inválido al momento del envío, THEN THE Web_App SHALL mostrar el mensaje de validación "Por favor ingresa un correo electrónico válido" sin enviar los datos.

---

### Requisito 14: RSVP — Buscador de Canciones con UI de Chips (Selección Múltiple)

**User Story:** Como invitado, quiero buscar y agregar múltiples canciones para la playlist de la boda usando una interfaz de etiquetas visuales (chips) para contribuir con varias canciones favoritas.

#### Criterios de Aceptación

1. THE Web_App SHALL mostrar un campo de texto para buscar canciones con el placeholder "Busca una canción para la playlist".
2. WHEN el usuario escribe en el campo de búsqueda, THE Web_App SHALL esperar 400 milisegundos (Debounce) antes de consultar la iTunes_API con el término ingresado.
3. WHEN la iTunes_API retorna resultados, THE Web_App SHALL mostrar una lista flotante con un máximo de 8 resultados, cada uno con la carátula del álbum y el título de la canción con el nombre del artista.
4. WHEN el usuario selecciona un resultado de la lista flotante, THE Web_App SHALL cerrar la lista flotante, limpiar el campo de búsqueda y agregar la canción seleccionada como un Chip_Canción debajo del campo de búsqueda.
5. THE Web_App SHALL renderizar cada Chip_Canción con el nombre de la canción y un botón "×" para eliminarla individualmente.
6. WHEN el usuario presiona el botón "×" de un Chip_Canción, THE Web_App SHALL eliminar ese chip de la lista sin afectar los demás chips.
7. THE Web_App SHALL permitir agregar múltiples canciones repitiendo el proceso de búsqueda y selección.
8. WHEN el usuario envía el formulario RSVP, THE Web_App SHALL recopilar los valores de todos los chips activos, concatenarlos en un string separado por comas y enviar esa cadena en el campo `canciones` a `guardarConfirmacion`.
9. IF la iTunes_API retorna un error o no retorna resultados, THEN THE Web_App SHALL mostrar el mensaje "No se encontraron canciones" en la lista flotante.
10. IF el campo de búsqueda queda vacío, THEN THE Web_App SHALL ocultar la lista flotante.

---

### Requisito 15: RSVP — Envío y Retroalimentación Visual

**User Story:** Como invitado, quiero recibir una confirmación visual clara al enviar mi RSVP para saber que mi respuesta fue registrada correctamente.

#### Criterios de Aceptación

1. WHEN el usuario presiona el botón de envío del RSVP_Form, THE Web_App SHALL mostrar un indicador de estado de carga (spinner o texto "Enviando...") y deshabilitar el botón de envío para evitar envíos duplicados.
2. WHEN `guardarConfirmacion(datos)` retorna `success: true`, THE Web_App SHALL ocultar el RSVP_Form y mostrar un mensaje de éxito con el texto "¡Tu confirmación fue registrada!".
3. WHEN `guardarConfirmacion(datos)` retorna `success: true`, THE Web_App SHALL ejecutar la animación Confeti_Canvas durante un mínimo de 3 segundos.
4. IF `guardarConfirmacion(datos)` retorna un error, THEN THE Web_App SHALL mostrar un mensaje de error con el texto "Ocurrió un error. Por favor intenta de nuevo o contáctanos por WhatsApp" y rehabilitar el botón de envío.

---

### Requisito 16: Accesibilidad para Adultos Mayores

**User Story:** Como invitado mayor de 60 años, quiero que la interfaz sea fácil de leer y usar desde mi teléfono para confirmar mi asistencia sin dificultades.

#### Criterios de Aceptación

1. THE Web_App SHALL usar una tipografía sans-serif con tamaño mínimo de 16px para texto de cuerpo y mínimo 18px para etiquetas de formulario.
2. THE Web_App SHALL aplicar la paleta de colores: fondo crema (#efe1d1), acentos verde eucalipto (#6b8e75), tarjetas blancas (#ffffff).
3. THE Web_App SHALL garantizar una relación de contraste mínima de 4.5:1 entre el texto y su fondo en todos los elementos interactivos, conforme a WCAG 2.1 nivel AA.
4. THE Web_App SHALL renderizar todos los botones de acción principal con altura mínima de 48px y ancho mínimo de 48px.
5. THE Web_App SHALL aplicar smooth scrolling al navegar entre secciones de la página.
6. THE Web_App SHALL aplicar animaciones de fade-in a las secciones al entrar en el viewport, usando Intersection Observer con un umbral del 20%.

---

### Requisito 17: Soporte Técnico vía WhatsApp

**User Story:** Como invitado con dificultades técnicas, quiero acceder rápidamente a soporte por WhatsApp para resolver mi problema sin frustración.

#### Criterios de Aceptación

1. THE Web_App SHALL mostrar un botón "SOS WhatsApp" en el footer de la página en todas las vistas.
2. WHEN el usuario presiona el botón "SOS WhatsApp", THE Web_App SHALL abrir el enlace `https://wa.me/573213837837?text=Hola,%20tengo%20problemas%20para%20confirmar%20mi%20asistencia%20a%20la%20boda` en una nueva pestaña.
3. THE Web_App SHALL renderizar el botón "SOS WhatsApp" con altura mínima de 48px y texto de mínimo 16px.

---

### Requisito 18: Diseño Responsivo

**User Story:** Como invitado que accede desde un teléfono móvil, quiero que la invitación se vea correctamente en mi pantalla para tener una experiencia fluida.

#### Criterios de Aceptación

1. THE Web_App SHALL usar un layout de una sola columna en pantallas con ancho menor a 768px.
2. THE Web_App SHALL escalar imágenes, botones y tipografía de forma fluida usando unidades relativas (rem, %, vw) para adaptarse a pantallas entre 320px y 1440px de ancho.
3. THE Web_App SHALL pasar la prueba de usabilidad móvil de Google (viewport meta tag configurado con `width=device-width, initial-scale=1`).

---

### Requisito 19: Dashboard de Métricas en Tiempo Real

**User Story:** Como organizador de la boda, quiero acceder a un dashboard de métricas en tiempo real visitando la URL con `?page=dashboard` para ver el estado de las confirmaciones sin necesidad de abrir Google Sheets.

#### Criterios de Aceptación

1. WHEN `doGet(e)` recibe el parámetro `?page=dashboard` en la URL, THE Web_App SHALL retornar la Dashboard_View en lugar de la invitación.
2. THE Dashboard_View SHALL mostrar las siguientes métricas calculadas leyendo directamente las hojas del Spreadsheet: Total de invitados confirmados, Total de invitados pendientes, Conteo agrupado por preferencia de bebida (Vino, Whisky, Tequila, Sin alcohol), Conteo agrupado por restricción alimentaria.
3. THE Dashboard_View SHALL usar la misma paleta de colores que la invitación (fondo crema #efe1d1, acentos verde #6b8e75, tarjetas blancas #ffffff).
4. THE Dashboard_View SHALL ser responsiva y funcionar correctamente en pantallas móviles y de escritorio.
5. THE Dashboard_View SHALL mostrar los datos en tiempo real (calculados en el momento de la solicitud, sin caché).
6. IF el parámetro `?page=dashboard` está presente, THEN THE Web_App SHALL omitir todas las verificaciones de ID de invitado y fecha límite.
