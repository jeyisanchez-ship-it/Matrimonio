// Feature: wedding-invitation-app, Property 3: Enrutamiento correcto según estado del invitado
// Feature: wedding-invitation-app, Property 4: Round-trip de datos del invitado en templateData
// Validates: Requirements 3.1, 3.2, 3.3, 3.6, 3.4, 3.5

'use strict';

const fc = require('fast-check');

// ---------------------------------------------------------------------------
// Implementación pura de la lógica de enrutamiento (extraída de doGet_)
// para poder testearla sin dependencias de GAS.
// ---------------------------------------------------------------------------

const FECHA_LIMITE = new Date('2026-06-15T23:59:59-05:00');
const VISTAS_VALIDAS = new Set([
  'no_encontrado',
  'ya_confirmado',
  'rsvp',
  'enlace_invalido',
  'cerrado',
  'dashboard',
]);

/**
 * Busca una fila en el array de datos por ID (columna 0).
 * Replica buscarFila_ de Code.gs.
 */
function buscarFila(datos, id) {
  for (var i = 1; i < datos.length; i++) {
    if (datos[i][0] === id) return datos[i];
  }
  return null;
}

/**
 * Lógica pura de enrutamiento de doGet_.
 * Retorna un objeto { vista, templateData? } en lugar de HtmlOutput
 * para facilitar el testing.
 *
 * @param {Object} params - Parámetros de la URL.
 * @param {Array[]} datos - Filas del Spreadsheet (datos[0] = encabezados).
 * @param {Date} now - Fecha actual.
 * @returns {{ vista: string, templateData?: Object }}
 */
function enrutar(params, datos, now) {
  // Rama dashboard
  if (params.page === 'dashboard') {
    return { vista: 'dashboard' };
  }

  // Verificación de fecha límite
  if (now > FECHA_LIMITE) {
    return { vista: 'cerrado' };
  }

  // Extracción del parámetro id
  var id = params.id;
  if (!id) {
    return { vista: 'enlace_invalido' };
  }

  // Búsqueda en datos
  var fila = buscarFila(datos, id);

  if (!fila) {
    return { vista: 'no_encontrado' };
  }

  if (fila[3] === 'Confirmado') {
    return { vista: 'ya_confirmado' };
  }

  // Estado = 'Pendiente' → construir templateData
  var templateData = {
    vista: 'rsvp',
    nombre: fila[1],
    nombreVinculado: null,
    id: id,
  };

  var idVinculado = fila[2];
  if (idVinculado) {
    var filaVinculado = buscarFila(datos, idVinculado);
    if (filaVinculado && filaVinculado[3] === 'Pendiente') {
      templateData.nombreVinculado = filaVinculado[1];
    }
  }

  return { vista: 'rsvp', templateData };
}

// ---------------------------------------------------------------------------
// Generadores de fast-check
// ---------------------------------------------------------------------------

/** Genera un ID de invitado como string no vacío */
const arbId = fc.string({ minLength: 1, maxLength: 10 }).filter((s) => s.trim().length > 0);

/** Genera un nombre de invitado */
const arbNombre = fc.string({ minLength: 1, maxLength: 30 }).filter((s) => s.trim().length > 0);

/** Genera un estado válido */
const arbEstado = fc.constantFrom('Pendiente', 'Confirmado');

/**
 * Genera un array de filas de invitados con IDs únicos.
 * Formato: [ID, Nombre, ID_Vinculado, Estado]
 * datos[0] = encabezados
 */
const arbDatos = fc
  .array(
    fc.record({
      id: arbId,
      nombre: arbNombre,
      idVinculado: fc.option(arbId, { nil: '' }),
      estado: arbEstado,
    }),
    { minLength: 0, maxLength: 10 }
  )
  .map((invitados) => {
    // Garantizar IDs únicos
    const seen = new Set();
    const unique = invitados.filter((inv) => {
      if (seen.has(inv.id)) return false;
      seen.add(inv.id);
      return true;
    });
    const encabezados = ['ID', 'Nombre', 'ID_Vinculado', 'Estado'];
    const filas = unique.map((inv) => [inv.id, inv.nombre, inv.idVinculado || '', inv.estado]);
    return [encabezados, ...filas];
  });

// ---------------------------------------------------------------------------
// Property 3: Enrutamiento correcto según estado del invitado
// ---------------------------------------------------------------------------

