// Feature: wedding-invitation-app, Property 12: Invariante de suma del dashboard

const fc = require('fast-check');

/**
 * Función pura que replica la lógica de getDashboardData_ para Hoja_Invitados.
 * Recibe un array de filas (sin encabezado) con estructura [ID, Nombre, ID_Vinculado, Estado].
 *
 * @param {Array[]} filasInvitados - Filas de datos (sin fila de encabezado).
 * @returns {{ totalConfirmados: number, totalPendientes: number, totalInvitados: number }}
 */
function calcularMetricas(filasInvitados) {
  var metricas = {
    totalConfirmados: 0,
    totalPendientes: 0,
    totalInvitados: 0
  };

  for (var i = 0; i < filasInvitados.length; i++) {
    var estado = filasInvitados[i][3];
    metricas.totalInvitados++;
    if (estado === 'Confirmado') metricas.totalConfirmados++;
    else if (estado === 'Pendiente') metricas.totalPendientes++;
  }

  return metricas;
}

// ── Tests unitarios ──────────────────────────────────────────────────────────

describe('calcularMetricas — tests unitarios', () => {
  test('0 invitados: todos los totales son 0', () => {
    const result = calcularMetricas([]);
    expect(result.totalInvitados).toBe(0);
    expect(result.totalConfirmados).toBe(0);
    expect(result.totalPendientes).toBe(0);
  });

  test('todos confirmados', () => {
    const filas = [
      ['INV001', 'Ana', '', 'Confirmado'],
      ['INV002', 'Luis', '', 'Confirmado'],
      ['INV003', 'María', '', 'Confirmado']
    ];
    const result = calcularMetricas(filas);
    expect(result.totalInvitados).toBe(3);
    expect(result.totalConfirmados).toBe(3);
    expect(result.totalPendientes).toBe(0);
  });

  test('todos pendientes', () => {
    const filas = [
      ['INV001', 'Ana', '', 'Pendiente'],
      ['INV002', 'Luis', '', 'Pendiente']
    ];
    const result = calcularMetricas(filas);
    expect(result.totalInvitados).toBe(2);
    expect(result.totalConfirmados).toBe(0);
    expect(result.totalPendientes).toBe(2);
  });

  test('mezcla de confirmados y pendientes', () => {
    const filas = [
      ['INV001', 'Ana', '', 'Confirmado'],
      ['INV002', 'Luis', '', 'Pendiente'],
      ['INV003', 'María', '', 'Confirmado'],
      ['INV004', 'Pedro', '', 'Pendiente'],
      ['INV005', 'Sofía', '', 'Pendiente']
    ];
    const result = calcularMetricas(filas);
    expect(result.totalInvitados).toBe(5);
    expect(result.totalConfirmados).toBe(2);
    expect(result.totalPendientes).toBe(3);
    expect(result.totalConfirmados + result.totalPendientes).toBe(result.totalInvitados);
  });

  test('invitados con estado desconocido no cuentan en confirmados ni pendientes', () => {
    const filas = [
      ['INV001', 'Ana', '', 'Confirmado'],
      ['INV002', 'Luis', '', 'Otro'],
    ];
    const result = calcularMetricas(filas);
    expect(result.totalInvitados).toBe(2);
    expect(result.totalConfirmados).toBe(1);
    expect(result.totalPendientes).toBe(0);
    // La invariante no aplica cuando hay estados desconocidos, pero totalInvitados sí cuenta todos
  });
});

// ── Property 12: Invariante de suma del Dashboard ────────────────────────────

describe('Property 12: Invariante de suma del Dashboard', () => {
  /**
   * Validates: Requirements 19.2, 19.5
   *
   * Para cualquier array de filas con Estado 'Pendiente' o 'Confirmado',
   * totalConfirmados + totalPendientes === totalInvitados.
   */
  test('totalConfirmados + totalPendientes === totalInvitados para cualquier combinación de filas', () => {
    // Generador de fila con Estado solo 'Pendiente' o 'Confirmado'
    const filaArbitraria = fc.tuple(
      fc.string({ minLength: 1, maxLength: 10 }),  // ID
      fc.string({ minLength: 1, maxLength: 30 }),  // Nombre
      fc.string({ maxLength: 10 }),                // ID_Vinculado
      fc.constantFrom('Pendiente', 'Confirmado')   // Estado
    );

    fc.assert(
      fc.property(
        fc.array(filaArbitraria, { minLength: 0, maxLength: 50 }),
        (filas) => {
          const result = calcularMetricas(filas);
          return result.totalConfirmados + result.totalPendientes === result.totalInvitados;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('invariante se mantiene con 0 invitados', () => {
    const result = calcularMetricas([]);
    expect(result.totalConfirmados + result.totalPendientes).toBe(result.totalInvitados);
  });

  test('invariante se mantiene con 1 invitado confirmado', () => {
    const result = calcularMetricas([['INV001', 'Ana', '', 'Confirmado']]);
    expect(result.totalConfirmados + result.totalPendientes).toBe(result.totalInvitados);
    expect(result.totalInvitados).toBe(1);
  });

  test('invariante se mantiene con 1 invitado pendiente', () => {
    const result = calcularMetricas([['INV001', 'Ana', '', 'Pendiente']]);
    expect(result.totalConfirmados + result.totalPendientes).toBe(result.totalInvitados);
    expect(result.totalInvitados).toBe(1);
  });
});
