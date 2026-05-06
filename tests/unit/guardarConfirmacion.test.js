// Feature: wedding-invitation-app, Properties 5, 6, 7: Guardado de confirmación

const fc = require('fast-check');

// ── Función pura extraída de Code.gs para testing ────────────────────────────

/**
 * Replica la lógica de guardarConfirmacion_ de Code.gs.
 * Recibe el spreadsheet stub y la fecha como parámetros para facilitar el testing.
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

// ── Stub de Spreadsheet ──────────────────────────────────────────────────────

/**
 * Crea un stub de Spreadsheet que simula Hoja_Invitados y Hoja_Respuestas.
 *
 * @param {Array[]} filasInvitados - Filas de datos de invitados (sin encabezado).
 * @returns {{ ss, getRespuestasRows, getInvitadoEstado }}
 */
function crearSpreadsheetStub(filasInvitados) {
  // Encabezados + filas de invitados
  const encabezadosInv = [['ID', 'Nombre', 'ID_Vinculado', 'Estado']];
  // Copia profunda para que los setValue no afecten el original
  const datosInvitados = encabezadosInv.concat(
    filasInvitados.map(f => [...f])
  );

  // Hoja_Respuestas: solo encabezados inicialmente
  const encabezadosResp = [['ID', 'Fecha', 'Enviar_Correo', 'Correo_Electrónico', 'Asistentes', 'Restricciones', 'Bebida', 'Canciones', 'Consejo']];
  const datosRespuestas = [...encabezadosResp];

  const hojaInvitados = {
    getDataRange: () => ({
      getValues: () => datosInvitados.map(f => [...f])
    }),
    getRange: (fila, col) => ({
      setValue: (val) => {
        datosInvitados[fila - 1][col - 1] = val;
      }
    })
  };

  const hojaRespuestas = {
    appendRow: (fila) => {
      datosRespuestas.push([...fila]);
    },
    getDataRange: () => ({
      getValues: () => datosRespuestas.map(f => [...f])
    })
  };

  const ss = {
    getSheetByName: (nombre) => {
      if (nombre === 'Invitados') return hojaInvitados;
      if (nombre === 'Respuestas') return hojaRespuestas;
      return null;
    }
  };

  return {
    ss,
    getRespuestasRows: () => datosRespuestas.length - 1, // sin encabezado
    getInvitadoEstado: (id) => {
      for (let i = 1; i < datosInvitados.length; i++) {
        if (datosInvitados[i][0] === id) return datosInvitados[i][3];
      }
      return null;
    }
  };
}

// ── Tests unitarios ──────────────────────────────────────────────────────────

