// Feature: wedding-invitation-app, Property 11: Contraste de color cumple WCAG 2.1 AA

/**
 * Calcula la luminancia relativa de un color hexadecimal según WCAG 2.1.
 * @param {string} hex - Color en formato hexadecimal (e.g. "#4a6b55")
 * @returns {number} Luminancia relativa entre 0 y 1
 */
function calcularLuminancia(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const linearize = (c) =>
    c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);

  const R = linearize(r);
  const G = linearize(g);
  const B = linearize(b);

  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

/**
 * Calcula el ratio de contraste entre dos colores hexadecimales según WCAG 2.1.
 * @param {string} hex1 - Primer color en formato hexadecimal
 * @param {string} hex2 - Segundo color en formato hexadecimal
 * @returns {number} Ratio de contraste (siempre >= 1)
 */
function calcularContraste(hex1, hex2) {
  const L1 = calcularLuminancia(hex1);
  const L2 = calcularLuminancia(hex2);
  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);
  return (lighter + 0.05) / (darker + 0.05);
}

// **Validates: Requirements 11**
describe('Property 11: Contraste de color cumple WCAG 2.1 AA', () => {
  const UMBRAL_WCAG_AA = 4.5;

  const pares = [
    {
      descripcion: 'Texto principal #2c2c2c sobre fondo crema #efe1d1',
      texto: '#2c2c2c',
      fondo: '#efe1d1',
    },
    {
      descripcion: 'Texto de botón #ffffff sobre verde #4a6b55',
      texto: '#ffffff',
      fondo: '#4a6b55',
    },
    {
      descripcion: 'Texto de etiqueta #4a6b55 sobre fondo blanco #ffffff',
      texto: '#4a6b55',
      fondo: '#ffffff',
    },
  ];

  pares.forEach(({ descripcion, texto, fondo }) => {
    test(`${descripcion} tiene ratio >= ${UMBRAL_WCAG_AA}:1`, () => {
      const ratio = calcularContraste(texto, fondo);
      expect(ratio).toBeGreaterThanOrEqual(UMBRAL_WCAG_AA);
    });
  });
});
