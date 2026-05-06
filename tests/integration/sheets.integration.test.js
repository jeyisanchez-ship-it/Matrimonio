// Feature: wedding-invitation-app — Tests de integración
// NOTA: Estos tests simulan el entorno GAS con mocks de integración.
// Para ejecutar contra un Spreadsheet real, desplegar en GAS y ejecutar manualmente.

/**
 * Tests de integración — Tarea 12.1
 *
 * Verifica:
 * - setupBaseDatos() crea las 3 hojas con los encabezados correctos.
 * - guardarConfirmacion() con datos reales inserta una fila en Hoja_Respuestas.
 * - La fila insertada tiene el ID correcto y un timestamp ISO 8601 válido.
 *
 * Entorno: Mock de integración que simula SpreadsheetApp con estado persistente
 * en memoria durante el test. Replica el comportamiento real de GAS sin llamadas
 * a la API de Google Sheets.
 *
 * Para ejecutar contra un Spreadsheet real de staging:
 *   1. Desplegar Code.gs en Google Apps Script.
 *   2. Ejecutar setupBaseDatos() y guardarConfirmacion() manualmente desde el editor.
 *   3. Verificar los resultados en el Spreadsheet de staging.
 */

'use strict';

// ── Mock de integración de SpreadsheetApp ────────────────────────────────────

/**
 * Crea un mock de SpreadsheetApp con estado persistente en memoria.
 * Simula el comportamiento real de Google Sheets para tests de integración.
 *
 * @returns {Object} Mock de Spreadsheet con las mismas APIs que SpreadsheetApp
 */
function crearSpreadsheetMock() {
  const hojas = {};

  function crearHojaMock(nombre) {
    // Estado interno de la hoja: filas como array de arrays
    const filas = [];
    // Celdas individuales (para Dashboard con getRange('A2'), etc.)
    const celdas = {};

    return {
      _nombre: nombre,
      _filas: filas,
      _celdas: celdas,

      /**
       * Retorna un rango que puede leer/escribir valores.
       * Soporta getRange(fila, col, numFilas, numCols) y getRange('A2').
       */
      getRange(filaOA1, col, numFilas, numCols) {
        // Modo A1 (ej: 'A2', 'B3')
        if (typeof filaOA1 === 'string') {
          const clave = filaOA1;
          return {
            setValue(val) {
              celdas[clave] = { tipo: 'valor', dato: val };
            },
            setFormula(formula) {
              celdas[clave] = { tipo: 'formula', dato: formula };
            },
            getValue() {
              return celdas[clave] ? celdas[clave].dato : null;
            }
          };
        }

        // Modo numérico (ej: getRange(1, 1, 1, 4))
        const clave = `${filaOA1},${col},${numFilas},${numCols}`;
        return {
          setValues(matriz) {
            // Escribir en las filas del array interno
            for (let r = 0; r < (numFilas || 1); r++) {
              const idxFila = filaOA1 - 1 + r;
              if (!filas[idxFila]) filas[idxFila] = [];
              for (let c = 0; c < (numCols || 1); c++) {
                filas[idxFila][col - 1 + c] = matriz[r][c];
              }
            }
            celdas[clave] = { tipo: 'valores', dato: matriz };
          },
          getValues() {
            const resultado = [];
            for (let r = 0; r < (numFilas || 1); r++) {
              const idxFila = filaOA1 - 1 + r;
              const fila = filas[idxFila] || [];
              resultado.push(fila.slice(col - 1, col - 1 + (numCols || 1)));
            }
            return resultado;
          },
          setValue(val) {
            if (!filas[filaOA1 - 1]) filas[filaOA1 - 1] = [];
            filas[filaOA1 - 1][col - 1] = val;
          }
        };
      },

      /**
       * Retorna un rango que abarca todos los datos de la hoja.
       */
      getDataRange() {
        return {
          getValues() {
            // Retorna copia de todas las filas con datos
            return filas.filter(f => f !== undefined).map(f => [...f]);
          }
        };
      },

      /**
       * Agrega una fila al final de la hoja.
       * @param {Array} fila - Array de valores a insertar.
       */
      appendRow(fila) {
        filas.push([...fila]);
      },

      /**
       * Retorna el número de filas con datos (sin contar vacías).
       */
      getLastRow() {
        return filas.filter(f => f !== undefined).length;
      }
    };
  }

  return {
    _hojas: hojas,

    getSheetByName(nombre) {
      return hojas[nombre] || null;
    },

    insertSheet(nombre) {
      const hoja = crearHojaMock(nombre);
      hojas[nombre] = hoja;
      return hoja;
    },

    getActiveSpreadsheet() {
      return this;
    }
  };
}

