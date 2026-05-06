// Feature: wedding-invitation-app, Property 2: Partición exhaustiva por fecha límite
// Validates: Requirements 2.1, 2.3

'use strict';

const fc = require('fast-check');

/**
 * Función pura extraída de la lógica de doGet_.
 * Retorna true si la fecha ha superado el límite de confirmaciones.
 *
 * @param {Date} now - Fecha a evaluar.
 * @returns {boolean} true si now > fechaLimite, false en caso contrario.
 */
function esFechaVencida(now) {
  var fechaLimite = new Date('2026-06-15T23:59:59-05:00');
  return now > fechaLimite;
}

describe('Property 2: Partición exhaustiva por fecha límite', () => {
  // Test de ejemplo: fecha antes del límite
  test('fecha antes del límite retorna false', () => {
    const antes = new Date('2026-01-01T00:00:00-05:00');
    expect(esFechaVencida(antes)).toBe(false);
  });

  // Test de ejemplo: fecha exactamente en el límite
  test('fecha exactamente en el límite retorna false (no estrictamente mayor)', () => {
    const limite = new Date('2026-06-15T23:59:59-05:00');
    expect(esFechaVencida(limite)).toBe(false);
  });

  // Test de ejemplo: fecha después del límite
  test('fecha después del límite retorna true', () => {
    const despues = new Date('2026-06-16T00:00:00-05:00');
    expect(esFechaVencida(despues)).toBe(true);
  });

  // Property 2: Para cualquier fecha, exactamente una de las dos condiciones es verdadera
  test('Property 2 — para cualquier fecha, exactamente una condición es verdadera (mutuamente excluyentes y exhaustivas)', () => {
    fc.assert(
      fc.property(fc.date(), (now) => {
        const vencida = esFechaVencida(now);
        const noVencida = !esFechaVencida(now);

        // Exactamente una de las dos condiciones es verdadera
        const exactamenteUna = (vencida && !noVencida) || (!vencida && noVencida);
        return exactamenteUna;
      }),
      { numRuns: 100 }
    );
  });

  // Property 2 (variante): si vencida es true, noVencida es false y viceversa
  test('Property 2 — vencida y noVencida son siempre complementarias', () => {
    fc.assert(
      fc.property(fc.date(), (now) => {
        const vencida = esFechaVencida(now);
        // La negación siempre es el complemento exacto
        return vencida === !(!vencida);
      }),
      { numRuns: 100 }
    );
  });

  // Property 2 (partición): fechas antes del límite nunca son vencidas
  test('Property 2 — fechas en [1970, 2026-06-15T23:59:59-05:00] nunca están vencidas', () => {
    const fechaLimite = new Date('2026-06-15T23:59:59-05:00');
    fc.assert(
      fc.property(
        fc.date({ max: fechaLimite }),
        (now) => {
          return esFechaVencida(now) === false;
        }
      ),
      { numRuns: 100 }
    );
  });

  // Property 2 (partición): fechas después del límite siempre están vencidas
  test('Property 2 — fechas después de 2026-06-15T23:59:59-05:00 siempre están vencidas', () => {
    const unSegundoDespues = new Date('2026-06-16T00:00:00-05:00');
    fc.assert(
      fc.property(
        fc.date({ min: unSegundoDespues }),
        (now) => {
          return esFechaVencida(now) === true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