describe('Property 3: Enrutamiento correcto según estado del invitado', () => {
  const fechaValida = new Date('2025-01-01T00:00:00-05:00'); // antes del límite

  // Test de ejemplo: sin parámetros → enlace_invalido
  test('sin parámetros retorna enlace_invalido', () => {
    const result = enrutar({}, [['ID', 'Nombre', 'ID_Vinculado', 'Estado']], fechaValida);
    expect(result.vista).toBe('enlace_invalido');
  });

  // Test de ejemplo: page=dashboard → dashboard
  test('page=dashboard retorna dashboard', () => {
    const result = enrutar({ page: 'dashboard' }, [['ID', 'Nombre', 'ID_Vinculado', 'Estado']], fechaValida);
    expect(result.vista).toBe('dashboard');
  });

  // Test de ejemplo: fecha vencida → cerrado
  test('fecha vencida retorna cerrado', () => {
    const fechaVencida = new Date('2027-01-01T00:00:00-05:00');
    const result = enrutar({ id: 'INV001' }, [['ID', 'Nombre', 'ID_Vinculado', 'Estado']], fechaVencida);
    expect(result.vista).toBe('cerrado');
  });

  // Test de ejemplo: ID no encontrado → no_encontrado
  test('ID inexistente retorna no_encontrado', () => {
    const datos = [
      ['ID', 'Nombre', 'ID_Vinculado', 'Estado'],
      ['INV001', 'María', '', 'Pendiente'],
    ];
    const result = enrutar({ id: 'INEXISTENTE' }, datos, fechaValida);
    expect(result.vista).toBe('no_encontrado');
  });

  // Test de ejemplo: Estado=Confirmado → ya_confirmado
  test('invitado Confirmado retorna ya_confirmado', () => {
    const datos = [
      ['ID', 'Nombre', 'ID_Vinculado', 'Estado'],
      ['INV001', 'María', '', 'Confirmado'],
    ];
    const result = enrutar({ id: 'INV001' }, datos, fechaValida);
    expect(result.vista).toBe('ya_confirmado');
  });

  // Test de ejemplo: Estado=Pendiente → rsvp
  test('invitado Pendiente retorna rsvp', () => {
    const datos = [
      ['ID', 'Nombre', 'ID_Vinculado', 'Estado'],
      ['INV001', 'María', '', 'Pendiente'],
    ];
    const result = enrutar({ id: 'INV001' }, datos, fechaValida);
    expect(result.vista).toBe('rsvp');
  });

  // Property 3: la vista siempre pertenece al conjunto de vistas válidas
  test('Property 3 — la vista retornada siempre pertenece al conjunto de vistas válidas', () => {
    fc.assert(
      fc.property(
        arbDatos,
        fc.record({
          id: fc.option(arbId, { nil: undefined }),
          page: fc.option(fc.constant('dashboard'), { nil: undefined }),
        }),
        fc.date(),
        (datos, params, now) => {
          // Construir params limpiando undefined
          const p = {};
          if (params.id !== undefined) p.id = params.id;
          if (params.page !== undefined) p.page = params.page;

          const result = enrutar(p, datos, now);
          return VISTAS_VALIDAS.has(result.vista);
        }
      ),
      { numRuns: 100 }
    );
  });

  // Property 3: cada condición mapea a exactamente una vista
  test('Property 3 — page=dashboard siempre produce vista=dashboard independientemente de fecha e ID', () => {
    fc.assert(
      fc.property(arbDatos, fc.date(), (datos, now) => {
        const result = enrutar({ page: 'dashboard' }, datos, now);
        return result.vista === 'dashboard';
      }),
      { numRuns: 100 }
    );
  });

  test('Property 3 — fecha vencida (sin dashboard) siempre produce vista=cerrado', () => {
    const despuesdeLimite = new Date(FECHA_LIMITE.getTime() + 1000);
    fc.assert(
      fc.property(
        arbDatos,
        fc.date({ min: despuesdeLimite }),
        fc.option(arbId, { nil: undefined }),
        (datos, now, id) => {
          const p = {};
          if (id !== undefined) p.id = id;
          const result = enrutar(p, datos, now);
          return result.vista === 'cerrado';
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 3 — sin id (y sin dashboard, y fecha válida) siempre produce vista=enlace_invalido', () => {
    const antesDelLimite = new Date(FECHA_LIMITE.getTime() - 1000);
    fc.assert(
      fc.property(
        arbDatos,
        fc.date({ max: antesDelLimite }),
        (datos, now) => {
          const result = enrutar({}, datos, now);
          return result.vista === 'enlace_invalido';
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 3 — ID existente con Estado=Confirmado siempre produce vista=ya_confirmado', () => {
    const antesDelLimite = new Date(FECHA_LIMITE.getTime() - 1000);
    fc.assert(
      fc.property(
        fc.record({ id: arbId, nombre: arbNombre }),
        fc.date({ max: antesDelLimite }),
        ({ id, nombre }, now) => {
          const datos = [
            ['ID', 'Nombre', 'ID_Vinculado', 'Estado'],
            [id, nombre, '', 'Confirmado'],
          ];
          const result = enrutar({ id }, datos, now);
          return result.vista === 'ya_confirmado';
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 3 — ID existente con Estado=Pendiente siempre produce vista=rsvp', () => {
    const antesDelLimite = new Date(FECHA_LIMITE.getTime() - 1000);
    fc.assert(
      fc.property(
        fc.record({ id: arbId, nombre: arbNombre }),
        fc.date({ max: antesDelLimite }),
        ({ id, nombre }, now) => {
          const datos = [
            ['ID', 'Nombre', 'ID_Vinculado', 'Estado'],
            [id, nombre, '', 'Pendiente'],
          ];
          const result = enrutar({ id }, datos, now);
          return result.vista === 'rsvp';
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 3 — ID inexistente (fecha válida) siempre produce vista=no_encontrado', () => {
    const antesDelLimite = new Date(FECHA_LIMITE.getTime() - 1000);
    fc.assert(
      fc.property(
        arbDatos,
        fc.date({ max: antesDelLimite }),
        (datos, now) => {
          // Usar un ID que con certeza no existe en los datos generados
          const idInexistente = '__INEXISTENTE__';
          const result = enrutar({ id: idInexistente }, datos, now);
          return result.vista === 'no_encontrado';
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ---------------------------------------------------------------------------
// Property 4: Round-trip de datos del invitado en templateData
// ---------------------------------------------------------------------------

describe('Property 4: Round-trip de datos del invitado en templateData', () => {
  const antesDelLimite = new Date(FECHA_LIMITE.getTime() - 1000);

  // Test de ejemplo: templateData.nombre coincide con el campo Nombre
  test('templateData.nombre coincide con el Nombre del invitado en Sheets', () => {
    const datos = [
      ['ID', 'Nombre', 'ID_Vinculado', 'Estado'],
      ['INV001', 'María García', '', 'Pendiente'],
    ];
    const result = enrutar({ id: 'INV001' }, datos, antesDelLimite);
    expect(result.vista).toBe('rsvp');
    expect(result.templateData.nombre).toBe('María García');
  });

  // Test de ejemplo: nombreVinculado es null cuando no hay vinculado
  test('templateData.nombreVinculado es null cuando no hay ID_Vinculado', () => {
    const datos = [
      ['ID', 'Nombre', 'ID_Vinculado', 'Estado'],
      ['INV001', 'María García', '', 'Pendiente'],
    ];
    const result = enrutar({ id: 'INV001' }, datos, antesDelLimite);
    expect(result.templateData.nombreVinculado).toBeNull();
  });

  // Test de ejemplo: nombreVinculado es el nombre del vinculado si está Pendiente
  test('templateData.nombreVinculado es el nombre del vinculado si está Pendiente', () => {
    const datos = [
      ['ID', 'Nombre', 'ID_Vinculado', 'Estado'],
      ['INV001', 'María García', 'INV002', 'Pendiente'],
      ['INV002', 'Carlos López', '', 'Pendiente'],
    ];
    const result = enrutar({ id: 'INV001' }, datos, antesDelLimite);
    expect(result.templateData.nombreVinculado).toBe('Carlos López');
  });

  // Test de ejemplo: nombreVinculado es null si el vinculado está Confirmado
  test('templateData.nombreVinculado es null si el vinculado ya está Confirmado', () => {
    const datos = [
      ['ID', 'Nombre', 'ID_Vinculado', 'Estado'],
      ['INV001', 'María García', 'INV002', 'Pendiente'],
      ['INV002', 'Carlos López', '', 'Confirmado'],
    ];
    const result = enrutar({ id: 'INV001' }, datos, antesDelLimite);
    expect(result.templateData.nombreVinculado).toBeNull();
  });

  // Property 4: templateData.nombre siempre coincide con el campo Nombre en Sheets
  test('Property 4 — templateData.nombre siempre coincide con el campo Nombre en Sheets', () => {
    fc.assert(
      fc.property(
        fc.record({ id: arbId, nombre: arbNombre }),
        fc.date({ max: antesDelLimite }),
        ({ id, nombre }, now) => {
          const datos = [
            ['ID', 'Nombre', 'ID_Vinculado', 'Estado'],
            [id, nombre, '', 'Pendiente'],
          ];
          const result = enrutar({ id }, datos, now);
          if (result.vista !== 'rsvp') return true; // no aplica
          return result.templateData.nombre === nombre;
        }
      ),
      { numRuns: 100 }
    );
  });

  // Property 4: templateData.id siempre coincide con el id consultado
  test('Property 4 — templateData.id siempre coincide con el id consultado', () => {
    fc.assert(
      fc.property(
        fc.record({ id: arbId, nombre: arbNombre }),
        fc.date({ max: antesDelLimite }),
        ({ id, nombre }, now) => {
          const datos = [
            ['ID', 'Nombre', 'ID_Vinculado', 'Estado'],
            [id, nombre, '', 'Pendiente'],
          ];
          const result = enrutar({ id }, datos, now);
          if (result.vista !== 'rsvp') return true;
          return result.templateData.id === id;
        }
      ),
      { numRuns: 100 }
    );
  });

  // Property 4: nombreVinculado es el nombre correcto del vinculado si está Pendiente
  test('Property 4 — nombreVinculado es el nombre del vinculado cuando está Pendiente', () => {
    fc.assert(
      fc.property(
        fc.record({ id: arbId, nombre: arbNombre }),
        fc.record({ id: arbId, nombre: arbNombre }),
        fc.date({ max: antesDelLimite }),
        (principal, vinculado, now) => {
          // Garantizar IDs distintos
          if (principal.id === vinculado.id) return true;

          const datos = [
            ['ID', 'Nombre', 'ID_Vinculado', 'Estado'],
            [principal.id, principal.nombre, vinculado.id, 'Pendiente'],
            [vinculado.id, vinculado.nombre, '', 'Pendiente'],
          ];
          const result = enrutar({ id: principal.id }, datos, now);
          if (result.vista !== 'rsvp') return true;
          return result.templateData.nombreVinculado === vinculado.nombre;
        }
      ),
      { numRuns: 100 }
    );
  });

  // Property 4: nombreVinculado es null cuando el vinculado está Confirmado
  test('Property 4 — nombreVinculado es null cuando el vinculado está Confirmado', () => {
    fc.assert(
      fc.property(
        fc.record({ id: arbId, nombre: arbNombre }),
        fc.record({ id: arbId, nombre: arbNombre }),
        fc.date({ max: antesDelLimite }),
        (principal, vinculado, now) => {
          if (principal.id === vinculado.id) return true;

          const datos = [
            ['ID', 'Nombre', 'ID_Vinculado', 'Estado'],
            [principal.id, principal.nombre, vinculado.id, 'Pendiente'],
            [vinculado.id, vinculado.nombre, '', 'Confirmado'],
          ];
          const result = enrutar({ id: principal.id }, datos, now);
          if (result.vista !== 'rsvp') return true;
          return result.templateData.nombreVinculado === null;
        }
      ),
      { numRuns: 100 }
    );
  });

  // Property 4: nombreVinculado es null cuando no hay ID_Vinculado
  test('Property 4 — nombreVinculado es null cuando no hay ID_Vinculado', () => {
    fc.assert(
      fc.property(
        fc.record({ id: arbId, nombre: arbNombre }),
        fc.date({ max: antesDelLimite }),
        ({ id, nombre }, now) => {
          const datos = [
            ['ID', 'Nombre', 'ID_Vinculado', 'Estado'],
            [id, nombre, '', 'Pendiente'],
          ];
          const result = enrutar({ id }, datos, now);
          if (result.vista !== 'rsvp') return true;
          return result.templateData.nombreVinculado === null;
        }
      ),
      { numRuns: 100 }
    );
  });
});