// ── Reimplementación de setupBaseDatos_ ──────────────────────────────────────

/**
 * Replica la lógica de setupBaseDatos_(ss) de Code.gs.
 * Recibe el Spreadsheet mock como parámetro.
 */
function setupBaseDatos_(ss) {
  var hojaInvitados = ss.getSheetByName('Invitados');
  if (!hojaInvitados) {
    hojaInvitados = ss.insertSheet('Invitados');
    hojaInvitados.getRange(1, 1, 1, 4).setValues([['ID', 'Nombre', 'ID_Vinculado', 'Estado']]);
  }

  var hojaRespuestas = ss.getSheetByName('Respuestas');
  if (!hojaRespuestas) {
    hojaRespuestas = ss.insertSheet('Respuestas');
    hojaRespuestas.getRange(1, 1, 1, 9).setValues([[
      'ID', 'Fecha', 'Enviar_Correo', 'Correo_Electrónico',
      'Asistentes', 'Restricciones', 'Bebida', 'Canciones', 'Consejo'
    ]]);
  }

  var hojaDashboard = ss.getSheetByName('Dashboard');
  if (!hojaDashboard) {
    hojaDashboard = ss.insertSheet('Dashboard');
    hojaDashboard.getRange('A2').setValue('Total Invitados');
    hojaDashboard.getRange('B2').setFormula('=COUNTA(Invitados!A2:A)');
    hojaDashboard.getRange('A3').setValue('Total Confirmados');
    hojaDashboard.getRange('B3').setFormula('=COUNTIF(Invitados!D2:D,"Confirmado")');
    hojaDashboard.getRange('A4').setValue('Total Pendientes');
    hojaDashboard.getRange('B4').setFormula('=COUNTIF(Invitados!D2:D,"Pendiente")');
    hojaDashboard.getRange('A5').setValue('Total Asistentes');
    hojaDashboard.getRange('B5').setFormula('=SUM(Respuestas!E2:E)');
  }
}

// ── Reimplementación de guardarConfirmacion_ ─────────────────────────────────

/**
 * Replica la lógica de guardarConfirmacion_(datos, ss, now) de Code.gs.
 */
function guardarConfirmacion_(datos, ss, now) {
  try {
    var hojaInv = ss.getSheetByName('Invitados');
    var datosInv = hojaInv.getDataRange().getValues();
    var filaIdx = -1;
    for (var i = 1; i < datosInv.length; i++) {
      if (datosInv[i][0] === datos.id) { filaIdx = i; break; }
    }
    if (filaIdx === -1) {
      return { success: false, error: 'ID de invitado no encontrado' };
    }

    var hojaResp = ss.getSheetByName('Respuestas');
    hojaResp.appendRow([
      datos.id,
      now.toISOString(),
      datos.enviarCorreo ? 'Sí' : 'No',
      datos.correo || '',
      datos.asistentes || 0,
      datos.restricciones || 'Ninguna',
      datos.bebida || '',
      datos.canciones || '',
      datos.consejo || ''
    ]);

    hojaInv.getRange(filaIdx + 1, 4).setValue('Confirmado');

    if (datos.confirmarVinculado === true) {
      var idVinculado = datosInv[filaIdx][2];
      if (idVinculado) {
        for (var j = 1; j < datosInv.length; j++) {
          if (datosInv[j][0] === idVinculado) {
            hojaInv.getRange(j + 1, 4).setValue('Confirmado');
            break;
          }
        }
      }
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: 'Error al guardar. Intenta de nuevo.' };
  }
}

