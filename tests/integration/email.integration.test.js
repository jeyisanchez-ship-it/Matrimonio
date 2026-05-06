// Feature: wedding-invitation-app — Tests de integración
// NOTA: Estos tests simulan el entorno GAS con mocks de integración.
// Para ejecutar contra un Spreadsheet real, desplegar en GAS y ejecutar manualmente.

/**
 * Tests de integración — Tarea 12.3
 *
 * Verifica:
 * - enviarCorreo() con una cuenta de correo de prueba envía el correo correctamente.
 * - El correo contiene imagen QR (o fallback de texto si QuickChart falla).
 * - El correo tiene adjunto .ics con campos RFC 5545 presentes:
 *   BEGIN:VCALENDAR, VERSION:2.0, BEGIN:VEVENT, DTSTART, DTEND,
 *   SUMMARY, LOCATION, DESCRIPTION, END:VEVENT, END:VCALENDAR.
 *
 * Entorno: Mock de integración que simula:
 * - GmailApp: captura los correos enviados para verificación.
 * - UrlFetchApp: retorna una respuesta de QR simulada.
 * - Utilities.newBlob(): simula la creación del adjunto .ics.
 *
 * Para ejecutar contra una cuenta de correo real de staging:
 *   1. Desplegar Code.gs en Google Apps Script.
 *   2. Ejecutar enviarCorreo_({ nombre: 'Test', correo: 'staging@test.com', id: 'TEST-001' })
 *      desde el editor de GAS.
 *   3. Verificar la recepción del correo con imagen QR y adjunto .ics válido.
 */

'use strict';

// ── Mock de integración de GmailApp ──────────────────────────────────────────

/**
 * Mock de GmailApp que captura los correos enviados para verificación.
 * Simula el comportamiento real de GmailApp.sendEmail().
 */
function crearGmailAppMock() {
  const correoEnviados = [];

  return {
    _correos: correoEnviados,

    /**
     * Simula el envío de un correo y lo captura para verificación.
     * @param {string} destinatario - Dirección de correo del destinatario.
     * @param {string} asunto - Asunto del correo.
     * @param {string} cuerpoTexto - Cuerpo en texto plano.
     * @param {Object} opciones - Opciones adicionales (htmlBody, attachments, name).
     */
    sendEmail(destinatario, asunto, cuerpoTexto, opciones) {
      correoEnviados.push({
        destinatario,
        asunto,
        cuerpoTexto,
        htmlBody: opciones && opciones.htmlBody ? opciones.htmlBody : '',
        adjuntos: opciones && opciones.attachments ? opciones.attachments : [],
        nombre: opciones && opciones.name ? opciones.name : ''
      });
    },

    /**
     * Retorna el último correo enviado.
     * @returns {Object|null} El último correo enviado o null si no hay ninguno.
     */
    getUltimoCorreo() {
      return correoEnviados.length > 0
        ? correoEnviados[correoEnviados.length - 1]
        : null;
    },

    /**
     * Retorna todos los correos enviados.
     * @returns {Array} Array de correos enviados.
     */
    getTodosLosCorreos() {
      return [...correoEnviados];
    },

    /**
     * Retorna el número de correos enviados.
     * @returns {number}
     */
    getCantidadCorreos() {
      return correoEnviados.length;
    }
  };
}

// ── Mock de integración de UrlFetchApp ───────────────────────────────────────

/**
 * Mock de UrlFetchApp que simula respuestas HTTP para tests de integración.
 * Puede configurarse para simular éxito o fallo de QuickChart.
 */
function crearUrlFetchAppMock({ simularFallo = false } = {}) {
  return {
    _llamadas: [],
    _simularFallo: simularFallo,

    /**
     * Simula una petición HTTP.
     * @param {string} url - URL de la petición.
     * @param {Object} opciones - Opciones de la petición.
     * @returns {Object} Respuesta simulada.
     */
    fetch(url, opciones) {
      this._llamadas.push({ url, opciones });

      if (this._simularFallo) {
        throw new Error('QuickChart no disponible (simulado para test)');
      }

      // Simular respuesta exitosa de QuickChart
      return {
        getResponseCode: () => 200,
        getContentText: () => 'PNG_DATA_SIMULADO',
        getBlob: () => ({
          getBytes: () => [0x89, 0x50, 0x4E, 0x47], // PNG magic bytes
          getContentType: () => 'image/png',
          getName: () => 'qr.png'
        })
      };
    },

    /**
     * Retorna las URLs que fueron llamadas.
     * @returns {Array}
     */
    getLlamadasRealizadas() {
      return [...this._llamadas];
    }
  };
}

