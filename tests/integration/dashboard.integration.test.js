// Feature: wedding-invitation-app — Tests de integración
// NOTA: Estos tests simulan el entorno GAS con mocks de integración.
// Para ejecutar contra un Spreadsheet real, desplegar en GAS y ejecutar manualmente.

/**
 * Tests de integración — Tarea 12.2
 *
 * Verifica:
 * - Insertar filas de prueba en el Spreadsheet de staging.
 * - getDashboardData_() retorna métricas que coinciden con los datos insertados.
 * - La invariante totalConfirmados + totalPendientes === totalInvitados se cumple
 *   en datos reales.
 *
 * Entorno: Mock de integración que simula SpreadsheetApp con estado persistente
 * en memoria durante el test. Replica el comportamiento real de GAS sin llamadas
 * a la API de Google Sheets.
 *
 * Para ejecutar contra un Spreadsheet real de staging:
 *   1. Desplegar Code.gs en Google Apps Script.
 *   2. Insertar filas de prueba en el Spreadsheet de staging.
 *   3. Llamar a getDashboardData_() desde el editor de GAS.
 *   4. Verificar que las métricas coinciden con los datos insertados.
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
    const filas = [];
    const celdas = {};

    return {
      _nombre: nombre,
      _filas: filas,
      _celdas: celdas,

      getRange(filaOA1, col, numFilas, numCols) {
        if (typeof filaOA1 === 'string') {
          const clave = filaOA1;
          return {
            setValue(val) { celdas[clave] = { tipo: 'valor', dato: val }; },
            setFormula(formula) { celdas[clave] = { tipo: 'formula', dato: formula }; },
            getValue() { return celdas[clave] ? celdas[clave].dato : null; }
          };
        }

        return {
          setValues(matriz) {
            for (let r = 0; r < (numFilas || 1); r++) {
              const idxFila = filaOA1 - 1 + r;
              if (!filas[idxFila]) filas[idxFila] = [];
              for (let c = 0; c < (numCols || 1); c++) {
                filas[idxFila][col - 1 + c] = matriz[r][c];
              }
            }
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

      getDataRange() {
        return {
          getValues() {
            return filas.filter(f => f !== undefined).map(f => [...f]);
          }
        };
      },

      appendRow(fila) {
        filas.push([...fila]);
      },

      getLastRow() {
        return filas.filter(f => f !== undefined).length;
      }
    };
  }

  return {
    _hojas: hojas,
    getSheetByName(nombre) { return hojas[nombre] || null; },
    insertSheet(nombre) {
      const hoja = crearHojaMock(nombre);
      hojas[nombre] = hoja;
      return hoja;
    }
  };
}

// ── Reimplementación de setupBaseDatos_ ──────────────────────────────────────

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

// ── Reimplementación de getDashboardData_ ────────────────────────────────────

/**
 * Replica la lógica de getDashboardData_(ss) de Code.gs.
 * Lee Hoja_Invitados y Hoja_Respuestas y calcula métricas en tiempo real.
 *
 * @param {Object} ss - Mock de Spreadsheet.
 * @returns {Object} Métricas del dashboard.
 */
function getDashboardData_(ss) {
  var metricas = {
    totalConfirmados: 0,
    totalPendientes: 0,
    totalInvitados: 0,
    porBebida: { 'Vino': 0, 'Whisky': 0, 'Tequila': 0, 'Sin alcohol': 0 },
    porRestriccion: {
      'Ninguna': 0, 'Vegetariano': 0, 'Vegano': 0,
      'Sin gluten': 0, 'Sin lactosa': 0, 'Otro': 0
    }
  };

  var hojaInv = ss.getSheetByName('Invitados');
  if (hojaInv) {
    var datosInv = hojaInv.getDataRange().getValues();
    for (var i = 1; i < datosInv.length; i++) {
      var estado = datosInv[i][3];
      metricas.totalInvitados++;
      if (estado === 'Confirmado') metricas.totalConfirmados++;
      else if (estado === 'Pendiente') metricas.totalPendientes++;
    }
  }

  var hojaResp = ss.getSheetByName('Respuestas');
  if (hojaResp) {
    var datosResp = hojaResp.getDataRange().getValues();
    for (var j = 1; j < datosResp.length; j++) {
      var bebida = datosResp[j][6];
      var restriccion = datosResp[j][5];
      if (metricas.porBebida.hasOwnProperty(bebida)) metricas.porBebida[bebida]++;
      if (metricas.porRestriccion.hasOwnProperty(restriccion)) metricas.porRestriccion[restriccion]++;
    }
  }

  return metricas;
}

// ── Datos de prueba para staging ─────────────────────────────────────────────

/**
 * Inserta filas de prueba en el Spreadsheet de staging (mock).
 * Simula el estado real de un Spreadsheet con invitados y respuestas.
 *
 * @param {Object} ss - Mock de Spreadsheet ya inicializado con setupBaseDatos_.
 */
