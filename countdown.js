/**
 * countdown.js
 * Lógica pura de la cuenta regresiva — extraída para ser testeable con Jest.
 * Importada desde Index.html con <script src="countdown.js"> en entorno local,
 * y exportada condicionalmente para Node.js / Jest.
 *
 * Feature: wedding-invitation-app
 */

'use strict';

/**
 * Calcula la diferencia entre `ahora` y la fecha del evento.
 * Función pura: no accede al DOM ni a Date.now() directamente.
 *
 * @param {number} ahora       - Timestamp en milisegundos (ej: Date.now()).
 * @param {number} fechaEvento - Timestamp en milisegundos de la fecha del evento.
 * @returns {{ dias: number, horas: number, minutos: number, segundos: number }
 *          | { especial: true }}
 *   Retorna { especial: true } cuando ahora >= fechaEvento.
 */
function calcCountdown(ahora, fechaEvento) {
  var diff = fechaEvento - ahora;

  if (diff <= 0) {
    return { especial: true };
  }

  var totalSegundos = Math.floor(diff / 1000);
  var segundos = totalSegundos % 60;
  var totalMinutos = Math.floor(totalSegundos / 60);
  var minutos = totalMinutos % 60;
  var totalHoras = Math.floor(totalMinutos / 60);
  var horas = totalHoras % 24;
  var dias = Math.floor(totalHoras / 24);

  return { dias: dias, horas: horas, minutos: minutos, segundos: segundos };
}

// Exportación condicional para Node.js / Jest
if (typeof module !== 'undefined') {
  module.exports = { calcCountdown: calcCountdown };
}