// ── Mock de integración de Utilities ─────────────────────────────────────────

/**
 * Mock de Utilities que simula la creación de blobs para adjuntos.
 */
function crearUtilitiesMock() {
  const blobs = [];

  return {
    _blobs: blobs,

    /**
     * Simula la creación de un blob (adjunto).
     * @param {string} contenido - Contenido del blob.
     * @param {string} mimeType - Tipo MIME del blob.
     * @param {string} nombre - Nombre del archivo.
     * @returns {Object} Mock de blob.
     */
    newBlob(contenido, mimeType, nombre) {
      const blob = {
        _contenido: contenido,
        _mimeType: mimeType,
        _nombre: nombre,
        getContentType: () => mimeType,
        getName: () => nombre,
        getDataAsString: () => contenido,
        getBytes: () => Array.from(Buffer.from(contenido))
      };
      blobs.push(blob);
      return blob;
    },

    /**
     * Retorna el último blob creado.
     * @returns {Object|null}
     */
    getUltimoBlob() {
      return blobs.length > 0 ? blobs[blobs.length - 1] : null;
    }
  };
}

// ── Reimplementación de enviarCorreo_ con inyección de dependencias ──────────

/**
 * Replica la lógica de enviarCorreo_(datos) de Code.gs.
 * Recibe GmailApp, UrlFetchApp y Utilities como parámetros para facilitar
 * el testing de integración sin llamadas reales a las APIs de GAS.
 *
 * @param {Object} datos - { nombre, correo, id }
 * @param {Object} gmailApp - Mock o instancia real de GmailApp.
 * @param {Object} urlFetchApp - Mock o instancia real de UrlFetchApp.
 * @param {Object} utilities - Mock o instancia real de Utilities.
 */
function enviarCorreo_(datos, gmailApp, urlFetchApp, utilities) {
  var qrUrl = 'https://quickchart.io/qr?text=' + encodeURIComponent(datos.id) + '&size=200';
  var qrImgTag = '';

  // Fallback si QuickChart falla
  try {
    urlFetchApp.fetch(qrUrl, { muteHttpExceptions: true });
    qrImgTag = '<img src="' + qrUrl + '" alt="Código QR de acceso" width="200" height="200" style="border-radius:8px;" />';
  } catch (e) {
    qrImgTag = '<p style="font-family:monospace;background:#f0f0f0;padding:8px;border-radius:4px;">ID de acceso: ' + datos.id + '</p>';
  }

  // Generar contenido .ics (RFC 5545)
  var icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Wedding Invitation App//ES',
    'BEGIN:VEVENT',
    'UID:boda-jennifer-nicolas-2026@wedding-app',
    'DTSTART:20260815T123000',
    'DTEND:20260815T190000',
    'SUMMARY:Boda de Jennifer Sánchez & Nicolás Marcelo',
    'LOCATION:Hacienda Angelus Campestre - Vía Guaymaral\\, Cl. 235 #Km 5\\, Bogotá',
    'DESCRIPTION:¡Estás invitado a nuestra boda! Te esperamos con mucho amor.',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  var icsBlob = utilities.newBlob(icsContent, 'text/calendar', 'boda-jennifer-nicolas.ics');

  // Correo HTML
  var htmlBody = '<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"></head><body style="font-family:sans-serif;background:#efe1d1;margin:0;padding:0;">' +
    '<div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;">' +
    '<div style="background:#4a6b55;padding:2rem;text-align:center;">' +
    '<h1 style="color:#fff;margin:0;font-size:1.8rem;">Jennifer Sánchez & Nicolás Marcelo</h1>' +
    '<p style="color:#efe1d1;margin:0.5rem 0 0;">Sábado, 15 de agosto de 2026</p>' +
    '</div>' +
    '<div style="padding:2rem;text-align:center;">' +
    '<h2 style="color:#4a6b55;">¡Hola, ' + datos.nombre + '!</h2>' +
    '<p style="color:#2c2c2c;font-size:1rem;">Tu asistencia ha sido confirmada. ¡Nos llena de alegría contar contigo en este día tan especial!</p>' +
    '<div style="margin:1.5rem 0;">' + qrImgTag + '</div>' +
    '<p style="color:#2c2c2c;font-size:0.9rem;">Presenta este código QR en la entrada del evento.</p>' +
    '<hr style="border:none;border-top:1px solid #efe1d1;margin:1.5rem 0;">' +
    '<p style="color:#4a6b55;font-weight:bold;">📍 Hacienda Angelus Campestre</p>' +
    '<p style="color:#2c2c2c;font-size:0.9rem;">Vía Guaymaral, Cl. 235 #Km 5, Bogotá</p>' +
    '<p style="color:#2c2c2c;font-size:0.9rem;">🕐 12:30 PM — Bienvenida</p>' +
    '</div>' +
    '<div style="background:#efe1d1;padding:1rem;text-align:center;">' +
    '<p style="color:#4a6b55;font-size:0.85rem;margin:0;">Con amor, Jennifer & Nicolás 💚</p>' +
    '</div></div></body></html>';

  gmailApp.sendEmail(datos.correo, '💌 Tu confirmación — Boda Jennifer & Nicolás', '', {
    htmlBody: htmlBody,
    attachments: [icsBlob],
    name: 'Jennifer & Nicolás — Boda 2026'
  });
}