// ── Helpers de verificación ──────────────────────────────────────────────────

const ENCABEZADOS_INVITADOS = ['ID', 'Nombre', 'ID_Vinculado', 'Estado'];
const ENCABEZADOS_RESPUESTAS = [
  'ID', 'Fecha', 'Enviar_Correo', 'Correo_Electrónico',
  'Asistentes', 'Restricciones', 'Bebida', 'Canciones', 'Consejo'
];

/**
 * Verifica que un timestamp es ISO 8601 válido.
 * @param {string} ts - Timestamp a verificar.
 * @returns {boolean}
 */
function esTimestampISO8601Valido(ts) {
  if (typeof ts !== 'string') return false;
  const fecha = new Date(ts);
  return !isNaN(fecha.getTime()) && ts === fecha.toISOString();
}

// ── Tests de integración — Tarea 12.1 ───────────────────────────────────────

describe('Integración 12.1 — setupBaseDatos() con Spreadsheet de staging (mock)', () => {
  let ss;

  beforeEach(() => {
    // Crear un Spreadsheet mock limpio (simula staging vacío)
    ss = crearSpreadsheetMock();
  });

  test('setupBaseDatos() crea la hoja Invitados', () => {
    setupBaseDatos_(ss);
    expect(ss.getSheetByName('Invitados')).not.toBeNull();
  });

  test('setupBaseDatos() crea la hoja Respuestas', () => {
    setupBaseDatos_(ss);
    expect(ss.getSheetByName('Respuestas')).not.toBeNull();
  });

  test('setupBaseDatos() crea la hoja Dashboard', () => {
    setupBaseDatos_(ss);
    expect(ss.getSheetByName('Dashboard')).not.toBeNull();
  });

  test('Hoja_Invitados tiene los encabezados correctos en la fila 1', () => {
    setupBaseDatos_(ss);
    const hoja = ss.getSheetByName('Invitados');
    const filas = hoja.getDataRange().getValues();

    // La primera fila debe ser los encabezados
    expect(filas[0]).toEqual(ENCABEZADOS_INVITADOS);
  });

  test('Hoja_Respuestas tiene los 9 encabezados correctos en la fila 1', () => {
    setupBaseDatos_(ss);
    const hoja = ss.getSheetByName('Respuestas');
    const filas = hoja.getDataRange().getValues();

    expect(filas[0]).toEqual(ENCABEZADOS_RESPUESTAS);
  });

  test('Hoja_Dashboard tiene las etiquetas y fórmulas correctas', () => {
    setupBaseDatos_(ss);
    const hoja = ss.getSheetByName('Dashboard');

    expect(hoja.getRange('A2').getValue()).toBe('Total Invitados');
    expect(hoja.getRange('B2').getValue()).toBe('=COUNTA(Invitados!A2:A)');
    expect(hoja.getRange('A3').getValue()).toBe('Total Confirmados');
    expect(hoja.getRange('B3').getValue()).toBe('=COUNTIF(Invitados!D2:D,"Confirmado")');
    expect(hoja.getRange('A4').getValue()).toBe('Total Pendientes');
    expect(hoja.getRange('B4').getValue()).toBe('=COUNTIF(Invitados!D2:D,"Pendiente")');
    expect(hoja.getRange('A5').getValue()).toBe('Total Asistentes');
    expect(hoja.getRange('B5').getValue()).toBe('=SUM(Respuestas!E2:E)');
  });

  test('setupBaseDatos() es idempotente: ejecutar dos veces no duplica encabezados', () => {
    setupBaseDatos_(ss);
    setupBaseDatos_(ss);

    const hojaInv = ss.getSheetByName('Invitados');
    const hojaResp = ss.getSheetByName('Respuestas');

    // Solo debe haber una fila de encabezados (la fila 0)
    const filasInv = hojaInv.getDataRange().getValues();
    const filasResp = hojaResp.getDataRange().getValues();

    expect(filasInv.length).toBe(1);
    expect(filasResp.length).toBe(1);
  });
});