describe('guardarConfirmacion_ — tests unitarios', () => {
  const now = new Date('2026-05-10T14:32:00.000Z');

  test('ID válido: retorna success true e inserta fila en Respuestas', () => {
    const { ss, getRespuestasRows } = crearSpreadsheetStub([
      ['INV001', 'Ana García', '', 'Pendiente']
    ]);
    const antes = getRespuestasRows();
    const result = guardarConfirmacion_({ id: 'INV001', enviarCorreo: false, correo: '', asistentes: 2, restricciones: 'Ninguna', bebida: 'Vino', canciones: '', consejo: '' }, ss, now);
    expect(result.success).toBe(true);
    expect(getRespuestasRows()).toBe(antes + 1);
  });

  test('ID inválido: retorna success false y no inserta fila', () => {
    const { ss, getRespuestasRows } = crearSpreadsheetStub([
      ['INV001', 'Ana García', '', 'Pendiente']
    ]);
    const antes = getRespuestasRows();
    const result = guardarConfirmacion_({ id: 'INEXISTENTE', enviarCorreo: false, correo: '', asistentes: 1, restricciones: 'Ninguna', bebida: 'Vino', canciones: '', consejo: '' }, ss, now);
    expect(result.success).toBe(false);
    expect(result.error).toBeTruthy();
    expect(getRespuestasRows()).toBe(antes);
  });

  test('confirmarVinculado true: actualiza estado del vinculado', () => {
    const { ss, getInvitadoEstado } = crearSpreadsheetStub([
      ['INV001', 'Ana García', 'INV002', 'Pendiente'],
      ['INV002', 'Luis García', '', 'Pendiente']
    ]);
    guardarConfirmacion_({ id: 'INV001', confirmarVinculado: true, enviarCorreo: false, correo: '', asistentes: 2, restricciones: 'Ninguna', bebida: 'Vino', canciones: '', consejo: '' }, ss, now);
    expect(getInvitadoEstado('INV001')).toBe('Confirmado');
    expect(getInvitadoEstado('INV002')).toBe('Confirmado');
  });

  test('confirmarVinculado false: NO actualiza estado del vinculado', () => {
    const { ss, getInvitadoEstado } = crearSpreadsheetStub([
      ['INV001', 'Ana García', 'INV002', 'Pendiente'],
      ['INV002', 'Luis García', '', 'Pendiente']
    ]);
    guardarConfirmacion_({ id: 'INV001', confirmarVinculado: false, enviarCorreo: false, correo: '', asistentes: 1, restricciones: 'Ninguna', bebida: 'Vino', canciones: '', consejo: '' }, ss, now);
    expect(getInvitadoEstado('INV001')).toBe('Confirmado');
    expect(getInvitadoEstado('INV002')).toBe('Pendiente');
  });

  test('la fila insertada contiene el ID correcto y un timestamp ISO 8601 válido', () => {
    const encabezadosResp = [['ID', 'Fecha', 'Enviar_Correo', 'Correo_Electrónico', 'Asistentes', 'Restricciones', 'Bebida', 'Canciones', 'Consejo']];
    const datosRespuestas = [...encabezadosResp];

    const hojaInvitados = {
      getDataRange: () => ({
        getValues: () => [
          ['ID', 'Nombre', 'ID_Vinculado', 'Estado'],
          ['INV001', 'Ana García', '', 'Pendiente']
        ]
      }),
      getRange: () => ({ setValue: () => {} })
    };

    const hojaRespuestas = {
      appendRow: (fila) => datosRespuestas.push([...fila]),
      getDataRange: () => ({ getValues: () => datosRespuestas })
    };

    const ss = {
      getSheetByName: (n) => n === 'Invitados' ? hojaInvitados : hojaRespuestas
    };

    guardarConfirmacion_({ id: 'INV001', enviarCorreo: false, correo: '', asistentes: 1, restricciones: 'Ninguna', bebida: 'Vino', canciones: '', consejo: '' }, ss, now);

    const filaInsertada = datosRespuestas[1];
    expect(filaInsertada[0]).toBe('INV001');
    expect(new Date(filaInsertada[1]).toISOString()).toBe(now.toISOString());
  });
});

// ── Property 5: Guardado exitoso inserta exactamente una fila ────────────────

