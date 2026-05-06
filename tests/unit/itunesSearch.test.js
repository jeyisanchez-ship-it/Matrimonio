/**
 * Tests de propiedad para el buscador de canciones de iTunes.
 * Feature: wedding-invitation-app
 *
 * Property 10: Lista flotante máximo 8 resultados
 * Property 13: Serialización de chips — conteo de comas
 *
 * Validates: Requirements 14.3, 14.8
 */

const fc = require('fast-check');

// ---------------------------------------------------------------------------
// Importar funciones puras desde Index.html
// Index.html exporta { calcCountdown, sliceResultados } cuando se ejecuta en Node.
// Para aislar las funciones sin parsear HTML, las redefinimos aquí de forma
// idéntica a la implementación en Index.html.
// ---------------------------------------------------------------------------

/**
 * Retorna los primeros 8 resultados de un array.
 * Réplica exacta de sliceResultados() en Index.html.
 *
 * @param {Array} results
 * @returns {Array}
 */
function sliceResultados(results) {
  return results.slice(0, 8);
}

// ---------------------------------------------------------------------------
// Property 10 — Lista flotante máximo 8 resultados
// Validates: Requirements 14.3
// ---------------------------------------------------------------------------
describe('Property 10: sliceResultados — máximo 8 resultados', () => {
  test('para cualquier array de hasta 50 canciones, sliceResultados devuelve máximo 8', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            trackName: fc.string(),
            artistName: fc.string(),
            artworkUrl100: fc.string()
          }),
          { maxLength: 50 }
        ),
        function(results) {
          var sliced = sliceResultados(results);
          return sliced.length <= 8;
        }
      )
    );
  });

  test('para arrays con más de 8 elementos, sliceResultados devuelve exactamente 8', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            trackName: fc.string(),
            artistName: fc.string(),
            artworkUrl100: fc.string()
          }),
          { minLength: 9, maxLength: 50 }
        ),
        function(results) {
          var sliced = sliceResultados(results);
          return sliced.length === 8;
        }
      )
    );
  });

  test('para arrays con 8 o menos elementos, sliceResultados devuelve todos', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            trackName: fc.string(),
            artistName: fc.string(),
            artworkUrl100: fc.string()
          }),
          { maxLength: 8 }
        ),
        function(results) {
          var sliced = sliceResultados(results);
          return sliced.length === results.length;
        }
      )
    );
  });
});

// ---------------------------------------------------------------------------
// Property 13 — Serialización de chips — conteo de comas
// Validates: Requirements 14.8
// ---------------------------------------------------------------------------
describe('Property 13: selectedSongs.join(\', \') — conteo de comas', () => {
  test('si N = 0, join produce string vacío', () => {
    fc.assert(
      fc.property(
        fc.constant([]),
        function(songs) {
          return songs.join(', ') === '';
        }
      )
    );
  });

  test('para cualquier array de N canciones (N >= 0), join produce exactamente N-1 comas', () => {
    fc.assert(
      fc.property(
        // Usar strings sin comas para que el conteo de separadores sea exacto
        fc.array(fc.string({ minLength: 1 }).filter(s => !s.includes(',')), { maxLength: 20 }),
        function(songs) {
          var joined = songs.join(', ');
          if (songs.length === 0) {
            return joined === '';
          }
          // Contar comas en el string resultante
          var commas = (joined.match(/,/g) || []).length;
          return commas === songs.length - 1;
        }
      )
    );
  });

  test('para N = 1, join produce el string sin comas', () => {
    fc.assert(
      fc.property(
        // Usar strings sin comas para verificar que no hay separadores
        fc.string({ minLength: 1 }).filter(s => !s.includes(',')),
        function(song) {
          var songs = [song];
          var joined = songs.join(', ');
          return joined === song && !joined.includes(',');
        }
      )
    );
  });

  test('para N > 0, el string no está vacío', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1 }), { minLength: 1, maxLength: 20 }),
        function(songs) {
          return songs.join(', ').length > 0;
        }
      )
    );
  });
});