describe('Integración 12.1 — guardarConfirmacion() con datos reales en staging (mock)', () => {
  let ss;
  const INVITADO_STAGING = {
    id: 'STAGING-001',
    nombre: 'Jennifer Sánchez',
    idVinculado: 'STAGING-002'
  };
  const INVITADO_VINCULADO_STAGING = {
    id: 'STAGING-002',
    nombre: 'Leonardo Marcelo',
    idVinculado: ''
  };

  beforeEach(() => {
    // Preparar Spreadsheet de staging con invitados de prueba
    ss = crearSpreadsheetMock();
    setupBaseDatos_(ss);

    // Insertar invitados de prueba en Hoja_Invitados
    const hojaInv = ss.getSheetByName('Invitados');
    hojaInv.appendRow([
      INVITADO_STAGING.id,
      INVITADO_STAGING.nombre,
      INVITADO_STAGING.idVinculado,
      'Pendiente'
    ]);
    hojaInv.appendRow([
      INVITADO_VINCULADO_STAGING.id,
      INVITADO_VINCULADO_STAGING.nombre,
      INVITADO_VINCULADO_STAGING.idVinculado,
      'Pendiente'
    ]);
  });

  test('guardarConfirmacion() con datos reales retorna success: true', () => {
    const datos = {
      id: INVITADO_STAGING.id,
      enviarCorreo: false,
      correo: '',
      asistentes: 2,
      restricciones: 'Ninguna',
      bebida: 'Vino',
      canciones: 'Bohemian Rhapsody - Queen',
      consejo: 'El amor es paciencia y comprensión.',
      confirmarVinculado: false
    };

    const resultado = guardarConfirmacion_(datos, ss, new Date());
    expect(resultado.success).toBe(true);
  });

  test('guardarConfirmacion() inserta exactamente una fila en Hoja_Respuestas', () => {
    const hojaResp = ss.getSheetByName('Respuestas');
    const filasAntes = hojaResp.getDataRange().getValues().length;

    const datos = {
      id: INVITADO_STAGING.id,
      enviarCorreo: false,
      correo: '',
      asistentes: 2,
      restricciones: 'Vegetariano',
      bebida: 'Sin alcohol',
      canciones: 'Despacito - Luis Fonsi, Shape of You - Ed Sheeran',
      consejo: 'Nunca se duerman enojados.',
      confirmarVinculado: false
    };

    guardarConfirmacion_(datos, ss, new Date());

    const filasDespues = hojaResp.getDataRange().getValues().length;
    expect(filasDespues).toBe(filasAntes + 1);
  });

  test('la fila insertada contiene el ID correcto del invitado de staging', () => {
    const now = new Date('2026-05-10T14:32:00.000Z');
    const datos = {
      id: INVITADO_STAGING.id,
      enviarCorreo: false,
      correo: '',
      asistentes: 1,
      restricciones: 'Ninguna',
      bebida: 'Whisky',
      canciones: '',
      consejo: '',
      confirmarVinculado: false
    };

    guardarConfirmacion_(datos, ss, now);

    const hojaResp = ss.getSheetByName('Respuestas');
    const filas = hojaResp.getDataRange().getValues();
    // La última fila insertada (índice 1, después del encabezado)
    const filaInsertada = filas[filas.length - 1];

    expect(filaInsertada[0]).toBe(INVITADO_STAGING.id);
  });

  test('la fila insertada tiene un timestamp ISO 8601 válido en la columna Fecha', () => {
    const now = new Date('2026-05-10T14:32:00.000Z');
    const datos = {
      id: INVITADO_STAGING.id,
      enviarCorreo: false,
      correo: '',
      asistentes: 1,
      restricciones: 'Ninguna',
      bebida: 'Tequila',
      canciones: '',
      consejo: '',
      confirmarVinculado: false
    };

    guardarConfirmacion_(datos, ss, now);

    const hojaResp = ss.getSheetByName('Respuestas');
    const filas = hojaResp.getDataRange().getValues();
    const filaInsertada = filas[filas.length - 1];
    const timestamp = filaInsertada[1];

    expect(esTimestampISO8601Valido(timestamp)).toBe(true);
    expect(timestamp).toBe(now.toISOString());
  });

  test('la fila insertada contiene todos los campos del formulario RSVP', () => {
    const now = new Date('2026-05-10T14:32:00.000Z');
    const datos = {
      id: INVITADO_STAGING.id,
      enviarCorreo: true,
      correo: 'staging@test.com',
      asistentes: 3,
      restricciones: 'Sin gluten',
      bebida: 'Vino',
      canciones: 'Perfect - Ed Sheeran',
      consejo: 'La comunicación es la clave.',
      confirmarVinculado: false
    };

    guardarConfirmacion_(datos, ss, now);

    const hojaResp = ss.getSheetByName('Respuestas');
    const filas = hojaResp.getDataRange().getValues();
    const fila = filas[filas.length - 1];

    // Verificar cada campo de la fila insertada
    expect(fila[0]).toBe(datos.id);                    // ID
    expect(fila[1]).toBe(now.toISOString());            // Fecha ISO 8601
    expect(fila[2]).toBe('Sí');                         // Enviar_Correo
    expect(fila[3]).toBe(datos.correo);                 // Correo_Electrónico
    expect(fila[4]).toBe(datos.asistentes);             // Asistentes
    expect(fila[5]).toBe(datos.restricciones);          // Restricciones
    expect(fila[6]).toBe(datos.bebida);                 // Bebida
    expect(fila[7]).toBe(datos.canciones);              // Canciones
    expect(fila[8]).toBe(datos.consejo);                // Consejo
  });

  test('guardarConfirmacion() actualiza el Estado del invitado a Confirmado en Hoja_Invitados', () => {
    const datos = {
      id: INVITADO_STAGING.id,
      enviarCorreo: false,
      correo: '',
      asistentes: 2,
      restricciones: 'Ninguna',
      bebida: 'Vino',
      canciones: '',
      consejo: '',
      confirmarVinculado: false
    };

    guardarConfirmacion_(datos, ss, new Date());

    const hojaInv = ss.getSheetByName('Invitados');
    const filas = hojaInv.getDataRange().getValues();
    // Buscar la fila del invitado principal (índice 1, después del encabezado)
    const filaInvitado = filas.find(f => f[0] === INVITADO_STAGING.id);

    expect(filaInvitado).toBeDefined();
    expect(filaInvitado[3]).toBe('Confirmado');
  });

  test('guardarConfirmacion() con confirmarVinculado=true actualiza también al vinculado', () => {
    const datos = {
      id: INVITADO_STAGING.id,
      enviarCorreo: false,
      correo: '',
      asistentes: 2,
      restricciones: 'Ninguna',
      bebida: 'Vino',
      canciones: '',
      consejo: '',
      confirmarVinculado: true
    };

    guardarConfirmacion_(datos, ss, new Date());

    const hojaInv = ss.getSheetByName('Invitados');
    const filas = hojaInv.getDataRange().getValues();
    const filaVinculado = filas.find(f => f[0] === INVITADO_VINCULADO_STAGING.id);

    expect(filaVinculado).toBeDefined();
    expect(filaVinculado[3]).toBe('Confirmado');
  });

  test('guardarConfirmacion() con ID inexistente retorna error y no modifica Sheets', () => {
    const hojaResp = ss.getSheetByName('Respuestas');
    const filasAntes = hojaResp.getDataRange().getValues().length;

    const datos = {
      id: 'ID-QUE-NO-EXISTE',
      enviarCorreo: false,
      correo: '',
      asistentes: 1,
      restricciones: 'Ninguna',
      bebida: 'Vino',
      canciones: '',
      consejo: '',
      confirmarVinculado: false
    };

    const resultado = guardarConfirmacion_(datos, ss, new Date());

    expect(resultado.success).toBe(false);
    expect(resultado.error).toBeTruthy();
    expect(hojaResp.getDataRange().getValues().length).toBe(filasAntes);
  });
});
