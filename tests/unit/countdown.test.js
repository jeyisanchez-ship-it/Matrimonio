/**
 * Feature: wedding-invitation-app
 * Property 9: Cuenta regresiva nunca produce valores negativos
 *
 * Validates: Requirements 6.2, 6.4
 */

'use strict';

const fc = require('fast-check');

// Importar la función pura calcCountdown desde countdown.js
// La lógica pura está extraída en countdown.js para ser testeable con Jest.
// Index.html contiene una copia inline de la misma función para GAS HtmlService.
const { calcCountdown } = require('../../countdown.js');

// Fecha del evento: 15 de agosto de 2026 a las 12:30 PM hora Colombia (UTC-5)
const FECHA_EVENTO = new Date('2026-08-15T12:30:00-05:00').getTime();

describe('Property 9: Cuenta regresiva nunca produce valores negativos', () => {
  // ----------------------------------------------------------------
  // Property 9a: Antes del evento → todos los valores son ≥ 0
  // ----------------------------------------------------------------
  test('Para cualquier timestamp anterior al evento, todos los valores son >= 0', () => {
    fc.assert(
      fc.property(
        // Generar fechas anteriores a la fecha del evento
        fc.date({ max: new Date(FECHA_EVENTO - 1) }),
        function (fecha) {
          var ahora = fecha.getTime();
          var resultado = calcCountdown(ahora, FECHA_EVENTO);

          // No debe retornar el estado especial
          expect(resultado.especial).toBeUndefined();

          // Todos los valores deben ser >= 0
          expect(resultado.dias).toBeGreaterThanOrEqual(0);
          expect(resultado.horas).toBeGreaterThanOrEqual(0);
          expect(resultado.minutos).toBeGreaterThanOrEqual(0);
          expect(resultado.segundos).toBeGreaterThanOrEqual(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  // ----------------------------------------------------------------
  // Property 9b: En o después del evento → retorna { especial: true }
  // ----------------------------------------------------------------
  test('Para cualquier timestamp igual o posterior al evento, retorna { especial: true }', () => {
    fc.assert(
      fc.property(
        // Generar fechas iguales o posteriores a la fecha del evento
        fc.date({ min: new Date(FECHA_EVENTO) }),
        function (fecha) {
          var ahora = fecha.getTime();
          var resultado = calcCountdown(ahora, FECHA_EVENTO);

          expect(resultado).toEqual({ especial: true });
        }
      ),
      { numRuns: 100 }
    );
  });

  // ----------------------------------------------------------------
  // Property 9c: Los valores de horas, minutos y segundos están en rango válido
  // ----------------------------------------------------------------
  test('Para cualquier timestamp anterior al evento, horas < 24, minutos < 60, segundos < 60', () => {
    fc.assert(
      fc.property(
        fc.date({ max: new Date(FECHA_EVENTO - 1) }),
        function (fecha) {
          var ahora = fecha.getTime();
          var resultado = calcCountdown(ahora, FECHA_EVENTO);

          expect(resultado.horas).toBeGreaterThanOrEqual(0);
          expect(resultado.horas).toBeLessThan(24);

          expect(resultado.minutos).toBeGreaterThanOrEqual(0);
          expect(resultado.minutos).toBeLessThan(60);

          expect(resultado.segundos).toBeGreaterThanOrEqual(0);
          expect(resultado.segundos).toBeLessThan(60);
        }
      ),
      { numRuns: 100 }
    );
  });

  // ----------------------------------------------------------------
  // Tests de ejemplo (example-based) para casos concretos
  // ----------------------------------------------------------------
  describe('Casos de ejemplo concretos', () => {
    test('Exactamente en la fecha del evento retorna { especial: true }', () => {
      const resultado = calcCountdown(FECHA_EVENTO, FECHA_EVENTO);
      expect(resultado).toEqual({ especial: true });
    });

    test('Un segundo antes del evento retorna 1 segundo restante', () => {
      const resultado = calcCountdown(FECHA_EVENTO - 1000, FECHA_EVENTO);
      expect(resultado).toEqual({ dias: 0, horas: 0, minutos: 0, segundos: 1 });
    });

    test('Un día antes del evento retorna 0 horas, 0 minutos, 0 segundos, 0 dias (redondeado a segundos)', () => {
      // 1 día exacto = 86400 segundos
      const resultado = calcCountdown(FECHA_EVENTO - 86400 * 1000, FECHA_EVENTO);
      expect(resultado.dias).toBe(1);
      expect(resultado.horas).toBe(0);
      expect(resultado.minutos).toBe(0);
      expect(resultado.segundos).toBe(0);
    });

    test('Después del evento retorna { especial: true }', () => {
      const resultado = calcCountdown(FECHA_EVENTO + 5000, FECHA_EVENTO);
      expect(resultado).toEqual({ especial: true });
    });

    test('Ningún valor contiene el carácter "-" (no negativos)', () => {
      // Verificar con una fecha arbitraria anterior al evento
      const unMesAntes = FECHA_EVENTO - 30 * 24 * 60 * 60 * 1000;
      const resultado = calcCountdown(unMesAntes, FECHA_EVENTO);
      expect(String(resultado.dias)).not.toContain('-');
      expect(String(resultado.horas)).not.toContain('-');
      expect(String(resultado.minutos)).not.toContain('-');
      expect(String(resultado.segundos)).not.toContain('-');
    });
  });
});