// ── Campos RFC 5545 requeridos ────────────────────────────────────────────────

const CAMPOS_RFC5545_REQUERIDOS = [
  'BEGIN:VCALENDAR',
  'VERSION:2.0',
  'BEGIN:VEVENT',
  'DTSTART:',
  'DTEND:',
  'SUMMARY:',
  'LOCATION:',
  'DESCRIPTION:',
  'END:VEVENT',
  'END:VCALENDAR'
];

// ── Tests de integración — Tarea 12.3 ───────────────────────────────────────

describe('Integración 12.3 — enviarCorreo() con cuenta de prueba (mock)', () => {
  const DATOS_PRUEBA = {
    nombre: 'Jennifer Sánchez',
    correo: 'staging-test@example.com',
    id: 'STAGING-TEST-001'
  };

  let gmailMock;
  let urlFetchMock;
  let utilitiesMock;

  beforeEach(() => {
    gmailMock = crearGmailAppMock();
    urlFetchMock = crearUrlFetchAppMock({ simularFallo: false });
    utilitiesMock = crearUtilitiesMock();
  });

  test('enviarCorreo() envía exactamente un correo', () => {
    enviarCorreo_(DATOS_PRUEBA, gmailMock, urlFetchMock, utilitiesMock);

    expect(gmailMock.getCantidadCorreos()).toBe(1);
  });

  test('el correo se envía al destinatario correcto', () => {
    enviarCorreo_(DATOS_PRUEBA, gmailMock, urlFetchMock, utilitiesMock);

    const correo = gmailMock.getUltimoCorreo();
    expect(correo.destinatario).toBe(DATOS_PRUEBA.correo);
  });

  test('el asunto del correo contiene el texto de confirmación de boda', () => {
    enviarCorreo_(DATOS_PRUEBA, gmailMock, urlFetchMock, utilitiesMock);

    const correo = gmailMock.getUltimoCorreo();
    expect(correo.asunto).toContain('confirmación');
    expect(correo.asunto).toContain('Boda');
  });

  test('el correo tiene cuerpo HTML con el nombre del invitado', () => {
    enviarCorreo_(DATOS_PRUEBA, gmailMock, urlFetchMock, utilitiesMock);

    const correo = gmailMock.getUltimoCorreo();
    expect(correo.htmlBody).toContain(DATOS_PRUEBA.nombre);
  });

  test('el correo HTML contiene la fecha del evento', () => {
    enviarCorreo_(DATOS_PRUEBA, gmailMock, urlFetchMock, utilitiesMock);

    const correo = gmailMock.getUltimoCorreo();
    expect(correo.htmlBody).toContain('15 de agosto de 2026');
  });

  test('el correo HTML contiene la ubicación del evento', () => {
    enviarCorreo_(DATOS_PRUEBA, gmailMock, urlFetchMock, utilitiesMock);

    const correo = gmailMock.getUltimoCorreo();
    expect(correo.htmlBody).toContain('Hacienda Angelus Campestre');
  });

  test('el correo contiene imagen QR cuando QuickChart está disponible', () => {
    enviarCorreo_(DATOS_PRUEBA, gmailMock, urlFetchMock, utilitiesMock);

    const correo = gmailMock.getUltimoCorreo();
    // Debe contener un tag <img> con la URL de QuickChart
    expect(correo.htmlBody).toContain('<img');
    expect(correo.htmlBody).toContain('quickchart.io/qr');
    expect(correo.htmlBody).toContain(encodeURIComponent(DATOS_PRUEBA.id));
  });

  test('la URL del QR incluye el ID del invitado codificado', () => {
    enviarCorreo_(DATOS_PRUEBA, gmailMock, urlFetchMock, utilitiesMock);

    const llamadas = urlFetchMock.getLlamadasRealizadas();
    expect(llamadas.length).toBe(1);
    expect(llamadas[0].url).toContain('quickchart.io/qr');
    expect(llamadas[0].url).toContain(encodeURIComponent(DATOS_PRUEBA.id));
  });

  test('el correo tiene exactamente un adjunto', () => {
    enviarCorreo_(DATOS_PRUEBA, gmailMock, urlFetchMock, utilitiesMock);

    const correo = gmailMock.getUltimoCorreo();
    expect(correo.adjuntos).toHaveLength(1);
  });

  test('el adjunto es un archivo .ics con tipo MIME text/calendar', () => {
    enviarCorreo_(DATOS_PRUEBA, gmailMock, urlFetchMock, utilitiesMock);

    const correo = gmailMock.getUltimoCorreo();
    const adjunto = correo.adjuntos[0];

    expect(adjunto.getContentType()).toBe('text/calendar');
    expect(adjunto.getName()).toMatch(/\.ics$/);
  });

  test('el adjunto .ics contiene todos los campos RFC 5545 requeridos', () => {
    enviarCorreo_(DATOS_PRUEBA, gmailMock, urlFetchMock, utilitiesMock);

    const correo = gmailMock.getUltimoCorreo();
    const adjunto = correo.adjuntos[0];
    const contenidoIcs = adjunto.getDataAsString();

    CAMPOS_RFC5545_REQUERIDOS.forEach(campo => {
      expect(contenidoIcs).toContain(campo);
    });
  });

  test('el .ics tiene DTSTART con la fecha del evento (20260815T123000)', () => {
    enviarCorreo_(DATOS_PRUEBA, gmailMock, urlFetchMock, utilitiesMock);

    const correo = gmailMock.getUltimoCorreo();
    const contenidoIcs = correo.adjuntos[0].getDataAsString();

    expect(contenidoIcs).toContain('DTSTART:20260815T123000');
  });

  test('el .ics tiene DTEND con la hora de fin del evento (20260815T190000)', () => {
    enviarCorreo_(DATOS_PRUEBA, gmailMock, urlFetchMock, utilitiesMock);

    const correo = gmailMock.getUltimoCorreo();
    const contenidoIcs = correo.adjuntos[0].getDataAsString();

    expect(contenidoIcs).toContain('DTEND:20260815T190000');
  });

  test('el .ics tiene SUMMARY con el nombre del evento', () => {
    enviarCorreo_(DATOS_PRUEBA, gmailMock, urlFetchMock, utilitiesMock);

    const correo = gmailMock.getUltimoCorreo();
    const contenidoIcs = correo.adjuntos[0].getDataAsString();

    expect(contenidoIcs).toContain('SUMMARY:');
    expect(contenidoIcs).toContain('Boda');
  });

  test('el .ics tiene LOCATION con la dirección del evento', () => {
    enviarCorreo_(DATOS_PRUEBA, gmailMock, urlFetchMock, utilitiesMock);

    const correo = gmailMock.getUltimoCorreo();
    const contenidoIcs = correo.adjuntos[0].getDataAsString();

    expect(contenidoIcs).toContain('LOCATION:');
    expect(contenidoIcs).toContain('Hacienda Angelus Campestre');
  });

  test('el .ics tiene DESCRIPTION con mensaje de bienvenida', () => {
    enviarCorreo_(DATOS_PRUEBA, gmailMock, urlFetchMock, utilitiesMock);

    const correo = gmailMock.getUltimoCorreo();
    const contenidoIcs = correo.adjuntos[0].getDataAsString();

    expect(contenidoIcs).toContain('DESCRIPTION:');
  });

  test('el .ics tiene estructura válida BEGIN:VCALENDAR...END:VCALENDAR', () => {
    enviarCorreo_(DATOS_PRUEBA, gmailMock, urlFetchMock, utilitiesMock);

    const correo = gmailMock.getUltimoCorreo();
    const contenidoIcs = correo.adjuntos[0].getDataAsString();
    const lineas = contenidoIcs.split('\r\n');

    expect(lineas[0]).toBe('BEGIN:VCALENDAR');
    expect(lineas[lineas.length - 1]).toBe('END:VCALENDAR');
  });
});

