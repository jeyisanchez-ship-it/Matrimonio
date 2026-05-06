// Feature: wedding-invitation-app, Property 8: Condición de envío de correo

const fc = require('fast-check');

// ── Función pura extraída de Code.gs para testing ────────────────────────────

/**
 * Valida el formato básico de una dirección de correo electrónico.
 * Replica validarEmail_ de Code.gs.
 *
 * @param {string} email
 * @returns {boolean}
 */
function validarEmail_(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Determina si se debe invocar la función de envío de correo.
 * Replica la condición de guardarConfirmacion_ en Code.gs.
 *
 * @param {boolean} enviarCorreo
 * @param {string} correo
 * @returns {boolean}
 */
function debeEnviarCorreo(enviarCorreo, correo) {
  return enviarCorreo === true && validarEmail_(correo);
}

// ── Tests unitarios de validarEmail_ ─────────────────────────────────────────

describe('validarEmail_ — tests unitarios', () => {
  test('email válido simple', () => {
    expect(validarEmail_('usuario@dominio.com')).toBe(true);
  });

  test('email válido con subdominio', () => {
    expect(validarEmail_('user@mail.example.co')).toBe(true);
  });

  test('email válido con números', () => {
    expect(validarEmail_('user123@test.org')).toBe(true);
  });

  test('email vacío: inválido', () => {
    expect(validarEmail_('')).toBe(false);
  });

  test('email sin @: inválido', () => {
    expect(validarEmail_('usuariodominio.com')).toBe(false);
  });

  test('email sin dominio: inválido', () => {
    expect(validarEmail_('usuario@')).toBe(false);
  });

  test('email sin extensión de dominio: inválido', () => {
    expect(validarEmail_('usuario@dominio')).toBe(false);
  });

  test('email con espacios: inválido', () => {
    expect(validarEmail_('usuario @dominio.com')).toBe(false);
  });

  test('email con @ al inicio: inválido', () => {
    expect(validarEmail_('@dominio.com')).toBe(false);
  });

  test('email con doble @: inválido', () => {
    expect(validarEmail_('a@@b.com')).toBe(false);
  });

  test('solo @: inválido', () => {
    expect(validarEmail_('@')).toBe(false);
  });
});

// ── Tests unitarios de debeEnviarCorreo ──────────────────────────────────────

describe('debeEnviarCorreo — tests unitarios', () => {
  test('enviarCorreo true + email válido → debe enviar', () => {
    expect(debeEnviarCorreo(true, 'test@example.com')).toBe(true);
  });

  test('enviarCorreo false + email válido → NO debe enviar', () => {
    expect(debeEnviarCorreo(false, 'test@example.com')).toBe(false);
  });

  test('enviarCorreo true + email inválido → NO debe enviar', () => {
    expect(debeEnviarCorreo(true, 'no-es-email')).toBe(false);
  });

  test('enviarCorreo false + email inválido → NO debe enviar', () => {
    expect(debeEnviarCorreo(false, 'no-es-email')).toBe(false);
  });

  test('enviarCorreo true + email vacío → NO debe enviar', () => {
    expect(debeEnviarCorreo(true, '')).toBe(false);
  });

  test('enviarCorreo true + email sin @ → NO debe enviar', () => {
    expect(debeEnviarCorreo(true, 'sinArroba.com')).toBe(false);
  });
});

// ── Property 8: Condición de envío de correo es una función booleana pura ────

describe('Property 8: Condición de envío de correo', () => {
  /**
   * Validates: Requirements 5.1, 5.2
   *
   * Para cualquier combinación (enviarCorreo: boolean, correo: string),
   * la función de envío se invoca si y solo si:
   *   enviarCorreo === true AND correo pasa la regex /^[^\s@]+@[^\s@]+\.[^\s@]+$/
   */
  test('enviarCorreo() se invoca si y solo si enviarCorreo===true AND correo es válido', () => {
    fc.assert(
      fc.property(
        fc.boolean(),
        fc.string({ maxLength: 50 }),
        (enviarCorreo, correo) => {
          const emailValido = validarEmail_(correo);
          const debeEnviar = enviarCorreo === true && emailValido;
          const resultado = debeEnviarCorreo(enviarCorreo, correo);

          // La condición debe ser exactamente la conjunción de ambas condiciones
          return resultado === debeEnviar;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('con enviarCorreo=false, nunca se invoca independientemente del correo', () => {
    fc.assert(
      fc.property(
        fc.string({ maxLength: 50 }),
        (correo) => {
          return debeEnviarCorreo(false, correo) === false;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('con correo inválido, nunca se invoca independientemente de enviarCorreo', () => {
    // Generador de strings que NO son emails válidos
    const correoInvalido = fc.string({ maxLength: 30 }).filter(s => !validarEmail_(s));

    fc.assert(
      fc.property(
        fc.boolean(),
        correoInvalido,
        (enviarCorreo, correo) => {
          return debeEnviarCorreo(enviarCorreo, correo) === false;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('con enviarCorreo=true y email válido, siempre se invoca', () => {
    // Generador de emails válidos
    const emailValido = fc.tuple(
      fc.string({ minLength: 1, maxLength: 10 }).filter(s => !/[\s@]/.test(s) && s.length > 0),
      fc.string({ minLength: 1, maxLength: 10 }).filter(s => !/[\s@]/.test(s) && s.length > 0),
      fc.string({ minLength: 2, maxLength: 5 }).filter(s => !/[\s@]/.test(s) && s.length > 0)
    ).map(([user, domain, tld]) => `${user}@${domain}.${tld}`);

    fc.assert(
      fc.property(
        emailValido,
        (correo) => {
          return debeEnviarCorreo(true, correo) === true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