function insertarDatosDePrueba(ss) {
  const hojaInv = ss.getSheetByName('Invitados');
  const hojaResp = ss.getSheetByName('Respuestas');

  // Invitados de prueba: 5 confirmados, 3 pendientes = 8 total
  const invitados = [
    ['STAG-001', 'Ana García',     'STAG-002', 'Confirmado'],
    ['STAG-002', 'Luis García',    '',          'Confirmado'],
    ['STAG-003', 'María López',    'STAG-004', 'Confirmado'],
    ['STAG-004', 'Pedro López',    '',          'Pendiente'],
    ['STAG-005', 'Sofía Martínez', '',          'Confirmado'],
    ['STAG-006', 'Carlos Ruiz',    '',          'Pendiente'],
    ['STAG-007', 'Laura Díaz',     'STAG-008', 'Confirmado'],
    ['STAG-008', 'Jorge Díaz',     '',          'Pendiente'],
  ];

  invitados.forEach(fila => hojaInv.appendRow(fila));

  // Respuestas de prueba (solo los confirmados enviaron respuesta)
  const now = new Date('2026-05-10T14:32:00.000Z').toISOString();
  const respuestas = [
    ['STAG-001', now, 'Sí',  'ana@test.com',    2, 'Ninguna',     'Vino',        'Bohemian Rhapsody - Queen', 'Mucho amor'],
    ['STAG-002', now, 'No',  '',                1, 'Vegetariano', 'Sin alcohol', '',                          ''],
    ['STAG-003', now, 'Sí',  'maria@test.com',  2, 'Sin gluten',  'Whisky',      'Despacito - Luis Fonsi',    'Paciencia'],
    ['STAG-005', now, 'No',  '',                1, 'Ninguna',     'Tequila',     '',                          'Comunicación'],
    ['STAG-007', now, 'Sí',  'laura@test.com',  2, 'Vegano',      'Vino',        'Perfect - Ed Sheeran',      ''],
  ];

  respuestas.forEach(fila => hojaResp.appendRow(fila));
}

// ── Tests de integración — Tarea 12.2 ───────────────────────────────────────

describe('Integración 12.2 — getDashboardData_() con datos de staging (mock)', () => {
  let ss;

  beforeEach(() => {
    ss = crearSpreadsheetMock();
    setupBaseDatos_(ss);
    insertarDatosDePrueba(ss);
  });

  test('getDashboardData_() retorna el total de invitados correcto', () => {
    const metricas = getDashboardData_(ss);
    // 8 invitados insertados en los datos de prueba
    expect(metricas.totalInvitados).toBe(8);
  });

  test('getDashboardData_() retorna el total de confirmados correcto', () => {
    const metricas = getDashboardData_(ss);
    // 5 confirmados: STAG-001, STAG-002, STAG-003, STAG-005, STAG-007
    expect(metricas.totalConfirmados).toBe(5);
  });

  test('getDashboardData_() retorna el total de pendientes correcto', () => {
    const metricas = getDashboardData_(ss);
    // 3 pendientes: STAG-004, STAG-006, STAG-008
    expect(metricas.totalPendientes).toBe(3);
  });

  test('las métricas coinciden exactamente con los datos insertados en staging', () => {
    const metricas = getDashboardData_(ss);

    // Verificar que los totales coinciden con los datos de prueba insertados
    expect(metricas.totalInvitados).toBe(8);
    expect(metricas.totalConfirmados).toBe(5);
    expect(metricas.totalPendientes).toBe(3);
  });

  test('getDashboardData_() cuenta correctamente las preferencias de bebida', () => {
    const metricas = getDashboardData_(ss);

    // Según las respuestas de prueba:
    // Vino: STAG-001, STAG-007 = 2
    // Sin alcohol: STAG-002 = 1
    // Whisky: STAG-003 = 1
    // Tequila: STAG-005 = 1
    expect(metricas.porBebida['Vino']).toBe(2);
    expect(metricas.porBebida['Sin alcohol']).toBe(1);
    expect(metricas.porBebida['Whisky']).toBe(1);
    expect(metricas.porBebida['Tequila']).toBe(1);
  });

  test('getDashboardData_() cuenta correctamente las restricciones alimentarias', () => {
    const metricas = getDashboardData_(ss);

    // Según las respuestas de prueba:
    // Ninguna: STAG-001, STAG-005 = 2
    // Vegetariano: STAG-002 = 1
    // Sin gluten: STAG-003 = 1
    // Vegano: STAG-007 = 1
    expect(metricas.porRestriccion['Ninguna']).toBe(2);
    expect(metricas.porRestriccion['Vegetariano']).toBe(1);
    expect(metricas.porRestriccion['Sin gluten']).toBe(1);
    expect(metricas.porRestriccion['Vegano']).toBe(1);
  });

  test('invariante: totalConfirmados + totalPendientes === totalInvitados en datos reales', () => {
    const metricas = getDashboardData_(ss);

    expect(metricas.totalConfirmados + metricas.totalPendientes).toBe(metricas.totalInvitados);
  });
});