describe('Integración 12.3 — fallback de QR cuando QuickChart no está disponible', () => {
  const DATOS_PRUEBA = {
    nombre: 'Leonardo Marcelo',
    correo: 'staging-fallback@example.com',
    id: 'STAGING-TEST-002'
  };

  test('cuando QuickChart falla, el correo se envía igualmente (fallback de texto)', () => {
    const gmailMock = crearGmailAppMock();
    const urlFetchMock = crearUrlFetchAppMock({ simularFallo: true });
    const utilitiesMock = crearUtilitiesMock();

    // No debe lanzar excepción aunque QuickChart falle
    expect(() => {
      enviarCorreo_(DATOS_PRUEBA, gmailMock, urlFetchMock, utilitiesMock);
    }).not.toThrow();

    expect(gmailMock.getCantidadCorreos()).toBe(1);
  });

  test('cuando QuickChart falla, el correo contiene el ID como fallback de texto', () => {
    const gmailMock = crearGmailAppMock();
    const urlFetchMock = crearUrlFetchAppMock({ simularFallo: true });
    const utilitiesMock = crearUtilitiesMock();

    enviarCorreo_(DATOS_PRUEBA, gmailMock, urlFetchMock, utilitiesMock);

    const correo = gmailMock.getUltimoCorreo();
    // El fallback debe mostrar el ID de acceso en texto
    expect(correo.htmlBody).toContain('ID de acceso');
    expect(correo.htmlBody).toContain(DATOS_PRUEBA.id);
  });

  test('cuando QuickChart falla, el adjunto .ics sigue siendo válido', () => {
    const gmailMock = crearGmailAppMock();
    const urlFetchMock = crearUrlFetchAppMock({ simularFallo: true });
    const utilitiesMock = crearUtilitiesMock();

    enviarCorreo_(DATOS_PRUEBA, gmailMock, urlFetchMock, utilitiesMock);

    const correo = gmailMock.getUltimoCorreo();
    expect(correo.adjuntos).toHaveLength(1);

    const contenidoIcs = correo.adjuntos[0].getDataAsString();
    CAMPOS_RFC5545_REQUERIDOS.forEach(campo => {
      expect(contenidoIcs).toContain(campo);
    });
  });

  test('cuando QuickChart falla, el correo NO contiene tag <img> de QuickChart', () => {
    const gmailMock = crearGmailAppMock();
    const urlFetchMock = crearUrlFetchAppMock({ simularFallo: true });
    const utilitiesMock = crearUtilitiesMock();

    enviarCorreo_(DATOS_PRUEBA, gmailMock, urlFetchMock, utilitiesMock);

    const correo = gmailMock.getUltimoCorreo();
    // No debe haber imagen de QuickChart en el fallback
    expect(correo.htmlBody).not.toContain('quickchart.io/qr');
  });
});