describe('Property 5: Guardado exitoso inserta exactamente una fila y retorna success', () => {
  /**
   * Validates: Requirements 4.1, 4.6
   *
   * Para cualquier datos con ID válido, guardarConfirmacion_ debe:
   * 1. Incrementar filas en Respuestas en exactamente 1.
   * 2. Retornar success === true.
   */
  test('para cualquier ID válido, incrementa filas en 1 y success === true', () => {
    const estadoArbitrario = fc.constantFrom('Pendiente', 'Confirmado');
    const idArbitrario = fc.string({ minLength: 1, maxLength: 10 }).filter(s => s.trim().length > 0);

    fc.assert(
      fc.property(
        idArbitrario,
        fc.string({ minLength: 1, maxLength: 30 }),
        estadoArbitrario,
        (id, nombre, estado) => {
          const { ss, getRespuestasRows } = crearSpreadsheetStub([
            [id, nombre, '', estado]
          ]);
          const antes = getRespuestasRows();
          const result = guardarConfirmacion_(
            { id, enviarCorreo: false, correo: '', asistentes: 1, restricciones: 'Ninguna', bebida: 'Vino', canciones: '', consejo: '' },
            ss,
            new Date()
          );
          return result.success === true && getRespuestasRows() === antes + 1;
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ── Property 6: Estado siempre Confirmado tras guardado exitoso ──────────────

describe('Property 6: Estado siempre Confirmado tras guardado exitoso', () => {
  /**
   * Validates: Requirements 4.2, 4.3
   *
   * Para cualquier invitado Pendiente con datos válidos:
   * - El Estado del invitado principal es "Confirmado" después del guardado.
   * - Si confirmarVinculado === true y hay vinculado, el vinculado también es "Confirmado".
   */
  test('invitado principal queda Confirmado tras guardado exitoso', () => {
    const idArbitrario = fc.string({ minLength: 1, maxLength: 10 }).filter(s => s.trim().length > 0);

    fc.assert(
      fc.property(
        idArbitrario,
        fc.string({ minLength: 1, maxLength: 30 }),
        (id, nombre) => {
          const { ss, getInvitadoEstado } = crearSpreadsheetStub([
            [id, nombre, '', 'Pendiente']
          ]);
          guardarConfirmacion_(
            { id, confirmarVinculado: false, enviarCorreo: false, correo: '', asistentes: 1, restricciones: 'Ninguna', bebida: 'Vino', canciones: '', consejo: '' },
            ss,
            new Date()
          );
          return getInvitadoEstado(id) === 'Confirmado';
        }
      ),
      { numRuns: 100 }
    );
  });

  test('vinculado queda Confirmado cuando confirmarVinculado === true', () => {
    const idArbitrario = fc.string({ minLength: 1, maxLength: 8 }).filter(s => s.trim().length > 0);

    fc.assert(
      fc.property(
        idArbitrario,
        idArbitrario,
        fc.string({ minLength: 1, maxLength: 20 }),
        fc.string({ minLength: 1, maxLength: 20 }),
        (id1, id2, nombre1, nombre2) => {
          // Asegurar IDs distintos
          if (id1 === id2) return true;

          const { ss, getInvitadoEstado } = crearSpreadsheetStub([
            [id1, nombre1, id2, 'Pendiente'],
            [id2, nombre2, '', 'Pendiente']
          ]);
          guardarConfirmacion_(
            { id: id1, confirmarVinculado: true, enviarCorreo: false, correo: '', asistentes: 2, restricciones: 'Ninguna', bebida: 'Vino', canciones: '', consejo: '' },
            ss,
            new Date()
          );
          return getInvitadoEstado(id1) === 'Confirmado' && getInvitadoEstado(id2) === 'Confirmado';
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ── Property 7: ID inválido no modifica Hoja_Respuestas ─────────────────────

describe('Property 7: ID inválido no modifica Sheets', () => {
  /**
   * Validates: Requirements 4.4
   *
   * Para cualquier string que no exista como ID:
   * 1. success === false y error no vacío.
   * 2. Filas en Respuestas no cambian.
   * 3. Ningún Estado se modifica.
   */
  test('ID inexistente: success false, filas no cambian, estados no se modifican', () => {
    const idExistente = fc.string({ minLength: 1, maxLength: 8 }).filter(s => s.trim().length > 0);
    const idInexistente = fc.string({ minLength: 1, maxLength: 8 }).filter(s => s.trim().length > 0);

    fc.assert(
      fc.property(
        idExistente,
        idInexistente,
        fc.string({ minLength: 1, maxLength: 20 }),
        (idValido, idInvalido, nombre) => {
          // Asegurar que el ID inválido no coincide con el válido
          if (idValido === idInvalido) return true;

          const { ss, getRespuestasRows, getInvitadoEstado } = crearSpreadsheetStub([
            [idValido, nombre, '', 'Pendiente']
          ]);
          const filaAntes = getRespuestasRows();
          const estadoAntes = getInvitadoEstado(idValido);

          const result = guardarConfirmacion_(
            { id: idInvalido, enviarCorreo: false, correo: '', asistentes: 1, restricciones: 'Ninguna', bebida: 'Vino', canciones: '', consejo: '' },
            ss,
            new Date()
          );

          return (
            result.success === false &&
            typeof result.error === 'string' &&
            result.error.length > 0 &&
            getRespuestasRows() === filaAntes &&
            getInvitadoEstado(idValido) === estadoAntes
          );
        }
      ),
      { numRuns: 100 }
    );
  });
});