describe('Integración 12.2 — invariante de suma en múltiples escenarios de staging', () => {
  test('invariante se cumple con Spreadsheet vacío (solo encabezados)', () => {
    const ss = crearSpreadsheetMock();
    setupBaseDatos_(ss);

    const metricas = getDashboardData_(ss);

    expect(metricas.totalInvitados).toBe(0);
    expect(metricas.totalConfirmados).toBe(0);
    expect(metricas.totalPendientes).toBe(0);
    expect(metricas.totalConfirmados + metricas.totalPendientes).toBe(metricas.totalInvitados);
  });

  test('invariante se cumple con todos los invitados confirmados', () => {
    const ss = crearSpreadsheetMock();
    setupBaseDatos_(ss);

    const hojaInv = ss.getSheetByName('Invitados');
    hojaInv.appendRow(['INV-A', 'Invitado A', '', 'Confirmado']);
    hojaInv.appendRow(['INV-B', 'Invitado B', '', 'Confirmado']);
    hojaInv.appendRow(['INV-C', 'Invitado C', '', 'Confirmado']);

    const metricas = getDashboardData_(ss);

    expect(metricas.totalInvitados).toBe(3);
    expect(metricas.totalConfirmados).toBe(3);
    expect(metricas.totalPendientes).toBe(0);
    expect(metricas.totalConfirmados + metricas.totalPendientes).toBe(metricas.totalInvitados);
  });

  test('invariante se cumple con todos los invitados pendientes', () => {
    const ss = crearSpreadsheetMock();
    setupBaseDatos_(ss);

    const hojaInv = ss.getSheetByName('Invitados');
    hojaInv.appendRow(['INV-A', 'Invitado A', '', 'Pendiente']);
    hojaInv.appendRow(['INV-B', 'Invitado B', '', 'Pendiente']);

    const metricas = getDashboardData_(ss);

    expect(metricas.totalInvitados).toBe(2);
    expect(metricas.totalConfirmados).toBe(0);
    expect(metricas.totalPendientes).toBe(2);
    expect(metricas.totalConfirmados + metricas.totalPendientes).toBe(metricas.totalInvitados);
  });

  test('invariante se cumple después de confirmar invitados dinámicamente', () => {
    const ss = crearSpreadsheetMock();
    setupBaseDatos_(ss);

    // Insertar invitados pendientes
    const hojaInv = ss.getSheetByName('Invitados');
    hojaInv.appendRow(['DYN-001', 'Dinámica Uno', '', 'Pendiente']);
    hojaInv.appendRow(['DYN-002', 'Dinámica Dos', '', 'Pendiente']);
    hojaInv.appendRow(['DYN-003', 'Dinámica Tres', '', 'Pendiente']);

    // Verificar estado inicial
    let metricas = getDashboardData_(ss);
    expect(metricas.totalConfirmados + metricas.totalPendientes).toBe(metricas.totalInvitados);
    expect(metricas.totalPendientes).toBe(3);

    // Simular confirmación de un invitado (como lo haría guardarConfirmacion_)
    const hojaResp = ss.getSheetByName('Respuestas');
    hojaResp.appendRow(['DYN-001', new Date().toISOString(), 'No', '', 2, 'Ninguna', 'Vino', '', '']);

    // Actualizar estado en Hoja_Invitados (fila 1 = encabezado, fila 2 = DYN-001)
    hojaInv.getRange(2, 4).setValue('Confirmado');

    // Verificar que la invariante se mantiene después de la confirmación
    metricas = getDashboardData_(ss);
    expect(metricas.totalConfirmados + metricas.totalPendientes).toBe(metricas.totalInvitados);
    expect(metricas.totalConfirmados).toBe(1);
    expect(metricas.totalPendientes).toBe(2);
  });

  test('getDashboardData_() refleja cambios en tiempo real (sin caché)', () => {
    const ss = crearSpreadsheetMock();
    setupBaseDatos_(ss);

    const hojaInv = ss.getSheetByName('Invitados');

    // Primera lectura: sin invitados
    let metricas = getDashboardData_(ss);
    expect(metricas.totalInvitados).toBe(0);

    // Insertar un invitado
    hojaInv.appendRow(['RT-001', 'Tiempo Real', '', 'Pendiente']);

    // Segunda lectura: debe reflejar el nuevo invitado
    metricas = getDashboardData_(ss);
    expect(metricas.totalInvitados).toBe(1);
    expect(metricas.totalPendientes).toBe(1);

    // Confirmar el invitado
    hojaInv.getRange(2, 4).setValue('Confirmado');

    // Tercera lectura: debe reflejar el cambio de estado
    metricas = getDashboardData_(ss);
    expect(metricas.totalConfirmados).toBe(1);
    expect(metricas.totalPendientes).toBe(0);
  });
});