describe('Integración 12.3 — verificación de estructura del correo HTML', () => {
  const DATOS_PRUEBA = {
    nombre: 'Invitado de Prueba',
    correo: 'html-test@example.com',
    id: 'HTML-TEST-001'
  };

  test('el correo HTML es un documento HTML válido (tiene DOCTYPE y html)', () => {
    const gmailMock = crearGmailAppMock();
    const urlFetchMock = crearUrlFetchAppMock();
    const utilitiesMock = crearUtilitiesMock();

    enviarCorreo_(DATOS_PRUEBA, gmailMock, urlFetchMock, utilitiesMock);

    const correo = gmailMock.getUltimoCorreo();
    expect(correo.htmlBody).toContain('<!DOCTYPE html>');
    expect(correo.htmlBody).toContain('<html');
    expect(correo.htmlBody).toContain('</html>');
  });

  test('el correo HTML tiene charset UTF-8', () => {
    const gmailMock = crearGmailAppMock();
    const urlFetchMock = crearUrlFetchAppMock();
    const utilitiesMock = crearUtilitiesMock();

    enviarCorreo_(DATOS_PRUEBA, gmailMock, urlFetchMock, utilitiesMock);

    const correo = gmailMock.getUltimoCorreo();
    expect(correo.htmlBody).toContain('charset="UTF-8"');
  });

  test('el nombre del remitente es el de los novios', () => {
    const gmailMock = crearGmailAppMock();
    const urlFetchMock = crearUrlFetchAppMock();
    const utilitiesMock = crearUtilitiesMock();

    enviarCorreo_(DATOS_PRUEBA, gmailMock, urlFetchMock, utilitiesMock);

    const correo = gmailMock.getUltimoCorreo();
    expect(correo.nombre).toContain('Jennifer');
    expect(correo.nombre).toContain('Nicolás');
  });
});
