// Feature: wedding-invitation-app, Property 1: Idempotencia de setupBaseDatos
// Validates: Requirements 1.5

'use strict';

const fc = require('fast-check');

// ---------------------------------------------------------------------------
// Extracción de la lógica pura de setupBaseDatos_ desde Code.gs
// ---------------------------------------------------------------------------

/**
 * Reimplementación de setupBaseDatos_(ss) para el entorno de test.
 * Debe mantenerse sincronizada con la implementación en Code.gs.
 */
function setupBaseDatos_(ss) {
  // Hoja_Invitados
  var hojaInvitados = ss.getSheetByName('Invitados');
  if (!hojaInvitados) {
    hojaInvitados = ss.insertSheet('Invitados');
    hojaInvitados.getRange(1, 1, 1, 4).setValues([['ID', 'Nombre', 'ID_Vinculado', 'Estado']]);
  }

  // Hoja_Respuestas
  var hojaRespuestas = ss.getSheetByName('Respuestas');
  if (!hojaRespuestas) {
    hojaRespuestas = ss.insertSheet('Respuestas');
    hojaRespuestas.getRange(1, 1, 1, 9).setValues([[
      'ID', 'Fecha', 'Enviar_Correo', 'Correo_Electrónico',
      'Asistentes', 'Restricciones', 'Bebida', 'Canciones', 'Consejo'
    ]]);
  }

  // Hoja_Dashboard
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

// ---------------------------------------------------------------------------
// Stub de SpreadsheetApp
// ---------------------------------------------------------------------------

/**
 * Crea un stub de Sheet que registra las operaciones realizadas sobre él.
 *
 * @param {string} name - Nombre de la hoja.
 * @param {boolean} preexistente - Si la hoja ya existía antes de llamar a setupBaseDatos_.
 */
function crearSheetStub(name, preexistente) {
  const cells = {};   // mapa de clave "fila,col" o "A2" → valor
  const ranges = {};  // mapa de clave → { values, formula }
  let headerSetCount = 0;

  return {
    _name: name,
    _preexistente: preexistente,
    _headerSetCount: () => headerSetCount,
    _cells: cells,

    getRange(rowOrA1, col, numRows, numCols) {
      // Soporta getRange('A2') y getRange(1, 1, 1, N)
      const key = (typeof rowOrA1 === 'string')
        ? rowOrA1
        : `${rowOrA1},${col},${numRows},${numCols}`;

      const rangeObj = {
        _key: key,
        setValue(val) {
          cells[key] = { type: 'value', data: val };
        },
        setFormula(formula) {
          cells[key] = { type: 'formula', data: formula };
        },
        setValues(matrix) {
          headerSetCount++;
          cells[key] = { type: 'values', data: matrix };
        },
        getValue() {
          return cells[key] ? cells[key].data : null;
        }
      };
      return rangeObj;
    }
  };
}

/**
 * Crea un stub de Spreadsheet con un conjunto inicial de hojas preexistentes.
 *
 * @param {{ invitados: boolean, respuestas: boolean, dashboard: boolean }} config
 */
function crearSpreadsheetStub(config) {
  const sheets = {};

  if (config.invitados) {
    sheets['Invitados'] = crearSheetStub('Invitados', true);
  }
  if (config.respuestas) {
    sheets['Respuestas'] = crearSheetStub('Respuestas', true);
  }
  if (config.dashboard) {
    sheets['Dashboard'] = crearSheetStub('Dashboard', true);
  }

  return {
    _sheets: sheets,
    getSheetByName(name) {
      return sheets[name] || null;
    },
    insertSheet(name) {
      const sheet = crearSheetStub(name, false);
      sheets[name] = sheet;
      return sheet;
    }
  };
}

// ---------------------------------------------------------------------------
// Las 8 combinaciones posibles de hojas preexistentes (2³)
// ---------------------------------------------------------------------------

const combinaciones = [
  { invitados: false, respuestas: false, dashboard: false }, // ninguna
  { invitados: true,  respuestas: false, dashboard: false }, // solo Invitados
  { invitados: false, respuestas: true,  dashboard: false }, // solo Respuestas
  { invitados: false, respuestas: false, dashboard: true  }, // solo Dashboard
  { invitados: true,  respuestas: true,  dashboard: false }, // Invitados + Respuestas
  { invitados: true,  respuestas: false, dashboard: true  }, // Invitados + Dashboard
  { invitados: false, respuestas: true,  dashboard: true  }, // Respuestas + Dashboard
  { invitados: true,  respuestas: true,  dashboard: true  }, // todas
];

// ---------------------------------------------------------------------------
// Helpers de aserción
// ---------------------------------------------------------------------------

const HEADERS_INVITADOS  = [['ID', 'Nombre', 'ID_Vinculado', 'Estado']];
const HEADERS_RESPUESTAS = [[
  'ID', 'Fecha', 'Enviar_Correo', 'Correo_Electrónico',
  'Asistentes', 'Restricciones', 'Bebida', 'Canciones', 'Consejo'
]];

const DASHBOARD_ESPERADO = {
  'A2': { type: 'value',   data: 'Total Invitados' },
  'B2': { type: 'formula', data: '=COUNTA(Invitados!A2:A)' },
  'A3': { type: 'value',   data: 'Total Confirmados' },
  'B3': { type: 'formula', data: '=COUNTIF(Invitados!D2:D,"Confirmado")' },
  'A4': { type: 'value',   data: 'Total Pendientes' },
  'B4': { type: 'formula', data: '=COUNTIF(Invitados!D2:D,"Pendiente")' },
  'A5': { type: 'value',   data: 'Total Asistentes' },
  'B5': { type: 'formula', data: '=SUM(Respuestas!E2:E)' },
};

/**
 * Captura el estado observable del Spreadsheet stub tras ejecutar setupBaseDatos_.
 * Retorna un objeto normalizado para comparación.
 */
function capturarEstado(ss) {
  const estado = {};

  ['Invitados', 'Respuestas', 'Dashboard'].forEach(nombre => {
    const hoja = ss.getSheetByName(nombre);
    if (!hoja) {
      estado[nombre] = null;
      return;
    }
    estado[nombre] = { cells: Object.assign({}, hoja._cells) };
  });

  return estado;
}

/**
 * Verifica que el estado del Spreadsheet es correcto (las 3 hojas existen
 * con los encabezados/fórmulas esperados).
 */
function verificarEstadoCorrecto(ss) {
  // Las 3 hojas deben existir
  expect(ss.getSheetByName('Invitados')).not.toBeNull();
  expect(ss.getSheetByName('Respuestas')).not.toBeNull();
  expect(ss.getSheetByName('Dashboard')).not.toBeNull();

  // Encabezados de Invitados
  const invitados = ss.getSheetByName('Invitados');
  const cellInv = invitados._cells['1,1,1,4'];
  if (cellInv) {
    expect(cellInv.data).toEqual(HEADERS_INVITADOS);
  }

  // Encabezados de Respuestas
  const respuestas = ss.getSheetByName('Respuestas');
  const cellResp = respuestas._cells['1,1,1,9'];
  if (cellResp) {
    expect(cellResp.data).toEqual(HEADERS_RESPUESTAS);
  }

  // Fórmulas y etiquetas del Dashboard
  const dashboard = ss.getSheetByName('Dashboard');
  Object.entries(DASHBOARD_ESPERADO).forEach(([celda, esperado]) => {
    if (dashboard._cells[celda]) {
      expect(dashboard._cells[celda]).toEqual(esperado);
    }
  });
}

// ---------------------------------------------------------------------------
// Tests unitarios (example-based)
// ---------------------------------------------------------------------------

describe('setupBaseDatos_ — tests unitarios', () => {
  test('crea las 3 hojas en un Spreadsheet vacío', () => {
    const ss = crearSpreadsheetStub({ invitados: false, respuestas: false, dashboard: false });
    setupBaseDatos_(ss);

    expect(ss.getSheetByName('Invitados')).not.toBeNull();
    expect(ss.getSheetByName('Respuestas')).not.toBeNull();
    expect(ss.getSheetByName('Dashboard')).not.toBeNull();
  });

  test('escribe encabezados correctos en Hoja_Invitados', () => {
    const ss = crearSpreadsheetStub({ invitados: false, respuestas: false, dashboard: false });
    setupBaseDatos_(ss);

    const hoja = ss.getSheetByName('Invitados');
    expect(hoja._cells['1,1,1,4'].data).toEqual(HEADERS_INVITADOS);
  });

  test('escribe encabezados correctos en Hoja_Respuestas', () => {
    const ss = crearSpreadsheetStub({ invitados: false, respuestas: false, dashboard: false });
    setupBaseDatos_(ss);

    const hoja = ss.getSheetByName('Respuestas');
    expect(hoja._cells['1,1,1,9'].data).toEqual(HEADERS_RESPUESTAS);
  });

  test('escribe fórmulas y etiquetas correctas en Hoja_Dashboard', () => {
    const ss = crearSpreadsheetStub({ invitados: false, respuestas: false, dashboard: false });
    setupBaseDatos_(ss);

    const hoja = ss.getSheetByName('Dashboard');
    expect(hoja._cells['A2']).toEqual({ type: 'value',   data: 'Total Invitados' });
    expect(hoja._cells['B2']).toEqual({ type: 'formula', data: '=COUNTA(Invitados!A2:A)' });
    expect(hoja._cells['A3']).toEqual({ type: 'value',   data: 'Total Confirmados' });
    expect(hoja._cells['B3']).toEqual({ type: 'formula', data: '=COUNTIF(Invitados!D2:D,"Confirmado")' });
    expect(hoja._cells['A4']).toEqual({ type: 'value',   data: 'Total Pendientes' });
    expect(hoja._cells['B4']).toEqual({ type: 'formula', data: '=COUNTIF(Invitados!D2:D,"Pendiente")' });
    expect(hoja._cells['A5']).toEqual({ type: 'value',   data: 'Total Asistentes' });
    expect(hoja._cells['B5']).toEqual({ type: 'formula', data: '=SUM(Respuestas!E2:E)' });
  });

  test('no sobreescribe una hoja preexistente', () => {
    const ss = crearSpreadsheetStub({ invitados: true, respuestas: false, dashboard: false });
    const hojaOriginal = ss.getSheetByName('Invitados');
    setupBaseDatos_(ss);

    // La hoja preexistente no debe haber recibido setValues (headerSetCount = 0)
    expect(hojaOriginal._headerSetCount()).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Test de propiedad (Property 1 — Idempotencia)
// ---------------------------------------------------------------------------

describe('setupBaseDatos_ — Property 1: Idempotencia', () => {
  test(
    'ejecutar dos veces produce el mismo estado que ejecutar una vez, para las 8 combinaciones posibles',
    () => {
      // Feature: wedding-invitation-app, Property 1: Idempotencia de setupBaseDatos
      // Validates: Requirements 1.5
      fc.assert(
        fc.property(
          fc.constantFrom(...combinaciones),
          (config) => {
            // --- Ejecución única ---
            const ss1 = crearSpreadsheetStub(config);
            setupBaseDatos_(ss1);
            const estadoUnaVez = capturarEstado(ss1);

            // --- Ejecución doble (mismo estado inicial) ---
            const ss2 = crearSpreadsheetStub(config);
            setupBaseDatos_(ss2);
            setupBaseDatos_(ss2);
            const estadoDosVeces = capturarEstado(ss2);

            // El estado final debe ser idéntico
            expect(estadoDosVeces).toEqual(estadoUnaVez);

            // Además, el estado debe ser correcto en ambos casos
            verificarEstadoCorrecto(ss1);
            verificarEstadoCorrecto(ss2);
          }
        ),
        { numRuns: 100 }
      );
    }
  );

  test(
    'las hojas preexistentes no reciben encabezados duplicados tras la segunda ejecución',
    () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...combinaciones),
          (config) => {
            const ss = crearSpreadsheetStub(config);

            // Primera ejecución
            setupBaseDatos_(ss);

            // Capturar el headerSetCount de cada hoja tras la primera ejecución
            const countInv1  = ss.getSheetByName('Invitados')._headerSetCount();
            const countResp1 = ss.getSheetByName('Respuestas')._headerSetCount();

            // Segunda ejecución
            setupBaseDatos_(ss);

            // El headerSetCount no debe haber aumentado (no se escribieron encabezados de nuevo)
            expect(ss.getSheetByName('Invitados')._headerSetCount()).toBe(countInv1);
            expect(ss.getSheetByName('Respuestas')._headerSetCount()).toBe(countResp1);
          }
        ),
        { numRuns: 100 }
      );
    }
  );
});
