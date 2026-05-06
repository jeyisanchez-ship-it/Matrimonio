/**
 * Wedding Invitation App — Code.gs
 * Google Apps Script back-end para la invitación de boda de Jennifer & Leonardo.
 * Fecha del evento: 15 de agosto de 2026.
 */

/**
 * ⚠️ NO EJECUTAR MANUALMENTE - Esta función se llama automáticamente desde la URL
 * Para probar, usa: probarDoGetConINV001()
 */
function doGet(e) {
  return doGet_(e.parameter, SpreadsheetApp.getActiveSpreadsheet(), new Date());
}

/**
 * 🧪 FUNCIÓN DE PRUEBA: Simula acceder a la URL con ?id=INV001
 * Ejecutar esta función desde el editor para probar doGet sin abrir el navegador.
 */
function probarDoGetConINV001() {
  Logger.log('🧪 ═══════════════════════════════════════════════════');
  Logger.log('🧪 PRUEBA: Simulando acceso a URL con ?id=INV001');
  Logger.log('🧪 ═══════════════════════════════════════════════════');
  
  var params = { id: 'INV001' };
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var now = new Date();
  
  try {
    var resultado = doGet_(params, ss, now);
    Logger.log('✅ doGet_ ejecutado exitosamente');
    Logger.log('📄 Tipo de resultado: ' + typeof resultado);
    Logger.log('📄 Título: ' + resultado.getTitle());
    Logger.log('');
    Logger.log('✅ TODO FUNCIONA CORRECTAMENTE');
    Logger.log('🌐 Ahora prueba en el navegador:');
    Logger.log('https://script.google.com/macros/s/AKfycbx0aWVTaYdjjbZrb2HxmiG9ncjn6KDy2R2zBmYLvq-RAM0TcMkjdONXW4C4jkFZMPkK0A/exec?id=INV001');
    
    SpreadsheetApp.getUi().alert(
      '✅ Prueba Exitosa',
      'La función doGet funciona correctamente.\n\n' +
      'Ahora prueba en el navegador:\n' +
      'https://script.google.com/.../exec?id=INV001\n\n' +
      'Revisa el Logger (Ver → Registros) para más detalles.',
      SpreadsheetApp.getUi().ButtonSet.OK
    );
  } catch (error) {
    Logger.log('❌ ERROR: ' + error.toString());
    Logger.log('📍 Stack: ' + error.stack);
    
    SpreadsheetApp.getUi().alert(
      '❌ Error en la Prueba',
      'Error: ' + error.toString() + '\n\n' +
      'Revisa el Logger (Ver → Registros) para más detalles.',
      SpreadsheetApp.getUi().ButtonSet.OK
    );
  }
}

/**
 * 🧪 FUNCIÓN DE PRUEBA: Simula acceder al Dashboard
 * Ejecutar esta función desde el editor para probar el Dashboard.
 */
function probarDashboard() {
  Logger.log('🧪 ═══════════════════════════════════════════════════');
  Logger.log('🧪 PRUEBA: Simulando acceso a Dashboard');
  Logger.log('🧪 ═══════════════════════════════════════════════════');
  
  var params = { page: 'dashboard' };
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var now = new Date();
  
  try {
    var resultado = doGet_(params, ss, now);
    Logger.log('✅ Dashboard ejecutado exitosamente');
    Logger.log('📄 Título: ' + resultado.getTitle());
    Logger.log('');
    Logger.log('✅ TODO FUNCIONA CORRECTAMENTE');
    Logger.log('🌐 Ahora prueba en el navegador:');
    Logger.log('https://script.google.com/macros/s/AKfycbx0aWVTaYdjjbZrb2HxmiG9ncjn6KDy2R2zBmYLvq-RAM0TcMkjdONXW4C4jkFZMPkK0A/exec?page=dashboard');
    
    SpreadsheetApp.getUi().alert(
      '✅ Prueba Exitosa',
      'El Dashboard funciona correctamente.\n\n' +
      'Ahora prueba en el navegador:\n' +
      'https://script.google.com/.../exec?page=dashboard\n\n' +
      'Revisa el Logger (Ver → Registros) para más detalles.',
      SpreadsheetApp.getUi().ButtonSet.OK
    );
  } catch (error) {
    Logger.log('❌ ERROR: ' + error.toString());
    Logger.log('📍 Stack: ' + error.stack);
    
    SpreadsheetApp.getUi().alert(
      '❌ Error en la Prueba',
      'Error: ' + error.toString() + '\n\n' +
      'Revisa el Logger (Ver → Registros) para más detalles.',
      SpreadsheetApp.getUi().ButtonSet.OK
    );
  }
}

/**
 * � CONFIGURACIÓN RÁPIDA: Actualiza el ID de la carpeta de Google Drive
 * Ejecutar esta función para configurar la carpeta de fotos.
 */
function configurarCarpetaDrive() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var hoja = ss.getSheetByName('Parametros');
  
  if (!hoja) {
    SpreadsheetApp.getUi().alert(
      '❌ Error',
      'La hoja "Parametros" no existe.\n\nEjecuta primero: inicializarParametros()',
      SpreadsheetApp.getUi().ButtonSet.OK
    );
    return;
  }
  
  // ID de la carpeta de Google Drive
  var folderId = '1buzJKYWq9o2AyCxzeGc27tFqCBeNAkw-';
  
  var datos = hoja.getDataRange().getValues();
  var actualizado = false;
  
  // Buscar la fila con drive_folder_id
  for (var i = 1; i < datos.length; i++) {
    if (datos[i][1] === 'drive_folder_id') {
      hoja.getRange(i + 1, 3).setValue(folderId);
      actualizado = true;
      Logger.log('✅ drive_folder_id actualizado: ' + folderId);
      break;
    }
  }
  
  if (actualizado) {
    // Refrescar caché
    var cache = CacheService.getScriptCache();
    cache.remove('parametros_config');
    
    SpreadsheetApp.getUi().alert(
      '✅ Carpeta de Drive Configurada',
      'ID de carpeta actualizado:\n' + folderId + '\n\n' +
      'URL completa:\n' +
      'https://drive.google.com/drive/folders/' + folderId + '\n\n' +
      'El botón de fotos ahora aparecerá en la página de agradecimiento.',
      SpreadsheetApp.getUi().ButtonSet.OK
    );
    Logger.log('✅ Configuración completada y caché refrescado');
  } else {
    SpreadsheetApp.getUi().alert(
      '⚠️ Advertencia',
      'No se encontró la fila "drive_folder_id" en la hoja Parametros.\n\n' +
      'Verifica que la hoja esté correctamente inicializada.',
      SpreadsheetApp.getUi().ButtonSet.OK
    );
    Logger.log('⚠️ No se encontró drive_folder_id en Parametros');
  }
}

/**
 * 🔧 CONFIGURACIÓN RÁPIDA: Actualiza la URL de la Web App
 * Ejecutar esta función después del primer deployment.
 */
function configurarWebAppURL() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var hoja = ss.getSheetByName('Parametros');
  
  if (!hoja) {
    SpreadsheetApp.getUi().alert(
      '❌ Error',
      'La hoja "Parametros" no existe.\n\nEjecuta primero: inicializarParametros()',
      SpreadsheetApp.getUi().ButtonSet.OK
    );
    return;
  }
  
  // URL de la Web App
  var webappUrl = 'https://script.google.com/macros/s/AKfycbx0aWVTaYdjjbZrb2HxmiG9ncjn6KDy2R2zBmYLvq-RAM0TcMkjdONXW4C4jkFZMPkK0A/exec';
  
  var datos = hoja.getDataRange().getValues();
  var actualizado = false;
  
  // Buscar la fila con webapp_url
  for (var i = 1; i < datos.length; i++) {
    if (datos[i][1] === 'webapp_url') {
      hoja.getRange(i + 1, 3).setValue(webappUrl);
      actualizado = true;
      Logger.log('✅ webapp_url actualizado: ' + webappUrl);
      break;
    }
  }
  
  if (actualizado) {
    // Refrescar caché
    var cache = CacheService.getScriptCache();
    cache.remove('parametros_config');
    
    SpreadsheetApp.getUi().alert(
      '✅ URL de Web App Configurada',
      'URL actualizada:\n' + webappUrl + '\n\n' +
      'Los correos ahora usarán esta URL correctamente.',
      SpreadsheetApp.getUi().ButtonSet.OK
    );
    Logger.log('✅ Configuración completada y caché refrescado');
  } else {
    SpreadsheetApp.getUi().alert(
      '⚠️ Advertencia',
      'No se encontró la fila "webapp_url" en la hoja Parametros.\n\n' +
      'Verifica que la hoja esté correctamente inicializada.',
      SpreadsheetApp.getUi().ButtonSet.OK
    );
    Logger.log('⚠️ No se encontró webapp_url en Parametros');
  }
}

/**
 * 🚀 CONFIGURACIÓN COMPLETA: Ejecuta todas las configuraciones necesarias
 * Ejecutar esta función después del primer deployment para configurar todo.
 */
function configuracionCompleta() {
  Logger.log('🚀 ═══════════════════════════════════════════════════');
  Logger.log('🚀 INICIANDO CONFIGURACIÓN COMPLETA');
  Logger.log('🚀 ═══════════════════════════════════════════════════');
  Logger.log('');
  
  // 1. Configurar URL de Web App
  Logger.log('1️⃣ Configurando URL de Web App...');
  configurarWebAppURL();
  
  // 2. Configurar carpeta de Drive
  Logger.log('2️⃣ Configurando carpeta de Google Drive...');
  configurarCarpetaDrive();
  
  Logger.log('');
  Logger.log('✅ ═══════════════════════════════════════════════════');
  Logger.log('✅ CONFIGURACIÓN COMPLETA FINALIZADA');
  Logger.log('✅ ═══════════════════════════════════════════════════');
  
  SpreadsheetApp.getUi().alert(
    '✅ Configuración Completa',
    'Se han configurado:\n\n' +
    '✅ URL de Web App\n' +
    '✅ Carpeta de Google Drive\n\n' +
    'Tu aplicación está lista para usar.\n\n' +
    'Revisa el Logger (Ver → Registros) para más detalles.',
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

/**
 * �🔍 DIAGNÓSTICO: Verifica qué archivos HTML están disponibles en el proyecto
 * Ejecutar esta función para diagnosticar problemas de archivos faltantes.
 */
function verificarArchivosHTML() {
  Logger.log('🔍 ═══════════════════════════════════════════════════');
  Logger.log('🔍 VERIFICANDO ARCHIVOS HTML EN EL PROYECTO');
  Logger.log('🔍 ═══════════════════════════════════════════════════');
  Logger.log('');
  
  var archivosRequeridos = ['Index', 'Dashboard', 'Agradecimiento'];
  var archivosEncontrados = [];
  var archivosFaltantes = [];
  
  for (var i = 0; i < archivosRequeridos.length; i++) {
    var nombreArchivo = archivosRequeridos[i];
    try {
      HtmlService.createTemplateFromFile(nombreArchivo);
      archivosEncontrados.push(nombreArchivo);
      Logger.log('✅ ' + nombreArchivo + '.html - ENCONTRADO');
    } catch (e) {
      archivosFaltantes.push(nombreArchivo);
      Logger.log('❌ ' + nombreArchivo + '.html - NO ENCONTRADO');
    }
  }
  
  Logger.log('');
  Logger.log('📊 RESUMEN:');
  Logger.log('  Archivos encontrados: ' + archivosEncontrados.length + '/' + archivosRequeridos.length);
  Logger.log('  Archivos faltantes: ' + archivosFaltantes.length);
  
  if (archivosFaltantes.length > 0) {
    Logger.log('');
    Logger.log('⚠️ ACCIÓN REQUERIDA:');
    Logger.log('  Debes agregar estos archivos HTML al proyecto de Google Apps Script:');
    for (var j = 0; j < archivosFaltantes.length; j++) {
      Logger.log('  • ' + archivosFaltantes[j] + '.html');
    }
    Logger.log('');
    Logger.log('💡 CÓMO AGREGAR ARCHIVOS:');
    Logger.log('  1. En el editor de GAS, haz clic en el + junto a "Archivos"');
    Logger.log('  2. Selecciona "HTML"');
    Logger.log('  3. Nómbralo exactamente: ' + archivosFaltantes[0]);
    Logger.log('  4. Copia y pega el contenido del archivo local');
    
    SpreadsheetApp.getUi().alert(
      '⚠️ Archivos Faltantes',
      'Faltan ' + archivosFaltantes.length + ' archivo(s) HTML:\n\n' +
      archivosFaltantes.map(function(f) { return '• ' + f + '.html'; }).join('\n') + '\n\n' +
      'Debes agregarlos al proyecto de Google Apps Script.\n\n' +
      'Revisa el Logger (Ver → Registros) para instrucciones detalladas.',
      SpreadsheetApp.getUi().ButtonSet.OK
    );
  } else {
    Logger.log('');
    Logger.log('✅ TODOS LOS ARCHIVOS HTML ESTÁN PRESENTES');
    Logger.log('✅ La aplicación debería funcionar correctamente');
    
    SpreadsheetApp.getUi().alert(
      '✅ Verificación Exitosa',
      'Todos los archivos HTML están presentes:\n\n' +
      archivosEncontrados.map(function(f) { return '✅ ' + f + '.html'; }).join('\n') + '\n\n' +
      'La aplicación está lista para funcionar.',
      SpreadsheetApp.getUi().ButtonSet.OK
    );
  }
}

/**
 * 🔍 DIAGNÓSTICO: Verifica la estructura de la hoja Invitados y busca INV001
 * Ejecutar esta función para diagnosticar problemas con los datos.
 */
function diagnosticarINV001() {
  Logger.log('🔍 ═══════════════════════════════════════════════════');
  Logger.log('🔍 DIAGNÓSTICO: Verificando hoja Invitados');
  Logger.log('🔍 ═══════════════════════════════════════════════════');
  
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var hoja = ss.getSheetByName('Invitados');
  
  if (!hoja) { 
    Logger.log('❌ ERROR: Hoja Invitados no existe');
    Logger.log('💡 Solución: Ejecuta setupBaseDatos()');
    SpreadsheetApp.getUi().alert(
      '❌ Error',
      'La hoja "Invitados" no existe.\n\nEjecuta la función: setupBaseDatos()',
      SpreadsheetApp.getUi().ButtonSet.OK
    );
    return;
  }

  var datos = hoja.getDataRange().getValues();
  Logger.log('📊 Total filas (con encabezado): ' + datos.length);
  Logger.log('📋 Encabezados: ' + JSON.stringify(datos[0]));
  Logger.log('');

  // Verificar estructura
  var columnasEsperadas = ['ID', 'Nombre', 'ID_Vinculado', 'Estado', 'Max_Asistentes'];
  var problemas = [];
  
  for (var i = 0; i < columnasEsperadas.length; i++) {
    if (i >= datos[0].length) {
      problemas.push('❌ Falta columna: ' + columnasEsperadas[i]);
    } else if (datos[0][i] !== columnasEsperadas[i]) {
      problemas.push('⚠️ Columna ' + String.fromCharCode(65 + i) + ' esperada: "' + columnasEsperadas[i] + '", encontrada: "' + datos[0][i] + '"');
    }
  }
  
  if (problemas.length > 0) {
    Logger.log('⚠️ PROBLEMAS DE ESTRUCTURA:');
    for (var j = 0; j < problemas.length; j++) {
      Logger.log('  ' + problemas[j]);
    }
    Logger.log('');
  } else {
    Logger.log('✅ Estructura correcta');
    Logger.log('');
  }

  // Mostrar todos los invitados
  Logger.log('👥 INVITADOS:');
  for (var k = 1; k < datos.length; k++) {
    Logger.log('  Fila ' + k + ':');
    Logger.log('    ID: ' + JSON.stringify(datos[k][0]) + ' (tipo: ' + typeof datos[k][0] + ')');
    Logger.log('    Nombre: ' + datos[k][1]);
    Logger.log('    ID_Vinculado: ' + datos[k][2]);
    Logger.log('    Estado: ' + JSON.stringify(datos[k][3]));
    Logger.log('    Max_Asistentes: ' + datos[k][4]);
    Logger.log('');
  }

  // Buscar INV001
  Logger.log('🔎 Buscando INV001...');
  var fila = buscarFila_(datos, 'INV001');
  
  if (fila) {
    Logger.log('✅ INV001 ENCONTRADO:');
    Logger.log('  Nombre: ' + fila[1]);
    Logger.log('  ID_Vinculado: ' + fila[2]);
    Logger.log('  Estado: ' + fila[3]);
    Logger.log('  Max_Asistentes: ' + fila[4]);
    Logger.log('');
    Logger.log('✅ TODO CORRECTO - Puedes probar la URL en el navegador');
    
    SpreadsheetApp.getUi().alert(
      '✅ Diagnóstico Exitoso',
      'INV001 encontrado correctamente:\n\n' +
      'Nombre: ' + fila[1] + '\n' +
      'Estado: ' + fila[3] + '\n' +
      'Max_Asistentes: ' + fila[4] + '\n\n' +
      'Ahora ejecuta: probarDoGetConINV001()',
      SpreadsheetApp.getUi().ButtonSet.OK
    );
  } else {
    Logger.log('❌ INV001 NO ENCONTRADO');
    Logger.log('💡 IDs disponibles: ' + datos.slice(1).map(function(r) { return r[0]; }).join(', '));
    
    SpreadsheetApp.getUi().alert(
      '❌ INV001 No Encontrado',
      'El ID "INV001" no existe en la hoja Invitados.\n\n' +
      'IDs disponibles: ' + datos.slice(1).map(function(r) { return r[0]; }).join(', '),
      SpreadsheetApp.getUi().ButtonSet.OK
    );
  }
}

/**
 * Obtiene todos los parámetros de configuración con caché de 30 minutos.
 * Convierte automáticamente objetos Date a strings en formato ISO.
 * 
 * @returns {Object} Objeto con todos los parámetros { clave: valor }
 */
function obtenerParametros() {
  var cache = CacheService.getScriptCache();
  var cacheKey = 'parametros_config';
  
  // Intentar obtener del caché
  var cached = cache.get(cacheKey);
  if (cached) {
    Logger.log('📦 Parámetros obtenidos del caché');
    return JSON.parse(cached);
  }
  
  // Si no está en caché, leer de Sheets
  Logger.log('📖 Leyendo parámetros de Google Sheets...');
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var hoja = ss.getSheetByName('Parametros');
  
  if (!hoja) {
    Logger.log('⚠️ Hoja Parametros no existe. Ejecuta inicializarParametros() primero.');
    return {};
  }
  
  var datos = hoja.getDataRange().getValues();
  var parametros = {};
  
  // Saltar encabezado (fila 0)
  for (var i = 1; i < datos.length; i++) {
    var clave = datos[i][1];  // Columna B
    var valor = datos[i][2];  // Columna C
    if (clave) {
      // Convertir objetos Date a strings en formato ISO
      if (valor instanceof Date) {
        // Para fechas, usar formato YYYY-MM-DD
        if (clave.indexOf('fecha') !== -1 && clave.indexOf('hora') === -1) {
          valor = Utilities.formatDate(valor, Session.getScriptTimeZone(), 'yyyy-MM-dd');
        }
        // Para horas, usar formato HH:mm
        else if (clave.indexOf('hora') !== -1) {
          valor = Utilities.formatDate(valor, Session.getScriptTimeZone(), 'HH:mm');
        }
        // Para otros casos de Date, usar ISO completo
        else {
          valor = Utilities.formatDate(valor, Session.getScriptTimeZone(), 'yyyy-MM-dd\'T\'HH:mm:ss');
        }
      }
      parametros[clave] = valor;
    }
  }
  
  // Guardar en caché por 30 minutos (1800 segundos)
  cache.put(cacheKey, JSON.stringify(parametros), 1800);
  Logger.log('✅ Parámetros cargados y guardados en caché: ' + Object.keys(parametros).length + ' parámetros');
  
  return parametros;
}

/**
 * Refresca el caché de parámetros manualmente.
 * Útil después de editar la hoja Parametros.
 */
function refrescarCacheParametros() {
  var cache = CacheService.getScriptCache();
  cache.remove('parametros_config');
  Logger.log('🔄 Caché de parámetros eliminado');
  
  // Recargar
  var parametros = obtenerParametros();
  
  SpreadsheetApp.getUi().alert('✅ Caché refrescado!\n\nSe cargaron ' + Object.keys(parametros).length + ' parámetros.');
  return parametros;
}

/**
 * Obtiene un parámetro específico por su clave.
 * 
 * @param {string} clave - Clave del parámetro
 * @param {*} defaultValue - Valor por defecto si no existe
 * @returns {*} Valor del parámetro
 */
function obtenerParametro(clave, defaultValue) {
  var parametros = obtenerParametros();
  return parametros[clave] !== undefined ? parametros[clave] : defaultValue;
}

/**
 * Actualiza el timeline con descripciones más emotivas y detalladas.
 * Ejecutar manualmente para actualizar los eventos del día.
 * 
 * IMPORTANTE: Esta función SOBRESCRIBE los valores existentes del timeline.
 */
function actualizarTimelineMejorado() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var hoja = ss.getSheetByName('Parametros');
  
  if (!hoja) {
    Logger.log('❌ Error: La hoja Parametros no existe');
    return { success: false, error: 'Hoja Parametros no encontrada' };
  }
  
  // Nuevo timeline mejorado
  var nuevoTimeline = {
    'timeline_1': '12:30 PM|Bienvenida',
    'timeline_2': '1:00 PM|El "Sí, acepto" & bendición de Dios',
    'timeline_3': '2:00 PM|Abrazos, fotos y cócteles',
    'timeline_4': '3:00 PM|Palabras de amor y brindis',
    'timeline_5': '4:00 PM|Almuerzo como esposos',
    'timeline_6': '5:00 PM|¡A bailar se ha dicho!',
    'timeline_7': '7:00 PM|Fin de un día mágico'
  };
  
  var datos = hoja.getDataRange().getValues();
  var actualizados = 0;
  var agregados = 0;
  
  // Buscar y actualizar/agregar cada timeline
  for (var clave in nuevoTimeline) {
    var encontrado = false;
    var valor = nuevoTimeline[clave];
    
    // Buscar si ya existe
    for (var i = 1; i < datos.length; i++) {
      if (datos[i][1] === clave) {
        // Actualizar valor existente
        hoja.getRange(i + 1, 3).setValue(valor);
        actualizados++;
        encontrado = true;
        Logger.log('✅ Actualizado: ' + clave + ' = ' + valor);
        break;
      }
    }
    
    // Si no existe, agregarlo
    if (!encontrado) {
      hoja.appendRow(['Timeline', clave, valor, 'Formato: HORA|DESCRIPCIÓN']);
      agregados++;
      Logger.log('✅ Agregado: ' + clave + ' = ' + valor);
    }
  }
  
  // Refrescar caché
  var cache = CacheService.getScriptCache();
  cache.remove('parametros_config');
  
  var mensaje = '✅ Timeline actualizado!\n\n' +
    'Eventos actualizados: ' + actualizados + '\n' +
    'Eventos agregados: ' + agregados + '\n\n' +
    'Nuevo timeline:\n' +
    '• 12:30 PM - Bienvenida\n' +
    '• 1:00 PM - El "Sí, acepto" & bendición de Dios\n' +
    '• 2:00 PM - Abrazos, fotos y cócteles\n' +
    '• 3:00 PM - Palabras de amor y brindis\n' +
    '• 4:00 PM - Almuerzo como esposos\n' +
    '• 5:00 PM - ¡A bailar se ha dicho!\n' +
    '• 7:00 PM - Fin de un día mágico';
  
  Logger.log('');
  Logger.log('═══════════════════════════════════════');
  Logger.log(mensaje);
  Logger.log('═══════════════════════════════════════');
  
  try {
    SpreadsheetApp.getUi().alert('✅ Timeline Actualizado', mensaje, SpreadsheetApp.getUi().ButtonSet.OK);
  } catch (e) {
    // Si no hay UI disponible (ejecutando desde Apps Script), solo usar Logger
    Logger.log('ℹ️ Ejecutado desde Apps Script - revisa el Logger para ver resultados');
  }
  
  return { 
    success: true, 
    actualizados: actualizados, 
    agregados: agregados 
  };
}

/**
 * Actualiza los parámetros agregando nuevos sin sobrescribir los existentes.
 * Ejecutar manualmente cuando se agreguen nuevos parámetros.
 */
function actualizarParametros() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var hoja = ss.getSheetByName('Parametros');
  
  if (!hoja) {
    SpreadsheetApp.getUi().alert(
      '❌ Error',
      'La hoja "Parametros" no existe.\n\nEjecuta primero: inicializarParametros()',
      SpreadsheetApp.getUi().ButtonSet.OK
    );
    return;
  }
  
  // Nuevos parámetros a agregar
  var nuevosParametros = [
    ['Historia', 'historia_foto_url', 'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=400&h=400&fit=crop', 'URL de la foto circular de la pareja (400x400px recomendado)'],
    ['Historia', 'historia_foto_alt', 'Jennifer y Nicolás', 'Texto alternativo para la foto'],
    ['Historia', 'historia_titulo', 'Nuestra Historia', 'Título de la sección de historia'],
    
    // UBICACIÓN - Títulos
    ['Ubicación', 'ubicacion_titulo', '¿Dónde nos encontramos?', 'Título de la sección de ubicación'],
    
    // TIMELINE - Títulos
    ['Timeline', 'timeline_titulo', 'Programa del Día', 'Título de la sección de timeline'],
    
    // GALERÍA - Títulos
    ['Galería', 'galeria_titulo', 'Nuestros Momentos', 'Título de la sección de galería'],
    ['Galería', 'galeria_subtitulo', 'Algunos recuerdos que queremos compartir con ustedes', 'Subtítulo de la galería'],
    
    // SUBIR FOTOS
    ['Subir Fotos', 'subir_fotos_titulo', 'Comparte tus Fotos', 'Título de la sección para subir fotos'],
    ['Branding', 'app_titulo', 'Boda Jennifer y Nicolás', 'Título de la aplicación (aparece en todas las páginas)'],
    ['Branding', 'app_subtitulo', '15 de agosto de 2026', 'Subtítulo de la aplicación'],
    ['Branding', 'favicon_url', 'https://images.unsplash.com/photo-1519741497674-611481863552?w=180', 'URL del favicon (icono del navegador)'],
    ['Colores', 'color_forest', '#1a2e22', 'Color principal verde oscuro'],
    ['Colores', 'color_forest_mid', '#243d2e', 'Color verde oscuro medio'],
    ['Colores', 'color_forest_lite', '#2d5a3d', 'Color verde oscuro claro'],
    ['Colores', 'color_sage', '#7a9e7e', 'Color verde salvia'],
    ['Colores', 'color_sage_lite', '#a8c5ab', 'Color verde salvia claro'],
    ['Colores', 'color_cream', '#f7f0e6', 'Color crema principal'],
    ['Colores', 'color_cream_deep', '#ede3d5', 'Color crema profundo'],
    ['Colores', 'color_off_white', '#faf6f0', 'Color blanco roto'],
    ['Colores', 'color_gold', '#c9a96e', 'Color dorado principal'],
    ['Colores', 'color_gold_lite', '#e0c898', 'Color dorado claro'],
    ['Colores', 'color_gold_dark', '#a07840', 'Color dorado oscuro'],
    ['Colores', 'color_rose', '#d4a5a5', 'Color rosa'],
    ['Colores', 'color_rose_lite', '#e8c4c4', 'Color rosa claro'],
    ['Colores', 'color_text_dark', '#1a1a1a', 'Color texto oscuro'],
    ['Colores', 'color_text_mid', '#4a4a4a', 'Color texto medio'],
    ['Colores', 'color_text_muted', '#7a7a7a', 'Color texto atenuado']
  ];
  
  var datos = hoja.getDataRange().getValues();
  var clavesExistentes = {};
  
  // Mapear claves existentes
  for (var i = 1; i < datos.length; i++) {
    clavesExistentes[datos[i][1]] = true;
  }
  
  var agregados = 0;
  
  // Agregar solo los que no existen
  for (var j = 0; j < nuevosParametros.length; j++) {
    var clave = nuevosParametros[j][1];
    if (!clavesExistentes[clave]) {
      hoja.appendRow(nuevosParametros[j]);
      agregados++;
      Logger.log('✅ Agregado: ' + clave);
    } else {
      Logger.log('⏭️ Ya existe: ' + clave);
    }
  }
  
  if (agregados > 0) {
    // Refrescar caché
    var cache = CacheService.getScriptCache();
    cache.remove('parametros_config');
    
    SpreadsheetApp.getUi().alert(
      '✅ Parámetros Actualizados',
      agregados + ' nuevo(s) parámetro(s) agregado(s):\n\n' +
      '• historia_foto_url\n' +
      '• historia_foto_alt\n' +
      '• app_titulo\n' +
      '• app_subtitulo\n' +
      '• favicon_url\n\n' +
      'Puedes editar los valores en la hoja Parametros.',
      SpreadsheetApp.getUi().ButtonSet.OK
    );
    Logger.log('✅ Total agregado: ' + agregados + ' parámetros');
  } else {
    SpreadsheetApp.getUi().alert(
      'ℹ️ Sin Cambios',
      'Todos los parámetros ya existen. No se requieren actualizaciones.',
      SpreadsheetApp.getUi().ButtonSet.OK
    );
    Logger.log('ℹ️ No se requirieron actualizaciones');
  }
}

/**
 * Inicializa la hoja de Parámetros con todos los valores configurables.
 * Ejecutar manualmente desde el editor de GAS la primera vez.
 * Esta función es IDEMPOTENTE: si la hoja ya existe, no la sobrescribe.
 * 
 * IMPORTANTE: Si ejecutas desde Apps Script (no desde Sheets), usa inicializarParametrosSinUI()
 */
function inicializarParametros() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var hoja = ss.getSheetByName('Parametros');
  
  // Si ya existe, preguntar si quiere sobrescribir
  if (hoja) {
    try {
      var ui = SpreadsheetApp.getUi();
      var respuesta = ui.alert(
        'La hoja Parametros ya existe',
        '¿Deseas sobrescribirla? Se perderán los cambios actuales.',
        ui.ButtonSet.YES_NO
      );
      if (respuesta !== ui.Button.YES) {
        Logger.log('Operación cancelada por el usuario');
        return;
      }
    } catch (e) {
      // Si falla getUi(), significa que se está ejecutando desde Apps Script
      Logger.log('⚠️ No se puede usar UI desde este contexto. Usa inicializarParametrosSinUI() en su lugar.');
      throw new Error('No se puede ejecutar desde Apps Script. Usa inicializarParametrosSinUI() o ejecuta desde Google Sheets (Extensiones → Apps Script)');
    }
    ss.deleteSheet(hoja);
  }
  
  // Crear hoja nueva
  hoja = ss.insertSheet('Parametros');
  
  // Encabezados
  hoja.getRange(1, 1, 1, 4).setValues([['Categoría', 'Clave', 'Valor', 'Descripción']]);
  hoja.getRange(1, 1, 1, 4).setFontWeight('bold').setBackground('#1a2e22').setFontColor('#f7f0e6');
  
  // Datos de parámetros
  var parametros = [
    // INFORMACIÓN BÁSICA
    ['Básico', 'nombre_novia', 'Jennifer', 'Nombre de la novia'],
    ['Básico', 'nombre_novio', 'Nicolás', 'Nombre del novio'],
    ['Básico', 'fecha_boda', '2026-08-15', 'Fecha de la boda (YYYY-MM-DD)'],
    ['Básico', 'hora_boda', '19:00', 'Hora de la boda (HH:MM formato 24h)'],
    ['Básico', 'fecha_limite_rsvp', '2026-06-15', 'Fecha límite para confirmar asistencia'],
    
    // UBICACIÓN
    ['Ubicación', 'venue_nombre', 'Hacienda Angelus Campestre', 'Nombre del lugar del evento'],
    ['Ubicación', 'venue_direccion', 'Vía Guaymaral, Cl. 235 #Km 5', 'Dirección completa'],
    ['Ubicación', 'venue_ciudad', 'Bogotá', 'Ciudad'],
    ['Ubicación', 'venue_pais', 'Colombia', 'País'],
    ['Ubicación', 'venue_maps_url', 'https://maps.google.com/?q=Hacienda+Angelus+Campestre+Bogota', 'Link de Google Maps'],
    
    // TIMELINE
    ['Timeline', 'timeline_1', '12:30 PM|Bienvenida', 'Formato: HORA|DESCRIPCIÓN'],
    ['Timeline', 'timeline_2', '1:00 PM|Ceremonia', 'Formato: HORA|DESCRIPCIÓN'],
    ['Timeline', 'timeline_3', '2:00 PM|Fotos y Cóctel', 'Formato: HORA|DESCRIPCIÓN'],
    ['Timeline', 'timeline_4', '4:00 PM|Almuerzo', 'Formato: HORA|DESCRIPCIÓN'],
    ['Timeline', 'timeline_5', '7:00 PM|Fin', 'Formato: HORA|DESCRIPCIÓN'],
    
    // DRESS CODE
    ['Dress Code', 'dresscode_descripcion', 'Traje formal · Vestido largo', 'Descripción del código de vestimenta'],
    ['Dress Code', 'dresscode_colores_reservados', 'Blanco, Crema, Verde', 'Colores reservados para los novios'],
    ['Dress Code', 'dresscode_nota', 'Evento solo para adultos (18+)', 'Nota adicional'],
    
    // HISTORIA
    ['Historia', 'historia_texto', 'Jennifer y Nicolás se conocieron en una tarde de lluvia bogotana, cuando el destino los cruzó en el mismo café. Entre conversaciones, risas y sueños compartidos, descubrieron que estaban destinados a caminar juntos. Hoy, rodeados de su familia peluda —una Malamute y dos gatos negros— están listos para dar el siguiente paso en su historia de amor y quieren celebrarlo con las personas más importantes de sus vidas: ¡ustedes!', 'Historia de la pareja'],
    ['Historia', 'historia_familia', 'Jennifer, Nicolás, su Malamute y sus dos gatos negros 🖤', 'Descripción de la familia'],
    ['Historia', 'historia_foto_url', 'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=400&h=400&fit=crop', 'URL de la foto circular de la pareja (400x400px recomendado)'],
    ['Historia', 'historia_foto_alt', 'Jennifer y Nicolás', 'Texto alternativo para la foto'],
    
    // FOTOS - Hero Carousel
    ['Fotos', 'hero_foto_1', 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200', 'URL de foto 1 del carrusel principal'],
    ['Fotos', 'hero_foto_2', 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=1200', 'URL de foto 2 del carrusel principal'],
    ['Fotos', 'hero_foto_3', 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1200', 'URL de foto 3 del carrusel principal'],
    ['Fotos', 'hero_foto_4', 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=1200', 'URL de foto 4 del carrusel principal'],
    ['Fotos', 'hero_foto_5', 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=1200', 'URL de foto 5 del carrusel principal'],
    
    // FOTOS - Galería
    ['Fotos', 'galeria_foto_1', 'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800', 'URL de foto 1 de la galería'],
    ['Fotos', 'galeria_foto_2', 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800', 'URL de foto 2 de la galería'],
    ['Fotos', 'galeria_foto_3', 'https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=800', 'URL de foto 3 de la galería'],
    ['Fotos', 'galeria_foto_4', 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800', 'URL de foto 4 de la galería'],
    ['Fotos', 'galeria_foto_5', 'https://images.unsplash.com/photo-1460978812857-470ed1c77af0?w=800', 'URL de foto 5 de la galería'],
    ['Fotos', 'galeria_foto_6', 'https://images.unsplash.com/photo-1522413452208-996ff3f3e740?w=800', 'URL de foto 6 de la galería'],
    
    // MÚSICA
    ['Música', 'musica_fondo_url', 'https://drive.google.com/uc?export=download&id=1o5SUT5VOa_-6KuddhnfWwl_PW6DrUqI0', 'URL del archivo de música de fondo (Google Drive o MP3 directo)'],
    ['Música', 'musica_titulo', 'Música de Fondo', 'Título de la canción (opcional)'],
    
    // DRESSCODE
    ['Dresscode', 'dresscode_titulo', 'Dress Code', 'Título de la sección de código de vestimenta'],
    ['Dresscode', 'dresscode_subtitulo', 'Traje formal · Vestido largo', 'Subtítulo con descripción del dress code'],
    ['Dresscode', 'dresscode_color_1', '#ffffff', 'Color 1 reservado (código hexadecimal)'],
    ['Dresscode', 'dresscode_color_1_nombre', 'Blanco', 'Nombre del color 1'],
    ['Dresscode', 'dresscode_color_2', '#f7f0e6', 'Color 2 reservado (código hexadecimal)'],
    ['Dresscode', 'dresscode_color_2_nombre', 'Crema', 'Nombre del color 2'],
    ['Dresscode', 'dresscode_color_3', '#7a9e7e', 'Color 3 reservado (código hexadecimal)'],
    ['Dresscode', 'dresscode_color_3_nombre', 'Verde', 'Nombre del color 3'],
    ['Dresscode', 'dresscode_nota', 'Reservado para los novios', 'Nota sobre los colores reservados'],
    ['Dresscode', 'dresscode_card_1_icono', '🔞', 'Emoji/icono para tarjeta 1'],
    ['Dresscode', 'dresscode_card_1_texto', 'Solo adultos', 'Texto para tarjeta 1'],
    ['Dresscode', 'dresscode_card_2_icono', '💌', 'Emoji/icono para tarjeta 2'],
    ['Dresscode', 'dresscode_card_2_texto', 'Lluvia de sobres', 'Texto para tarjeta 2'],
    
    // RSVP
    ['RSVP', 'rsvp_pregunta', '¿Nos acompañas,', 'Pregunta de confirmación (sin el nombre del invitado)'],
    ['RSVP', 'rsvp_subtitulo', 'Tu presencia es el mejor regalo que nos puedes dar.', 'Subtítulo del RSVP'],
    
    // CONTACTO
    ['Contacto', 'whatsapp_numero', '573213837837', 'Número de WhatsApp (con código de país, sin +)'],
    ['Contacto', 'whatsapp_mensaje_default', 'Hola, tengo una pregunta sobre la boda', 'Mensaje por defecto de WhatsApp'],
    
    // GOOGLE DRIVE
    ['Google Drive', 'drive_folder_id', 'FOLDER_ID', 'ID de la carpeta de Google Drive para fotos (reemplazar FOLDER_ID)'],
    
    // DEPLOYMENT
    ['Deployment', 'webapp_url', 'https://script.google.com/macros/s/TU_DEPLOYMENT_ID/exec', 'URL de la Web App desplegada (obtener después del primer deployment)'],
    
    // REDES SOCIALES
    ['Redes Sociales', 'share_text', '¡Estás invitado a la boda de Jennifer & Nicolás! 💍 15 de agosto de 2026', 'Texto para compartir en redes'],
    ['Redes Sociales', 'og_image_url', 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200', 'Imagen para Open Graph (compartir)'],
    
    // MENSAJES - Hero
    ['Mensajes', 'hero_eyebrow', 'Nos Casamos', 'Texto pequeño arriba de los nombres'],
    ['Mensajes', 'hero_fecha_texto', '15 · 08 · 2026', 'Fecha en formato visual'],
    
    // MENSAJES - Éxito
    ['Mensajes', 'exito_titulo', '¡Tu presencia ya está sellada!', 'Título del mensaje de éxito'],
    ['Mensajes', 'exito_subtitulo', 'Nos vemos el 15 de agosto de 2026 en la Hacienda Angelus Campestre.', 'Subtítulo del mensaje de éxito'],
    ['Mensajes', 'exito_ubicacion', 'Sabana de Bogotá · Colombia', 'Ubicación en mensaje de éxito'],
    
    // MENSAJES - Carta Confirmación
    ['Mensajes', 'carta_confirmacion_p1', '¡Gracias por confirmar tu asistencia! No sabes la alegría que nos da saber que estarás con nosotros en este día tan especial.', 'Párrafo 1 de carta de confirmación'],
    ['Mensajes', 'carta_confirmacion_p2', 'Tu presencia es uno de los regalos más valiosos que podríamos recibir. Estamos emocionados de compartir contigo el inicio de esta nueva aventura, rodeados del amor de quienes más queremos.', 'Párrafo 2 de carta de confirmación'],
    ['Mensajes', 'carta_confirmacion_p3', 'Nos vemos el 15 de agosto de 2026 en la Hacienda Angelus Campestre. Prepárate para una celebración llena de amor, risas y momentos inolvidables.', 'Párrafo 3 de carta de confirmación'],
    
    // MENSAJES - Carta Post-Boda
    ['Mensajes', 'carta_postboda_p1', 'Hoy queremos tomarnos un momento para agradecerte de corazón por haber sido parte de nuestro día especial. Tu presencia hizo que el 15 de agosto de 2026 fuera aún más mágico de lo que habíamos soñado.', 'Párrafo 1 de carta post-boda'],
    ['Mensajes', 'carta_postboda_p2', 'Cada sonrisa, cada abrazo y cada palabra de felicitación quedará grabado en nuestros corazones para siempre. Fue un honor compartir contigo el inicio de esta nueva aventura, rodeados del amor de quienes más queremos.', 'Párrafo 2 de carta post-boda'],
    ['Mensajes', 'carta_postboda_p3', 'Gracias por celebrar con nosotros, por tu amistad incondicional y por los hermosos recuerdos que creamos juntos. Gracias por ser parte de nuestra familia y de nuestra historia.', 'Párrafo 3 de carta post-boda'],
    
    // MENSAJES - Email
    ['Mensajes', 'email_saludo', 'Tu asistencia ha sido confirmada exitosamente. Nos llena de alegria contar contigo en este dia tan especial!', 'Saludo en email de confirmación'],
    ['Mensajes', 'email_qr_texto', 'Presenta este codigo QR en la entrada del evento', 'Texto debajo del QR'],
    ['Mensajes', 'email_cierre', 'Sera un honor compartir este momento tan especial contigo.', 'Mensaje de cierre en email'],
    ['Mensajes', 'email_despedida', 'Nos vemos el 15 de agosto!', 'Despedida en email'],
    
    // NOTAS IMPORTANTES
    ['Notas', 'nota_1', 'Evento solo para adultos (18+)', 'Nota importante 1'],
    ['Notas', 'nota_2', 'Lluvia de sobres', 'Nota importante 2'],
    ['Notas', 'nota_3', 'Guarda este correo para presentar tu QR', 'Nota importante 3'],
    ['Notas', 'nota_4', 'Adjuntamos archivo .ics para agregar a tu calendario', 'Nota importante 4']
  ];
  
  // Insertar datos
  hoja.getRange(2, 1, parametros.length, 4).setValues(parametros);
  
  // Formatear
  hoja.setColumnWidth(1, 150);  // Categoría
  hoja.setColumnWidth(2, 250);  // Clave
  hoja.setColumnWidth(3, 400);  // Valor
  hoja.setColumnWidth(4, 350);  // Descripción
  
  // Alternar colores de fila
  for (var i = 2; i <= parametros.length + 1; i++) {
    if (i % 2 === 0) {
      hoja.getRange(i, 1, 1, 4).setBackground('#f7f0e6');
    }
  }
  
  // Congelar primera fila
  hoja.setFrozenRows(1);
  
  // Proteger columnas Categoría, Clave y Descripción (solo editar Valor)
  var protection = hoja.protect().setDescription('Protección de estructura');
  protection.setUnprotectedRanges([hoja.getRange(2, 3, parametros.length, 1)]);
  
  SpreadsheetApp.getUi().alert('✅ Hoja Parametros creada exitosamente!\n\nAhora puedes editar los valores en la columna "Valor".');
  Logger.log('✅ Hoja Parametros inicializada con ' + parametros.length + ' parámetros');
}

/**
 * Versión de inicializarParametros que NO usa UI.
 * Usar esta función cuando ejecutes desde el editor de Apps Script.
 * SOBRESCRIBE la hoja Parametros sin preguntar.
 */
function inicializarParametrosSinUI() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var hoja = ss.getSheetByName('Parametros');
  
  // Si ya existe, eliminarla sin preguntar
  if (hoja) {
    Logger.log('⚠️ La hoja Parametros ya existe. Será sobrescrita.');
    ss.deleteSheet(hoja);
  }
  
  // Crear hoja nueva
  hoja = ss.insertSheet('Parametros');
  
  // Encabezados
  hoja.getRange(1, 1, 1, 4).setValues([['Categoría', 'Clave', 'Valor', 'Descripción']]);
  hoja.getRange(1, 1, 1, 4).setFontWeight('bold').setBackground('#1a2e22').setFontColor('#f7f0e6');
  
  // Datos de parámetros (mismos que inicializarParametros)
  var parametros = [
    // INFORMACIÓN BÁSICA
    ['Básico', 'nombre_novia', 'Jennifer', 'Nombre de la novia'],
    ['Básico', 'nombre_novio', 'Nicolás', 'Nombre del novio'],
    ['Básico', 'fecha_boda', '2026-08-15', 'Fecha de la boda (YYYY-MM-DD)'],
    ['Básico', 'hora_boda', '19:00', 'Hora de la boda (HH:MM formato 24h)'],
    ['Básico', 'fecha_limite_rsvp', '2026-06-15', 'Fecha límite para confirmar asistencia'],
    
    // UBICACIÓN
    ['Ubicación', 'venue_nombre', 'Hacienda Angelus Campestre', 'Nombre del lugar del evento'],
    ['Ubicación', 'venue_direccion', 'Vía Guaymaral, Cl. 235 #Km 5', 'Dirección completa'],
    ['Ubicación', 'venue_ciudad', 'Bogotá', 'Ciudad'],
    ['Ubicación', 'venue_pais', 'Colombia', 'País'],
    ['Ubicación', 'venue_maps_url', 'https://maps.google.com/?q=Hacienda+Angelus+Campestre+Bogota', 'Link de Google Maps'],
    
    // TIMELINE
    ['Timeline', 'timeline_1', '12:30 PM|Bienvenida', 'Formato: HORA|DESCRIPCIÓN'],
    ['Timeline', 'timeline_2', '1:00 PM|Ceremonia', 'Formato: HORA|DESCRIPCIÓN'],
    ['Timeline', 'timeline_3', '2:00 PM|Fotos y Cóctel', 'Formato: HORA|DESCRIPCIÓN'],
    ['Timeline', 'timeline_4', '4:00 PM|Almuerzo', 'Formato: HORA|DESCRIPCIÓN'],
    ['Timeline', 'timeline_5', '7:00 PM|Fin', 'Formato: HORA|DESCRIPCIÓN'],
    
    // DRESS CODE
    ['Dress Code', 'dresscode_descripcion', 'Traje formal · Vestido largo', 'Descripción del código de vestimenta'],
    ['Dress Code', 'dresscode_colores_reservados', 'Blanco, Crema, Verde', 'Colores reservados para los novios'],
    ['Dress Code', 'dresscode_nota', 'Evento solo para adultos (18+)', 'Nota adicional'],
    
    // HISTORIA
    ['Historia', 'historia_texto', 'Jennifer y Nicolás se conocieron en una tarde de lluvia bogotana, cuando el destino los cruzó en el mismo café. Entre conversaciones, risas y sueños compartidos, descubrieron que estaban destinados a caminar juntos. Hoy, rodeados de su familia peluda —una Malamute y dos gatos negros— están listos para dar el siguiente paso en su historia de amor y quieren celebrarlo con las personas más importantes de sus vidas: ¡ustedes!', 'Historia de la pareja'],
    ['Historia', 'historia_familia', 'Jennifer, Nicolás, su Malamute y sus dos gatos negros 🖤', 'Descripción de la familia'],
    ['Historia', 'historia_foto_url', 'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=400&h=400&fit=crop', 'URL de la foto circular de la pareja (400x400px recomendado)'],
    ['Historia', 'historia_foto_alt', 'Jennifer y Nicolás', 'Texto alternativo para la foto'],
    
    // FOTOS - Hero Carousel
    ['Fotos', 'hero_foto_1', 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200', 'URL de foto 1 del carrusel principal'],
    ['Fotos', 'hero_foto_2', 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=1200', 'URL de foto 2 del carrusel principal'],
    ['Fotos', 'hero_foto_3', 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1200', 'URL de foto 3 del carrusel principal'],
    ['Fotos', 'hero_foto_4', 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=1200', 'URL de foto 4 del carrusel principal'],
    ['Fotos', 'hero_foto_5', 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=1200', 'URL de foto 5 del carrusel principal'],
    
    // FOTOS - Galería
    ['Fotos', 'galeria_foto_1', 'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800', 'URL de foto 1 de la galería'],
    ['Fotos', 'galeria_foto_2', 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800', 'URL de foto 2 de la galería'],
    ['Fotos', 'galeria_foto_3', 'https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=800', 'URL de foto 3 de la galería'],
    ['Fotos', 'galeria_foto_4', 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800', 'URL de foto 4 de la galería'],
    ['Fotos', 'galeria_foto_5', 'https://images.unsplash.com/photo-1460978812857-470ed1c77af0?w=800', 'URL de foto 5 de la galería'],
    ['Fotos', 'galeria_foto_6', 'https://images.unsplash.com/photo-1522413452208-996ff3f3e740?w=800', 'URL de foto 6 de la galería'],
    
    // MÚSICA
    ['Música', 'musica_fondo_url', 'https://drive.google.com/uc?export=download&id=1o5SUT5VOa_-6KuddhnfWwl_PW6DrUqI0', 'URL del archivo de música de fondo (Google Drive o MP3 directo)'],
    ['Música', 'musica_titulo', 'Música de Fondo', 'Título de la canción (opcional)'],
    
    // DRESSCODE
    ['Dresscode', 'dresscode_titulo', 'Dress Code', 'Título de la sección de código de vestimenta'],
    ['Dresscode', 'dresscode_subtitulo', 'Traje formal · Vestido largo', 'Subtítulo con descripción del dress code'],
    ['Dresscode', 'dresscode_color_1', '#ffffff', 'Color 1 reservado (código hexadecimal)'],
    ['Dresscode', 'dresscode_color_1_nombre', 'Blanco', 'Nombre del color 1'],
    ['Dresscode', 'dresscode_color_2', '#f7f0e6', 'Color 2 reservado (código hexadecimal)'],
    ['Dresscode', 'dresscode_color_2_nombre', 'Crema', 'Nombre del color 2'],
    ['Dresscode', 'dresscode_color_3', '#7a9e7e', 'Color 3 reservado (código hexadecimal)'],
    ['Dresscode', 'dresscode_color_3_nombre', 'Verde', 'Nombre del color 3'],
    ['Dresscode', 'dresscode_nota', 'Reservado para los novios', 'Nota sobre los colores reservados'],
    ['Dresscode', 'dresscode_card_1_icono', '🔞', 'Emoji/icono para tarjeta 1'],
    ['Dresscode', 'dresscode_card_1_texto', 'Solo adultos', 'Texto para tarjeta 1'],
    ['Dresscode', 'dresscode_card_2_icono', '💌', 'Emoji/icono para tarjeta 2'],
    ['Dresscode', 'dresscode_card_2_texto', 'Lluvia de sobres', 'Texto para tarjeta 2'],
    
    // RSVP
    ['RSVP', 'rsvp_pregunta', '¿Nos acompañas,', 'Pregunta de confirmación (sin el nombre del invitado)'],
    ['RSVP', 'rsvp_subtitulo', 'Tu presencia es el mejor regalo que nos puedes dar.', 'Subtítulo del RSVP'],
    
    // CONTACTO
    ['Contacto', 'whatsapp_numero', '573213837837', 'Número de WhatsApp (con código de país, sin +)'],
    ['Contacto', 'whatsapp_mensaje_default', 'Hola, tengo una pregunta sobre la boda', 'Mensaje por defecto de WhatsApp'],
    
    // GOOGLE DRIVE
    ['Google Drive', 'drive_folder_id', 'FOLDER_ID', 'ID de la carpeta de Google Drive para fotos (reemplazar FOLDER_ID)'],
    
    // DEPLOYMENT
    ['Deployment', 'webapp_url', 'https://script.google.com/macros/s/TU_DEPLOYMENT_ID/exec', 'URL de la Web App desplegada (obtener después del primer deployment)'],
    
    // REDES SOCIALES
    ['Redes Sociales', 'share_text', '¡Estás invitado a la boda de Jennifer & Nicolás! 💍 15 de agosto de 2026', 'Texto para compartir en redes'],
    ['Redes Sociales', 'og_image_url', 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200', 'Imagen para Open Graph (compartir)'],
    
    // MENSAJES - Hero
    ['Mensajes', 'hero_eyebrow', 'Nos Casamos', 'Texto pequeño arriba de los nombres'],
    ['Mensajes', 'hero_fecha_texto', '15 · 08 · 2026', 'Fecha en formato visual'],
    
    // MENSAJES - Éxito
    ['Mensajes', 'exito_titulo', '¡Tu presencia ya está sellada!', 'Título del mensaje de éxito'],
    ['Mensajes', 'exito_subtitulo', 'Nos vemos el 15 de agosto de 2026 en la Hacienda Angelus Campestre.', 'Subtítulo del mensaje de éxito'],
    ['Mensajes', 'exito_ubicacion', 'Sabana de Bogotá · Colombia', 'Ubicación en mensaje de éxito'],
    
    // MENSAJES - Carta Confirmación
    ['Mensajes', 'carta_confirmacion_p1', '¡Gracias por confirmar tu asistencia! No sabes la alegría que nos da saber que estarás con nosotros en este día tan especial.', 'Párrafo 1 de carta de confirmación'],
    ['Mensajes', 'carta_confirmacion_p2', 'Tu presencia es uno de los regalos más valiosos que podríamos recibir. Estamos emocionados de compartir contigo el inicio de esta nueva aventura, rodeados del amor de quienes más queremos.', 'Párrafo 2 de carta de confirmación'],
    ['Mensajes', 'carta_confirmacion_p3', 'Nos vemos el 15 de agosto de 2026 en la Hacienda Angelus Campestre. Prepárate para una celebración llena de amor, risas y momentos inolvidables.', 'Párrafo 3 de carta de confirmación'],
    
    // MENSAJES - Carta Post-Boda
    ['Mensajes', 'carta_postboda_p1', 'Hoy queremos tomarnos un momento para agradecerte de corazón por haber sido parte de nuestro día especial. Tu presencia hizo que el 15 de agosto de 2026 fuera aún más mágico de lo que habíamos soñado.', 'Párrafo 1 de carta post-boda'],
    ['Mensajes', 'carta_postboda_p2', 'Cada sonrisa, cada abrazo y cada palabra de felicitación quedará grabado en nuestros corazones para siempre. Fue un honor compartir contigo el inicio de esta nueva aventura, rodeados del amor de quienes más queremos.', 'Párrafo 2 de carta post-boda'],
    ['Mensajes', 'carta_postboda_p3', 'Gracias por celebrar con nosotros, por tu amistad incondicional y por los hermosos recuerdos que creamos juntos. Gracias por ser parte de nuestra familia y de nuestra historia.', 'Párrafo 3 de carta post-boda'],
    
    // MENSAJES - Email
    ['Mensajes', 'email_saludo', 'Tu asistencia ha sido confirmada exitosamente. Nos llena de alegria contar contigo en este dia tan especial!', 'Saludo en email de confirmación'],
    ['Mensajes', 'email_qr_texto', 'Presenta este codigo QR en la entrada del evento', 'Texto debajo del QR'],
    ['Mensajes', 'email_cierre', 'Sera un honor compartir este momento tan especial contigo.', 'Mensaje de cierre en email'],
    ['Mensajes', 'email_despedida', 'Nos vemos el 15 de agosto!', 'Despedida en email'],
    
    // NOTAS IMPORTANTES
    ['Notas', 'nota_1', 'Evento solo para adultos (18+)', 'Nota importante 1'],
    ['Notas', 'nota_2', 'Lluvia de sobres', 'Nota importante 2'],
    ['Notas', 'nota_3', 'Guarda este correo para presentar tu QR', 'Nota importante 3'],
    ['Notas', 'nota_4', 'Adjuntamos archivo .ics para agregar a tu calendario', 'Nota importante 4']
  ];
  
  // Insertar datos
  hoja.getRange(2, 1, parametros.length, 4).setValues(parametros);
  
  // Formatear
  hoja.setColumnWidth(1, 150);  // Categoría
  hoja.setColumnWidth(2, 250);  // Clave
  hoja.setColumnWidth(3, 400);  // Valor
  hoja.setColumnWidth(4, 350);  // Descripción
  
  // Alternar colores de fila
  for (var i = 2; i <= parametros.length + 1; i++) {
    if (i % 2 === 0) {
      hoja.getRange(i, 1, 1, 4).setBackground('#f7f0e6');
    }
  }
  
  // Congelar primera fila
  hoja.setFrozenRows(1);
  
  // Proteger columnas Categoría, Clave y Descripción (solo editar Valor)
  var protection = hoja.protect().setDescription('Protección de estructura');
  protection.setUnprotectedRanges([hoja.getRange(2, 3, parametros.length, 1)]);
  
  Logger.log('✅ Hoja Parametros inicializada con ' + parametros.length + ' parámetros');
  Logger.log('ℹ️ Revisa el Logger para confirmar. No se mostró alerta porque se ejecutó desde Apps Script.');
  return { success: true, parametros: parametros.length };
}

/**
 * Crea las hojas del Spreadsheet de forma idempotente.
 * Ejecutar manualmente desde el editor de GAS antes del despliegue.
 * Crea: Hoja_Invitados, Hoja_Respuestas, Hoja_Dashboard.
 */
function setupBaseDatos() {
  setupBaseDatos_(SpreadsheetApp.getActiveSpreadsheet());
}

/**
 * Rellena con 'Pendiente' todas las filas de Invitados que tengan Estado vacío.
 * Ejecutar manualmente desde el editor de GAS si se importaron invitados sin Estado.
 */
function inicializarEstados() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var hoja = ss.getSheetByName('Invitados');
  if (!hoja) { 
    Logger.log('❌ Hoja Invitados no encontrada'); 
    SpreadsheetApp.getUi().alert('❌ Error', 'La hoja "Invitados" no existe.', SpreadsheetApp.getUi().ButtonSet.OK);
    return; 
  }
  var datos = hoja.getDataRange().getValues();
  var actualizados = 0;
  for (var i = 1; i < datos.length; i++) {
    // Solo filas con ID (columna A) y Estado vacío (columna D)
    if (datos[i][0] && !datos[i][3]) {
      hoja.getRange(i + 1, 4).setValue('Pendiente');
      actualizados++;
    }
  }
  Logger.log('✅ Estados inicializados: ' + actualizados + ' filas actualizadas a Pendiente.');
  SpreadsheetApp.getUi().alert('✅ Completado', actualizados + ' invitados actualizados a "Pendiente".', SpreadsheetApp.getUi().ButtonSet.OK);
}

/**
 * Completa automáticamente la columna Max_Asistentes para invitados que no la tengan.
 * Ejecutar manualmente desde el editor de GAS si falta esta columna.
 */
function completarMaxAsistentes() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var hoja = ss.getSheetByName('Invitados');
  
  if (!hoja) {
    SpreadsheetApp.getUi().alert('❌ Error', 'La hoja "Invitados" no existe.\nEjecuta setupBaseDatos() primero.', SpreadsheetApp.getUi().ButtonSet.OK);
    Logger.log('❌ Hoja Invitados no encontrada');
    return;
  }
  
  var datos = hoja.getDataRange().getValues();
  var actualizados = 0;
  var valorDefault = 2; // Valor por defecto: 2 personas
  
  // Verificar si existe la columna E (índice 4)
  if (datos[0].length < 5) {
    // Agregar encabezado si no existe
    hoja.getRange(1, 5).setValue('Max_Asistentes');
    Logger.log('✅ Encabezado Max_Asistentes agregado en columna E');
  }
  
  for (var i = 1; i < datos.length; i++) {
    // Solo filas con ID (columna A) y Max_Asistentes vacío o inexistente (columna E)
    if (datos[i][0] && (!datos[i][4] || datos[i][4] === '')) {
      hoja.getRange(i + 1, 5).setValue(valorDefault);
      actualizados++;
      Logger.log('✅ Fila ' + (i + 1) + ' (' + datos[i][0] + ' - ' + datos[i][1] + '): Max_Asistentes = ' + valorDefault);
    }
  }
  
  if (actualizados > 0) {
    SpreadsheetApp.getUi().alert(
      '✅ Completado', 
      actualizados + ' invitado(s) actualizados con Max_Asistentes = ' + valorDefault + '\n\n' +
      'Puedes editar estos valores manualmente en la columna E si algunos invitados pueden traer más o menos personas.',
      SpreadsheetApp.getUi().ButtonSet.OK
    );
    Logger.log('✅ Total actualizado: ' + actualizados + ' invitados');
  } else {
    SpreadsheetApp.getUi().alert(
      'ℹ️ Sin Cambios', 
      'Todos los invitados ya tienen Max_Asistentes configurado.',
      SpreadsheetApp.getUi().ButtonSet.OK
    );
    Logger.log('ℹ️ No se requirieron actualizaciones');
  }
}

/**
 * Muestra un diagnóstico completo de la hoja Invitados.
 * Útil para verificar la estructura y datos.
 */
function diagnosticarHojaInvitados() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var hoja = ss.getSheetByName('Invitados');
  
  if (!hoja) {
    SpreadsheetApp.getUi().alert('❌ Error', 'La hoja "Invitados" no existe.', SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }
  
  var datos = hoja.getDataRange().getValues();
  var reporte = [];
  
  reporte.push('📊 DIAGNÓSTICO DE HOJA INVITADOS');
  reporte.push('═══════════════════════════════════════');
  reporte.push('');
  reporte.push('📋 Estructura:');
  reporte.push('  • Total de filas: ' + datos.length);
  reporte.push('  • Total de columnas: ' + datos[0].length);
  reporte.push('  • Encabezados: ' + datos[0].join(' | '));
  reporte.push('');
  
  // Verificar columnas requeridas
  var columnasRequeridas = ['ID', 'Nombre', 'ID_Vinculado', 'Estado', 'Max_Asistentes'];
  var columnasFaltantes = [];
  
  for (var i = 0; i < columnasRequeridas.length; i++) {
    if (i >= datos[0].length || datos[0][i] !== columnasRequeridas[i]) {
      columnasFaltantes.push(columnasRequeridas[i]);
    }
  }
  
  if (columnasFaltantes.length > 0) {
    reporte.push('⚠️ COLUMNAS FALTANTES O INCORRECTAS:');
    for (var j = 0; j < columnasFaltantes.length; j++) {
      reporte.push('  ❌ ' + columnasFaltantes[j]);
    }
    reporte.push('');
  } else {
    reporte.push('✅ Todas las columnas requeridas están presentes');
    reporte.push('');
  }
  
  // Analizar invitados
  reporte.push('👥 Invitados (' + (datos.length - 1) + ' total):');
  reporte.push('');
  
  var sinEstado = 0;
  var sinMaxAsistentes = 0;
  
  for (var k = 1; k < datos.length; k++) {
    var id = datos[k][0];
    var nombre = datos[k][1];
    var vinculado = datos[k][2] || '(ninguno)';
    var estado = datos[k][3] || '❌ FALTA';
    var maxAsist = datos[k][4] || '❌ FALTA';
    
    if (!datos[k][3]) sinEstado++;
    if (!datos[k][4]) sinMaxAsistentes++;
    
    reporte.push('  ' + k + '. ' + id + ' - ' + nombre);
    reporte.push('     Vinculado: ' + vinculado);
    reporte.push('     Estado: ' + estado);
    reporte.push('     Max_Asistentes: ' + maxAsist);
    reporte.push('');
  }
  
  // Resumen de problemas
  if (sinEstado > 0 || sinMaxAsistentes > 0) {
    reporte.push('⚠️ PROBLEMAS DETECTADOS:');
    if (sinEstado > 0) {
      reporte.push('  • ' + sinEstado + ' invitado(s) sin Estado → Ejecuta: inicializarEstados()');
    }
    if (sinMaxAsistentes > 0) {
      reporte.push('  • ' + sinMaxAsistentes + ' invitado(s) sin Max_Asistentes → Ejecuta: completarMaxAsistentes()');
    }
  } else {
    reporte.push('✅ No se detectaron problemas');
  }
  
  var mensaje = reporte.join('\n');
  Logger.log(mensaje);
  
  SpreadsheetApp.getUi().alert(
    'Diagnóstico Completo',
    'Revisa el Logger (Ver → Registros) para ver el reporte completo.\n\n' +
    'Resumen:\n' +
    '• Total invitados: ' + (datos.length - 1) + '\n' +
    '• Sin Estado: ' + sinEstado + '\n' +
    '• Sin Max_Asistentes: ' + sinMaxAsistentes,
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

/**
 * Lógica interna de setupBaseDatos, recibe el Spreadsheet como parámetro
 * para facilitar el testing.
 *
 * @param {Spreadsheet} ss - Objeto Spreadsheet de Google Apps Script.
 */
function setupBaseDatos_(ss) {
  // 2.1 Hoja_Invitados
  var hojaInvitados = ss.getSheetByName('Invitados');
  if (!hojaInvitados) {
    hojaInvitados = ss.insertSheet('Invitados');
    hojaInvitados.getRange(1, 1, 1, 5).setValues([['ID', 'Nombre', 'ID_Vinculado', 'Estado', 'Max_Asistentes']]);
  }

  // 2.2 Hoja_Respuestas
  var hojaRespuestas = ss.getSheetByName('Respuestas');
  if (!hojaRespuestas) {
    hojaRespuestas = ss.insertSheet('Respuestas');
    hojaRespuestas.getRange(1, 1, 1, 11).setValues([[
      'ID', 'Fecha', 'Enviar_Correo', 'Correo_Electrónico',
      'Asistentes', 'Restricciones', 'Bebida', 'Canciones', 'Consejo',
      'Email_Enviado', 'Email_Error'
    ]]);
  }

  // 2.3 Hoja_Dashboard
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



/**
 * Lógica pura de enrutamiento de doGet, extraída para facilitar el testing.
 *
 * @param {Object} params - Parámetros de la URL (e.parameter).
 * @param {Spreadsheet} ss - Objeto Spreadsheet de Google Apps Script.
 * @param {Date} now - Fecha actual.
 * @returns {HtmlOutput} HTML renderizado según la ruta solicitada.
 */
function doGet_(params, ss, now) {
  // Obtener parámetros de configuración
  var config = obtenerParametros();
  
  // 3.1 Rama ?page=dashboard
  if (params.page === 'dashboard') {
    var metricas = getDashboardData_(ss);
    
    // Calcular porcentajes en el servidor para evitar problemas con operadores en templates
    metricas.porcentajeConfirmados = metricas.totalInvitados > 0 ? Math.round(metricas.totalConfirmados / metricas.totalInvitados * 100) : 0;
    metricas.porcentajePendientes = metricas.totalInvitados > 0 ? Math.round(metricas.totalPendientes / metricas.totalInvitados * 100) : 0;
    
    var template = HtmlService.createTemplateFromFile('Dashboard');
    // Pasar como JSON serializado — evita ReferenceError cuando GAS evalúa el template
    template.metricasJson = JSON.stringify(metricas);
    template.configJson   = JSON.stringify(config);
    return template.evaluate().setTitle('Dashboard — Boda ' + config.nombre_novia + ' & ' + config.nombre_novio);
  }

  // 3.2 Fechas importantes (desde parámetros)
  var fechaBoda = new Date(config.fecha_boda + 'T' + config.hora_boda + ':00-05:00');
  var fechaLimiteRSVP = new Date(config.fecha_limite_rsvp + 'T23:59:59-05:00');
  var despuesDeLaBoda = now > fechaBoda;

  // 3.3 Extracción y búsqueda del parámetro id (case-insensitive)
  var id = params.id || params.ID || params.Id;
  
  // Log para diagnóstico
  Logger.log('📍 Parámetros recibidos: ' + JSON.stringify(params));
  Logger.log('🔑 ID recibido: ' + id + ' (tipo: ' + typeof id + ')');
  
  if (!id) {
    Logger.log('❌ No se proporcionó ID en la URL');
    return HtmlService.createHtmlOutput(vistaEstatica_('enlace_invalido', config));
  }

  // Buscar en Hoja_Invitados
  var hoja = ss.getSheetByName('Invitados');
  if (!hoja) {
    Logger.log('❌ ERROR: Hoja Invitados no existe. Ejecuta setupBaseDatos() primero.');
    return HtmlService.createHtmlOutput(vistaEstatica_('no_encontrado', config));
  }
  
  var datos = hoja.getDataRange().getValues();
  Logger.log('📊 Total de filas en Invitados: ' + datos.length);
  
  var fila = buscarFila_(datos, id);

  if (!fila) {
    Logger.log('❌ ID no encontrado: ' + id);
    Logger.log('💡 IDs disponibles: ' + datos.slice(1, Math.min(6, datos.length)).map(function(r) { return r[0]; }).join(', '));
    return HtmlService.createHtmlOutput(vistaEstatica_('no_encontrado', config));
  }
  
  Logger.log('✅ Invitado encontrado: ' + fila[1] + ' (ID: ' + id + ')');

  // 3.4 DESPUÉS DE LA BODA: Mostrar carta de agradecimiento post-boda
  if (despuesDeLaBoda) {
    var templateData = {
      nombre: fila[1],
      id: String(id),
      modo: 'postboda'
    };
    var template = HtmlService.createTemplateFromFile('Agradecimiento');
    template.templateData = JSON.stringify(templateData);
    template.config = config;  // ← hace que <?= config.* ?> funcione en el template
    return template.evaluate().setTitle('Gracias por Acompañarnos — ' + config.nombre_novia + ' & ' + config.nombre_novio);
  }

  // 3.5 ANTES DE LA BODA: Verificación de fecha límite RSVP
  if (now > fechaLimiteRSVP) {
    return HtmlService.createHtmlOutput(vistaEstatica_('cerrado', config));
  }

  // 3.6 Si ya confirmó, mostrar carta de agradecimiento por confirmar
  if (fila[3] === 'Confirmado') {
    var templateData = {
      nombre: fila[1],
      id: String(id),
      modo: 'confirmacion'
    };
    var template = HtmlService.createTemplateFromFile('Agradecimiento');
    template.templateData = JSON.stringify(templateData);
    template.config = config;  // ← hace que <?= config.* ?> funcione en el template
    return template.evaluate().setTitle('¡Gracias por Confirmar! — ' + config.nombre_novia + ' & ' + config.nombre_novio);
  }

  // 3.7 Mostrar formulario RSVP (fila[3] === 'Pendiente' o vacío)
  var templateData = {
    vista: 'rsvp',
    nombre: fila[1],
    nombreVinculado: null,
    id: String(id),
    maxAsistentes: fila[4] || 2
  };

  // Si tiene ID_Vinculado y ese vinculado está Pendiente o sin estado aún:
  var idVinculado = fila[2];
  if (idVinculado) {
    var filaVinculado = buscarFila_(datos, idVinculado);
    if (filaVinculado && filaVinculado[3] !== 'Confirmado') {
      templateData.nombreVinculado = filaVinculado[1];
    }
  }

  var template = HtmlService.createTemplateFromFile('Index');
  template.templateData = JSON.stringify(templateData);
  template.config = config;
  return template.evaluate().setTitle(config.nombre_novia + ' & ' + config.nombre_novio + ' — Boda 2026');
}

/**
 * Busca una fila en el array de datos por ID (columna 0).
 * Función privada (sufijo _).
 *
 * @param {Array[]} datos - Array de filas del Spreadsheet (incluyendo encabezados en índice 0).
 * @param {string} id - ID a buscar.
 * @returns {Array|null} La fila encontrada o null si no existe.
 */
function buscarFila_(datos, id) {
  for (var i = 1; i < datos.length; i++) {
    if (String(datos[i][0]) === String(id)) return datos[i];
  }
  return null;
}

/**
 * Genera HTML estático para las vistas de error/cierre con botón SOS WhatsApp.
 * Función privada (sufijo _).
 *
 * @param {string} tipo - Tipo de vista: 'cerrado', 'enlace_invalido', 'no_encontrado', 'ya_confirmado'.
 * @param {Object} config - Objeto de configuración con parámetros
 * @returns {string} HTML completo como string.
 */
function vistaEstatica_(tipo, config) {
  config = config || obtenerParametros(); // Fallback si no se pasa config
  
  var mensajes = {
    cerrado:        { icono: '⏰', titulo: 'Las confirmaciones han cerrado', sub: 'El período de confirmación de asistencia ha finalizado.' },
    enlace_invalido:{ icono: '🔗', titulo: 'Enlace inválido', sub: 'Por favor usa el enlace personalizado que recibiste.' },
    no_encontrado:  { icono: '🔍', titulo: 'Invitación no encontrada', sub: 'No encontramos tu invitación. Contáctanos por WhatsApp.' },
    ya_confirmado:  { icono: null, titulo: '¡Tu presencia ya está sellada!', sub: 'Nos vemos el ' + config.fecha_boda + ' en ' + config.venue_nombre + '.' }
  };
  var m = mensajes[tipo] || { icono: '✨', titulo: 'Algo salió mal', sub: 'Por favor contáctanos.' };

  var selloSvg = tipo === 'ya_confirmado' ? '<svg width="90" height="90" viewBox="0 0 90 90" fill="none" xmlns="http://www.w3.org/2000/svg" style="animation:sealIn 0.7s cubic-bezier(0.25,1,0.5,1) 0.3s both;filter:drop-shadow(0 4px 16px rgba(201,169,110,0.45));"><circle cx="45" cy="45" r="40" fill="#c9a96e" opacity="0.15"/><circle cx="45" cy="45" r="34" fill="#c9a96e" opacity="0.25"/><circle cx="45" cy="45" r="28" fill="#c9a96e"/><text x="45" y="52" text-anchor="middle" font-family="Georgia,serif" font-size="18" font-style="italic" fill="#1a2e22" font-weight="400">J&amp;N</text><circle cx="45" cy="45" r="38" stroke="#a07840" stroke-width="1" fill="none" stroke-dasharray="4 3"/></svg>' : '<div style="font-size:3rem;margin-bottom:0.5rem;">' + m.icono + '</div>';

  var florSvg = '<svg width="320" height="60" viewBox="0 0 320 60" fill="none" xmlns="http://www.w3.org/2000/svg" style="opacity:0.55;margin:1.5rem auto 0;display:block;"><line x1="0" y1="30" x2="110" y2="30" stroke="rgba(201,169,110,0.4)" stroke-width="0.8"/><path d="M115 30 Q125 16 135 30 Q145 44 155 30" stroke="#7a9e7e" stroke-width="1.2" fill="none" stroke-linecap="round"/><ellipse cx="125" cy="22" rx="7" ry="4" fill="#4a7c59" transform="rotate(-30 125 22)" opacity="0.8"/><ellipse cx="145" cy="22" rx="7" ry="4" fill="#2d5a3d" transform="rotate(30 145 22)" opacity="0.8"/><g transform="translate(160,30)"><circle cx="0" cy="-5" r="3" fill="#c9a96e" opacity="0.7"/><circle cx="4" cy="-1" r="3" fill="#c9a96e" opacity="0.7"/><circle cx="3" cy="4" r="3" fill="#c9a96e" opacity="0.7"/><circle cx="-3" cy="4" r="3" fill="#c9a96e" opacity="0.7"/><circle cx="-4" cy="-1" r="3" fill="#c9a96e" opacity="0.7"/><circle cx="0" cy="0" r="2.5" fill="#a07840" opacity="0.9"/></g><ellipse cx="175" cy="24" rx="6" ry="3.5" fill="#7a9e7e" transform="rotate(-20 175 24)" opacity="0.7"/><g transform="translate(190,30)"><circle cx="0" cy="-5" r="3" fill="#d4a5a5" opacity="0.7"/><circle cx="4" cy="-1" r="3" fill="#d4a5a5" opacity="0.7"/><circle cx="3" cy="4" r="3" fill="#d4a5a5" opacity="0.7"/><circle cx="-3" cy="4" r="3" fill="#d4a5a5" opacity="0.7"/><circle cx="-4" cy="-1" r="3" fill="#d4a5a5" opacity="0.7"/><circle cx="0" cy="0" r="2.5" fill="#a07840" opacity="0.9"/></g><ellipse cx="205" cy="24" rx="6" ry="3.5" fill="#2d5a3d" transform="rotate(-20 205 24)" opacity="0.7"/><path d="M210 30 Q220 16 230 30 Q240 44 250 30" stroke="#7a9e7e" stroke-width="1.2" fill="none" stroke-linecap="round"/><ellipse cx="220" cy="22" rx="7" ry="4" fill="#4a7c59" transform="rotate(-30 220 22)" opacity="0.8"/><ellipse cx="240" cy="22" rx="7" ry="4" fill="#2d5a3d" transform="rotate(30 240 22)" opacity="0.8"/><line x1="255" y1="30" x2="320" y2="30" stroke="rgba(201,169,110,0.4)" stroke-width="0.8"/></svg>';

  var whatsappUrl = 'https://wa.me/' + config.whatsapp_numero + '?text=' + encodeURIComponent(config.whatsapp_mensaje_default);

  return '<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>' + config.nombre_novia + ' &amp; ' + config.nombre_novio + ' — Boda 2026</title><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Jost:wght@200;300;400&display=swap" rel="stylesheet"><style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:\'Jost\',sans-serif;font-weight:300;background-color:#1a2e22;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:2rem 1.5rem;position:relative;overflow:hidden}body::before{content:"";position:fixed;inset:0;background-image:url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E");opacity:0.025;pointer-events:none;mix-blend-mode:multiply;z-index:0}.card{position:relative;z-index:1;background:#faf6f0;border-radius:24px;padding:3rem 2.5rem;max-width:480px;width:100%;text-align:center;box-shadow:0 24px 80px rgba(0,0,0,0.35),0 0 0 1px rgba(201,169,110,0.15);animation:cardIn 0.9s cubic-bezier(0.25,1,0.5,1) both}.seal-wrap{display:flex;justify-content:center;margin-bottom:1.5rem}@keyframes sealIn{0%{opacity:0;transform:scale(0.4) rotate(-15deg)}60%{opacity:1;transform:scale(1.08) rotate(2deg)}100%{opacity:1;transform:scale(1) rotate(0)}}@keyframes cardIn{from{opacity:0;transform:translateY(32px)}to{opacity:1;transform:translateY(0)}}.gold-line{width:80px;height:1px;background:linear-gradient(90deg,transparent,#c9a96e,transparent);margin:1.2rem auto}.names{font-family:\'Cormorant Garamond\',Georgia,serif;font-style:italic;font-weight:400;font-size:clamp(2rem,6vw,2.8rem);color:#1a2e22;line-height:1.1;letter-spacing:0.02em;text-rendering:optimizeLegibility}.names .amp{color:#c9a96e}.titulo{font-family:\'Cormorant Garamond\',Georgia,serif;font-style:italic;font-weight:400;font-size:clamp(1.3rem,4vw,1.7rem);color:#1a2e22;margin:1.2rem 0 0.6rem;line-height:1.3;text-rendering:optimizeLegibility}.sub{font-family:\'Cormorant Garamond\',Georgia,serif;font-style:italic;font-size:1.05rem;color:#4a4a4a;line-height:1.8;margin-bottom:0.5rem}.lugar{font-family:\'Jost\',sans-serif;font-weight:200;font-size:0.72rem;letter-spacing:0.2em;text-transform:uppercase;color:#7a7a7a;margin-top:1rem}.btn{display:inline-flex;align-items:center;justify-content:center;min-height:48px;padding:0.8rem 2rem;background:linear-gradient(135deg,#c9a96e,#a07840);color:#1a2e22;border:none;border-radius:50px;font-family:\'Jost\',sans-serif;font-size:0.8rem;font-weight:400;letter-spacing:0.14em;text-transform:uppercase;cursor:pointer;text-decoration:none;margin-top:1.8rem;box-shadow:0 4px 20px rgba(201,169,110,0.4);transition:transform 0.3s cubic-bezier(0.25,1,0.5,1),box-shadow 0.3s ease}.btn:hover{transform:translateY(-2px) scale(1.03);box-shadow:0 8px 28px rgba(201,169,110,0.55)}.bg-floral{position:fixed;pointer-events:none;opacity:0.06;z-index:0}</style></head><body><svg class="bg-floral" style="top:-60px;left:-60px;width:320px;" viewBox="0 0 320 280" fill="none"><path d="M0 280 Q40 220 90 170 Q140 120 200 80 Q240 55 290 30" stroke="#c9a96e" stroke-width="2" fill="none"/><ellipse cx="90" cy="170" rx="14" ry="7" fill="#c9a96e" transform="rotate(-45 90 170)"/><ellipse cx="150" cy="120" rx="12" ry="6" fill="#c9a96e" transform="rotate(-55 150 120)"/><ellipse cx="200" cy="80" rx="11" ry="5" fill="#c9a96e" transform="rotate(-65 200 80)"/></svg><svg class="bg-floral" style="bottom:-60px;right:-60px;width:320px;transform:rotate(180deg);" viewBox="0 0 320 280" fill="none"><path d="M0 280 Q40 220 90 170 Q140 120 200 80 Q240 55 290 30" stroke="#c9a96e" stroke-width="2" fill="none"/><ellipse cx="90" cy="170" rx="14" ry="7" fill="#c9a96e" transform="rotate(-45 90 170)"/><ellipse cx="150" cy="120" rx="12" ry="6" fill="#c9a96e" transform="rotate(-55 150 120)"/><ellipse cx="200" cy="80" rx="11" ry="5" fill="#c9a96e" transform="rotate(-65 200 80)"/></svg><div class="card"><div class="seal-wrap">' + selloSvg + '</div><p class="names">' + config.nombre_novia + ' <span class="amp">&amp;</span> ' + config.nombre_novio + '</p><div class="gold-line"></div><h1 class="titulo">' + m.titulo + '</h1><p class="sub">' + m.sub + '</p>' + (tipo === 'ya_confirmado' ? '<p class="lugar">' + config.venue_ciudad + ' · ' + config.hero_fecha_texto + '</p>' + florSvg : '') + '<a href="' + whatsappUrl + '" target="_blank" rel="noopener noreferrer" class="btn">💬 SOS WhatsApp</a></div></body></html>';
}

/**
 * ⚠️ NO EJECUTAR MANUALMENTE - Esta función se llama desde el formulario web
 * Guarda la confirmación del invitado en Google Sheets.
 * Llamada desde el cliente via google.script.run.
 *
 * @param {Object} datos - Objeto con los datos del formulario RSVP:
 *   {
 *     id: string,
 *     enviarCorreo: boolean,
 *     correo: string,
 *     asistentes: number,
 *     restricciones: string,
 *     bebida: string,
 *     canciones: string,
 *     consejo: string,
 *     confirmarVinculado: boolean
 *   }
 * @returns {Object} { success: boolean, error?: string }
 */
function guardarConfirmacion(datos) {
  return guardarConfirmacion_(datos, SpreadsheetApp.getActiveSpreadsheet(), new Date());
}

/**
 * Lógica interna de guardarConfirmacion, extraída para facilitar el testing.
 *
 * @param {Object} datos - Datos del formulario RSVP.
 * @param {Spreadsheet} ss - Objeto Spreadsheet de Google Apps Script.
 * @param {Date} now - Fecha/hora actual para el timestamp.
 * @returns {Object} { success: boolean, error?: string }
 */
function guardarConfirmacion_(datos, ss, now) {
  try {
    // 5.1 Validar que el ID existe
    var hojaInv = ss.getSheetByName('Invitados');
    var datosInv = hojaInv.getDataRange().getValues();
    var filaIdx = -1;
    for (var i = 1; i < datosInv.length; i++) {
      if (String(datosInv[i][0]) === String(datos.id)) { filaIdx = i; break; }
    }
    if (filaIdx === -1) {
      return { success: false, error: 'ID de invitado no encontrado' };
    }

    // 5.2 Insertar fila en Hoja_Respuestas
    var hojaResp = ss.getSheetByName('Respuestas');
    
    // Preparar lista de invitados para el correo
    var invitadosParaCorreo = [{ nombre: datosInv[filaIdx][1], id: datos.id }];
    
    // Buscar TODOS los invitados vinculados (no solo uno)
    // Buscar por ID_Vinculado que coincida con el ID principal O que tenga el mismo ID_Vinculado
    var idPrincipal = datos.id;
    var idVinculadoPrincipal = datosInv[filaIdx][2];
    
    for (var k = 1; k < datosInv.length; k++) {
      var idActual = String(datosInv[k][0]);
      var idVinculadoActual = datosInv[k][2] ? String(datosInv[k][2]) : '';
      
      // Saltar el invitado principal
      if (idActual === idPrincipal) continue;
      
      // Agregar si:
      // 1. Su ID_Vinculado apunta al principal
      // 2. El principal apunta a él
      // 3. Ambos apuntan al mismo ID_Vinculado (grupo)
      var esVinculado = false;
      
      if (idVinculadoActual === idPrincipal) {
        esVinculado = true; // Este invitado apunta al principal
      } else if (idVinculadoPrincipal && idActual === idVinculadoPrincipal) {
        esVinculado = true; // El principal apunta a este
      } else if (idVinculadoPrincipal && idVinculadoActual === idVinculadoPrincipal) {
        esVinculado = true; // Ambos apuntan al mismo grupo
      }
      
      if (esVinculado && datos.confirmarVinculado === true) {
        invitadosParaCorreo.push({ nombre: datosInv[k][1], id: idActual });
      }
    }
    
    // Intentar enviar correo si aplica
    var emailEnviado = 'No';
    var emailError = '';
    if (datos.enviarCorreo === true && validarEmail_(datos.correo)) {
      try {
        Logger.log('📧 Enviando correo a: ' + datos.correo + ' para ' + invitadosParaCorreo.length + ' invitado(s)');
        enviarCorreo_({ 
          nombre: datosInv[filaIdx][1], 
          correo: datos.correo, 
          id: datos.id,
          invitados: invitadosParaCorreo
        });
        emailEnviado = 'Sí';
        Logger.log('✅ Correo enviado exitosamente');
      } catch (emailErr) {
        emailEnviado = 'Error';
        emailError = emailErr.toString().substring(0, 100); // Primeros 100 caracteres del error
        Logger.log('❌ Error al enviar correo: ' + emailErr.toString());
        console.error('Error al enviar correo:', emailErr);
      }
    } else {
      Logger.log('ℹ️ No se envió correo. enviarCorreo=' + datos.enviarCorreo + ', correoValido=' + validarEmail_(datos.correo) + ', correo=' + datos.correo);
    }
    
    hojaResp.appendRow([
      datos.id,
      now.toISOString(),
      datos.enviarCorreo ? 'Sí' : 'No',
      datos.correo || '',
      datos.asistentes || 0,
      datos.restricciones || 'Ninguna',
      datos.bebida || '',
      datos.canciones || '',
      datos.consejo || '',
      emailEnviado,           // Nueva columna J
      emailError              // Nueva columna K
    ]);

    // 5.3 Actualizar Estado del invitado principal
    hojaInv.getRange(filaIdx + 1, 4).setValue('Confirmado');

    // 5.4 Actualizar Estado de TODOS los vinculados si confirmarVinculado === true
    if (datos.confirmarVinculado === true) {
      var idPrincipal = datos.id;
      var idVinculadoPrincipal = datosInv[filaIdx][2];
      
      for (var j = 1; j < datosInv.length; j++) {
        // Saltar el invitado principal
        if (String(datosInv[j][0]) === String(idPrincipal)) continue;
        
        var idActual = String(datosInv[j][0]);
        var idVinculadoActual = datosInv[j][2] ? String(datosInv[j][2]) : '';
        
        // Actualizar si está vinculado
        var esVinculado = false;
        
        if (idVinculadoActual === idPrincipal) {
          esVinculado = true;
        } else if (idVinculadoPrincipal && idActual === idVinculadoPrincipal) {
          esVinculado = true;
        } else if (idVinculadoPrincipal && idVinculadoActual === idVinculadoPrincipal) {
          esVinculado = true;
        }
        
        if (esVinculado) {
          hojaInv.getRange(j + 1, 4).setValue('Confirmado');
          Logger.log('✅ Vinculado confirmado: ' + datosInv[j][1] + ' (ID: ' + idActual + ')');
        }
      }
    }

    return { success: true };
  } catch (err) {
    console.error('Error en guardarConfirmacion:', err);
    return { success: false, error: 'Error al guardar. Intenta de nuevo.' };
  }
}

/**
 * Función de prueba para enviar correo manualmente desde el editor.
 * Ejecutar esta función para probar el envío de correo.
 * IMPORTANTE: Cambia el correo por uno real antes de ejecutar.
 */
function probarEnvioCorreo() {
  var ui = SpreadsheetApp.getUi();
  var response = ui.prompt(
    'Probar Envío de Correo',
    'Ingresa tu correo electrónico para recibir un correo de prueba:',
    ui.ButtonSet.OK_CANCEL
  );
  
  if (response.getSelectedButton() !== ui.Button.OK) {
    Logger.log('❌ Prueba cancelada por el usuario');
    return;
  }
  
  var correo = response.getResponseText().trim();
  
  if (!validarEmail_(correo)) {
    ui.alert('❌ Error', 'El correo ingresado no es válido.', ui.ButtonSet.OK);
    Logger.log('❌ Correo inválido: ' + correo);
    return;
  }
  
  var datosTest = {
    nombre: 'Invitado de Prueba',
    correo: correo,
    id: 'INV001'
  };
  
  try {
    enviarCorreo_(datosTest);
    Logger.log('✅ Correo enviado exitosamente a: ' + datosTest.correo);
    ui.alert('✅ Éxito', 'Correo de prueba enviado exitosamente a:\n' + correo, ui.ButtonSet.OK);
  } catch (error) {
    Logger.log('❌ Error al enviar correo: ' + error.toString());
    ui.alert('❌ Error', 'No se pudo enviar el correo:\n' + error.toString(), ui.ButtonSet.OK);
  }
}

/**
 * Envía el pase de acceso por correo electrónico con código QR y adjunto .ics.
 * Usa QuickChart para generar el QR y GmailApp para el envío.
 * Si QuickChart falla, envía el correo sin imagen QR (fallback de texto).
 *
 * @param {Object} datos - Objeto con los datos del invitado:
 *   {
 *     nombre: string,
 *     correo: string,
 *     id: string
 *   }
 */
function enviarCorreo(datos) {
  enviarCorreo_(datos);
}

/**
 * Lógica interna de enviarCorreo, extraída para facilitar el testing.
 *
 * @param {Object} datos - { nombre, correo, id }
 */
function enviarCorreo_(datos) {
  // Obtener configuración
  var config = obtenerParametros();
  
  // Determinar si hay múltiples invitados
  var invitados = datos.invitados || [{ nombre: datos.nombre, id: datos.id }];
  var esMultiple = invitados.length > 1;
  
  // Crear contenido del QR con nombre del invitado en formato JSON
  var qrData = JSON.stringify({
    id: datos.id,
    nombre: datos.nombre,
    invitados: invitados.map(function(inv) { return inv.nombre; })
  });
  
  var qrUrl = 'https://quickchart.io/qr?text=' + encodeURIComponent(qrData) + '&size=300';
  var qrImgTag = '';

  // Fallback si QuickChart falla
  try {
    UrlFetchApp.fetch(qrUrl, { muteHttpExceptions: true });
    qrImgTag = '<img src="' + qrUrl + '" alt="Código QR de acceso" width="300" height="300" style="border-radius:16px;box-shadow:0 8px 32px rgba(0,0,0,0.15);" />';
  } catch (e) {
    console.error('QuickChart no disponible:', e);
    qrImgTag = '<div style="font-family:monospace;background:#f0f0f0;padding:20px;border-radius:12px;font-size:18px;font-weight:600;color:#1a2e22;">' + datos.nombre + '<br><span style="font-size:14px;color:#7a7a7a;">ID: ' + datos.id + '</span></div>';
  }
  
  // Construir tabla de invitados si hay múltiples
  var tablaInvitados = '';
  if (esMultiple) {
    tablaInvitados = '<div style="background:#fff9f0;border-radius:12px;padding:1.5rem;margin:1.5rem 0;">' +
      '<h3 style="color:#1a2e22;margin:0 0 1rem;font-size:1.1rem;font-weight:600;text-align:center;">Invitados Confirmados</h3>' +
      '<table style="width:100%;border-collapse:collapse;">';
    
    for (var i = 0; i < invitados.length; i++) {
      tablaInvitados += '<tr style="border-bottom:1px solid rgba(201,169,110,0.2);">' +
        '<td style="padding:0.75rem 0;color:#1a2e22;font-weight:500;">' + invitados[i].nombre + '</td>' +
        '<td style="padding:0.75rem 0;color:#7a9e7e;text-align:right;font-size:0.85rem;">ID: ' + invitados[i].id + '</td>' +
        '</tr>';
    }
    
    tablaInvitados += '</table></div>';
  }

  // Parsear timeline para el .ics y el email (soporta hasta 10 eventos)
  var timelineItems = [];
  for (var i = 1; i <= 10; i++) {
    var timeline = config['timeline_' + i];
    if (timeline) {
      var parts = timeline.split('|');
      if (parts.length === 2) {
        timelineItems.push({ hora: parts[0].trim(), desc: parts[1].trim() });
      }
    }
  }
  
  // Construir descripción del timeline para .ics
  var timelineDesc = timelineItems.map(function(item) {
    return item.hora + ' - ' + item.desc;
  }).join('\\n');
  
  // Formatear fecha para .ics (YYYYMMDDTHHMMSS)
  var fechaIcs = config.fecha_boda.replace(/-/g, '') + 'T' + config.hora_boda.replace(/:/g, '') + '00';
  
  // Generar contenido .ics (RFC 5545)
  var icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Wedding Invitation App//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Boda ' + config.nombre_novia + ' & ' + config.nombre_novio,
    'X-WR-TIMEZONE:America/Bogota',
    'BEGIN:VEVENT',
    'UID:boda-' + config.nombre_novia.toLowerCase() + '-' + config.nombre_novio.toLowerCase() + '-2026@wedding-app',
    'DTSTART:' + fechaIcs,
    'DTEND:' + fechaIcs.substring(0, 8) + 'T190000',
    'DTSTAMP:' + Utilities.formatDate(new Date(), 'GMT', "yyyyMMdd'T'HHmmss'Z'"),
    'SUMMARY:Boda de ' + config.nombre_novia + ' & ' + config.nombre_novio,
    'LOCATION:' + config.venue_nombre + ' - ' + config.venue_direccion.replace(/,/g, '\\,') + '\\, ' + config.venue_ciudad,
    'DESCRIPTION:¡Estás invitado a nuestra boda! Te esperamos con mucho amor.\\n\\nPrograma del día:\\n' + timelineDesc + '\\n\\nDress Code: ' + config.dresscode_descripcion + '\\nColores reservados: ' + config.dresscode_colores_reservados,
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'BEGIN:VALARM',
    'TRIGGER:-P1D',
    'DESCRIPTION:Recordatorio: Boda de ' + config.nombre_novia + ' & ' + config.nombre_novio + ' mañana',
    'ACTION:DISPLAY',
    'END:VALARM',
    'BEGIN:VALARM',
    'TRIGGER:-PT2H',
    'DESCRIPTION:Recordatorio: Boda de ' + config.nombre_novia + ' & ' + config.nombre_novio + ' en 2 horas',
    'ACTION:DISPLAY',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  var icsBlob = Utilities.newBlob(icsContent, 'text/calendar', 'boda-' + config.nombre_novia.toLowerCase() + '-' + config.nombre_novio.toLowerCase() + '.ics');

  // Construir timeline HTML para el email
  var timelineHtml = '';
  for (var i = 0; i < timelineItems.length; i++) {
    timelineHtml += '<tr><td style="padding:0.4rem 0;color:#4a4a4a;font-size:0.9rem;"><strong style="color:#c9a96e;">' + timelineItems[i].hora + '</strong> &mdash; ' + timelineItems[i].desc + '</td></tr>';
  }
  
  // HTML del correo con diseño de lujo
  var htmlBody = '<!DOCTYPE html>' +
    '<html lang="es">' +
    '<head>' +
    '<meta charset="UTF-8">' +
    '<meta name="viewport" content="width=device-width, initial-scale=1.0">' +
    '<title>Confirmacion de Asistencia</title>' +
    '</head>' +
    '<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,sans-serif;background:#f7f0e6;">' +
    
    // Container principal
    '<div style="max-width:600px;margin:0 auto;background:#ffffff;">' +
    
    // Header con degradado y foto de pareja
    '<div style="background:linear-gradient(135deg, #1a2e22 0%, #243d2e 100%);padding:3rem 2rem;text-align:center;position:relative;overflow:hidden;">' +
    '<div style="position:absolute;top:0;left:0;right:0;bottom:0;background:radial-gradient(circle at 50% 50%, rgba(201,169,110,0.1) 0%, transparent 70%);"></div>' +
    '<div style="position:relative;z-index:1;">' +
    // Foto de pareja circular
    (config.historia_foto_url ? 
      '<div style="margin-bottom:1.5rem;">' +
      '<img src="' + config.historia_foto_url + '" alt="' + (config.historia_foto_alt || config.nombre_novia + ' y ' + config.nombre_novio) + '" style="width:120px;height:120px;border-radius:50%;object-fit:cover;border:3px solid #c9a96e;box-shadow:0 8px 24px rgba(0,0,0,0.3);">' +
      '</div>' : '') +
    '<h1 style="color:#f7f0e6;margin:0 0 0.5rem;font-size:2.5rem;font-weight:400;font-style:italic;font-family:Georgia,serif;letter-spacing:0.02em;">' + config.nombre_novia + ' <span style="color:#c9a96e;font-size:1.1em;">&amp;</span> ' + config.nombre_novio + '</h1>' +
    '<div style="width:80px;height:1px;background:linear-gradient(90deg,transparent,#c9a96e,transparent);margin:1rem auto;"></div>' +
    '<p style="color:#e0c898;margin:0;font-size:0.9rem;letter-spacing:0.15em;text-transform:uppercase;font-weight:300;">' + config.hero_fecha_texto + '</p>' +
    '</div>' +
    '</div>' +
    
    // Contenido principal
    '<div style="padding:2.5rem 2rem;">' +
    
    // Saludo personalizado
    '<div style="text-align:center;margin-bottom:2rem;">' +
    '<h2 style="color:#1a2e22;margin:0 0 0.75rem;font-size:1.8rem;font-weight:400;font-style:italic;font-family:Georgia,serif;">Hola, ' + datos.nombre + '!</h2>' +
    '<p style="color:#4a4a4a;font-size:1.05rem;line-height:1.7;margin:0;">' + config.email_saludo + '</p>' +
    '</div>' +
    
    // Tabla de invitados (si hay múltiples)
    tablaInvitados +
    
    // QR Code
    '<div style="text-align:center;margin:2rem 0;">' +
    '<div style="background:#f7f0e6;border-radius:20px;padding:2rem;display:inline-block;box-shadow:0 4px 20px rgba(0,0,0,0.08);">' +
    qrImgTag +
    '</div>' +
    '<p style="color:#7a7a7a;font-size:0.9rem;margin:1rem 0 0;font-style:italic;">' + config.email_qr_texto + '</p>' +
    '</div>' +
    
    // Información del evento
    '<div style="background:#f7f0e6;border-radius:16px;padding:2rem;margin:2rem 0;">' +
    '<h3 style="color:#1a2e22;margin:0 0 1.5rem;font-size:1.3rem;font-weight:600;text-align:center;font-family:Georgia,serif;font-style:italic;">Detalles del Evento</h3>' +
    
    // Ubicación
    '<div style="margin-bottom:1.5rem;padding-bottom:1.5rem;border-bottom:1px solid rgba(201,169,110,0.2);">' +
    '<div style="margin-bottom:0.5rem;">' +
    '<p style="margin:0 0 0.25rem;font-weight:600;color:#1a2e22;font-size:1.1rem;">Ubicación</p>' +
    '<p style="margin:0 0 0.25rem;font-weight:600;color:#c9a96e;font-size:1rem;">' + config.venue_nombre + '</p>' +
    '<p style="margin:0;color:#4a4a4a;font-size:0.95rem;line-height:1.5;">' + config.venue_direccion + '<br>' + config.venue_ciudad + ', ' + config.venue_pais + '</p>' +
    '<a href="' + config.venue_maps_url + '" style="display:inline-block;margin-top:0.5rem;color:#7a9e7e;text-decoration:none;font-size:0.9rem;font-weight:500;">Ver en Google Maps &rarr;</a>' +
    '</div>' +
    '</div>' +
    
    // Programa del día
    '<div style="margin-bottom:1.5rem;padding-bottom:1.5rem;border-bottom:1px solid rgba(201,169,110,0.2);">' +
    '<div>' +
    '<p style="margin:0 0 0.75rem;font-weight:600;color:#1a2e22;font-size:1.1rem;">Programa del Día</p>' +
    '<table style="width:100%;border-collapse:collapse;">' +
    timelineHtml +
    '</table>' +
    '</div>' +
    '</div>' +
    
    // Código de Vestimenta
    '<div>' +
    '<div>' +
    '<p style="margin:0 0 0.5rem;font-weight:600;color:#1a2e22;font-size:1.1rem;">Código de Vestimenta</p>' +
    '<p style="margin:0 0 0.5rem;color:#4a4a4a;font-size:0.95rem;">' + config.dresscode_descripcion + '</p>' +
    '<div style="margin-top:0.75rem;">' +
    '<p style="margin:0 0 0.5rem;color:#7a7a7a;font-size:0.85rem;font-style:italic;">Colores reservados: ' + config.dresscode_colores_reservados + '</p>' +
    '</div>' +
    '</div>' +
    '</div>' +
    
    '</div>' +
    
    // Notas importantes
    '<div style="background:#fff9f0;border-left:4px solid #c9a96e;padding:1.5rem;margin:2rem 0;border-radius:8px;">' +
    '<p style="margin:0 0 0.75rem;font-weight:600;color:#1a2e22;font-size:1rem;">Notas Importantes</p>' +
    '<ul style="margin:0;padding-left:1.25rem;color:#4a4a4a;font-size:0.9rem;line-height:1.7;">' +
    '<li style="margin-bottom:0.5rem;">' + config.nota_1 + '</li>' +
    '<li style="margin-bottom:0.5rem;">' + config.nota_2 + '</li>' +
    '<li style="margin-bottom:0.5rem;">' + config.nota_3 + '</li>' +
    '<li>' + config.nota_4 + '</li>' +
    '</ul>' +
    '</div>' +
    
    // Botón de acción
    '<div style="text-align:center;margin:2rem 0;">' +
    '<a href="' + config.webapp_url + '?id=' + datos.id + '" style="display:inline-block;padding:1rem 2.5rem;background:linear-gradient(135deg,#c9a96e,#a07840);color:#1a2e22;text-decoration:none;border-radius:50px;font-weight:500;font-size:0.95rem;letter-spacing:0.05em;box-shadow:0 4px 20px rgba(201,169,110,0.4);">Ver Mi Invitacion</a>' +
    '</div>' +
    
    // Mensaje final
    '<div style="text-align:center;margin:2rem 0;">' +
    '<p style="color:#4a4a4a;font-size:1rem;line-height:1.7;margin:0 0 1rem;font-style:italic;">' + config.email_cierre + '</p>' +
    '<p style="color:#7a9e7e;font-size:1.2rem;font-weight:600;margin:0 0 1.5rem;">' + config.email_despedida + '</p>' +
    '<p style="color:#7a7a7a;font-size:0.85rem;margin:0;font-style:italic;">¿Cambio de planes? <a href="' + config.webapp_url + '?id=' + datos.id + '" style="color:#d4a5a5;text-decoration:underline;">Actualiza tu confirmacion aqui</a></p>' +
    '</div>' +
    
    '</div>' +
    
    // Footer
    '<div style="background:#1a2e22;padding:2rem;text-align:center;">' +
    '<p style="color:#7a9e7e;font-size:0.85rem;margin:0 0 0.5rem;">Con amor,</p>' +
    '<p style="color:#c9a96e;font-size:1.3rem;font-weight:600;margin:0;font-family:Georgia,serif;font-style:italic;">' + config.nombre_novia + ' &amp; ' + config.nombre_novio + '</p>' +
    '<div style="width:60px;height:1px;background:linear-gradient(90deg,transparent,#c9a96e,transparent);margin:1rem auto;"></div>' +
    '<p style="color:#7a9e7e;font-size:0.75rem;margin:0.5rem 0 0;">Necesitas ayuda? <a href="https://wa.me/' + config.whatsapp_numero + '" style="color:#c9a96e;text-decoration:none;">Contactanos por WhatsApp</a></p>' +
    '</div>' +
    
    '</div>' +
    
    '</body>' +
    '</html>';

  // Enviar correo
  GmailApp.sendEmail(datos.correo, 'Confirmacion de Asistencia - Boda ' + config.nombre_novia + ' & ' + config.nombre_novio, '', {
    htmlBody: htmlBody,
    attachments: [icsBlob],
    name: config.nombre_novia + ' & ' + config.nombre_novio + ' - Boda 2026'
  });
}

/**
 * Agrega canciones adicionales a la respuesta del invitado.
 * Llamada desde el cliente después de confirmar asistencia.
 *
 * @param {Object} datos - { id: string, canciones: string }
 * @returns {Object} { success: boolean, error?: string }
 */
function agregarCancionesExtra(datos) {
  return agregarCancionesExtra_(datos, SpreadsheetApp.getActiveSpreadsheet());
}

/**
 * Lógica interna de agregarCancionesExtra.
 *
 * @param {Object} datos - { id, canciones }
 * @param {Spreadsheet} ss - Objeto Spreadsheet
 * @returns {Object} { success: boolean, error?: string }
 */
function agregarCancionesExtra_(datos, ss) {
  try {
    var hojaResp = ss.getSheetByName('Respuestas');
    if (!hojaResp) {
      return { success: false, error: 'Hoja Respuestas no encontrada' };
    }

    var datosResp = hojaResp.getDataRange().getValues();
    var filaIdx = -1;

    // Buscar la última respuesta de este invitado
    for (var i = datosResp.length - 1; i >= 1; i--) {
      if (String(datosResp[i][0]) === String(datos.id)) {
        filaIdx = i;
        break;
      }
    }

    if (filaIdx === -1) {
      return { success: false, error: 'No se encontró tu confirmación' };
    }

    // Columna 8 (índice 7) = Canciones
    var cancionesActuales = String(datosResp[filaIdx][7] || '').trim();
    var nuevasCanciones = String(datos.canciones || '').trim();
    
    var cancionesFinales = '';
    
    // Concatenar con salto de línea para mejor legibilidad
    if (cancionesActuales && nuevasCanciones) {
      cancionesFinales = cancionesActuales + '\n' + nuevasCanciones;
    } else if (nuevasCanciones) {
      cancionesFinales = nuevasCanciones;
    } else {
      cancionesFinales = cancionesActuales;
    }

    // Actualizar la celda
    hojaResp.getRange(filaIdx + 1, 8).setValue(cancionesFinales);

    return { success: true };
  } catch (err) {
    console.error('Error en agregarCancionesExtra:', err);
    return { success: false, error: 'Error al agregar canciones' };
  }
}

/**
 * Obtiene información de invitados vinculados para mostrar en el modal de cancelación.
 * Llamada desde Agradecimiento.html.
 *
 * @param {Object} datos - { id: string }
 * @returns {Object} { success: boolean, invitados: Array, error?: string }
 */
function obtenerInvitadosVinculados(datos) {
  return obtenerInvitadosVinculados_(datos, SpreadsheetApp.getActiveSpreadsheet());
}

/**
 * Lógica interna de obtenerInvitadosVinculados.
 *
 * @param {Object} datos - { id }
 * @param {Spreadsheet} ss - Objeto Spreadsheet
 * @returns {Object} { success: boolean, invitados: Array, error?: string }
 */
function obtenerInvitadosVinculados_(datos, ss) {
  try {
    if (!datos || !datos.id) {
      return { success: false, error: 'ID no proporcionado' };
    }

    var hojaInv = ss.getSheetByName('Invitados');
    if (!hojaInv) {
      return { success: false, error: 'Hoja Invitados no encontrada' };
    }

    var datosInv = hojaInv.getDataRange().getValues();
    var invitados = [];
    var invitadoPrincipal = null;
    var idPrincipal = String(datos.id);
    var idVinculadoPrincipal = '';

    // Buscar el invitado principal
    for (var i = 1; i < datosInv.length; i++) {
      if (String(datosInv[i][0]) === idPrincipal) {
        invitadoPrincipal = {
          id: datosInv[i][0],
          nombre: datosInv[i][1],
          estado: datosInv[i][3],
          esPrincipal: true
        };
        invitados.push(invitadoPrincipal);
        idVinculadoPrincipal = datosInv[i][2] ? String(datosInv[i][2]) : '';
        break;
      }
    }

    if (!invitadoPrincipal) {
      return { success: false, error: 'Invitado no encontrado' };
    }

    // Buscar TODOS los invitados vinculados
    for (var j = 1; j < datosInv.length; j++) {
      var idActual = String(datosInv[j][0]);
      
      // Saltar el principal
      if (idActual === idPrincipal) continue;
      
      var idVinculadoActual = datosInv[j][2] ? String(datosInv[j][2]) : '';
      var esVinculado = false;
      
      // Verificar si está vinculado
      if (idVinculadoActual === idPrincipal) {
        esVinculado = true; // Este apunta al principal
      } else if (idVinculadoPrincipal && idActual === idVinculadoPrincipal) {
        esVinculado = true; // El principal apunta a este
      } else if (idVinculadoPrincipal && idVinculadoActual === idVinculadoPrincipal) {
        esVinculado = true; // Ambos apuntan al mismo grupo
      }
      
      if (esVinculado) {
        invitados.push({
          id: datosInv[j][0],
          nombre: datosInv[j][1],
          estado: datosInv[j][3],
          esPrincipal: false
        });
      }
    }

    return { success: true, invitados: invitados };

  } catch (err) {
    Logger.log('❌ Error en obtenerInvitadosVinculados: ' + err.toString());
    console.error('Error en obtenerInvitadosVinculados:', err);
    return { success: false, error: 'Error al obtener invitados' };
  }
}

/**
 * Cancela la confirmación de invitados seleccionados.
 * Versión mejorada que permite cancelar invitados específicos.
 *
 * @param {Object} datos - { idsACancelar: Array<string> }
 * @returns {Object} { success: boolean, error?: string }
 */
function cancelarConfirmacionSelectiva(datos) {
  return cancelarConfirmacionSelectiva_(datos, SpreadsheetApp.getActiveSpreadsheet());
}

/**
 * Lógica interna de cancelarConfirmacionSelectiva.
 *
 * @param {Object} datos - { idsACancelar: Array }
 * @param {Spreadsheet} ss - Objeto Spreadsheet
 * @returns {Object} { success: boolean, error?: string }
 */
function cancelarConfirmacionSelectiva_(datos, ss) {
  try {
    if (!datos || !datos.idsACancelar || !Array.isArray(datos.idsACancelar) || datos.idsACancelar.length === 0) {
      return { success: false, error: 'No se especificaron IDs para cancelar' };
    }

    var hojaInv = ss.getSheetByName('Invitados');
    if (!hojaInv) {
      return { success: false, error: 'Hoja Invitados no encontrada' };
    }

    var datosInv = hojaInv.getDataRange().getValues();
    var cancelados = 0;

    // Cancelar cada ID especificado
    for (var k = 0; k < datos.idsACancelar.length; k++) {
      var idACancelar = String(datos.idsACancelar[k]);
      
      for (var i = 1; i < datosInv.length; i++) {
        if (String(datosInv[i][0]) === idACancelar) {
          // Solo cancelar si está confirmado
          if (datosInv[i][3] === 'Confirmado') {
            hojaInv.getRange(i + 1, 4).setValue('Pendiente');
            cancelados++;
            Logger.log('✅ Confirmación cancelada para ID: ' + idACancelar + ' (' + datosInv[i][1] + ')');
          }
          break;
        }
      }
    }

    if (cancelados === 0) {
      return { success: false, error: 'No se encontraron invitados confirmados para cancelar' };
    }

    return { success: true, cancelados: cancelados };

  } catch (err) {
    Logger.log('❌ Error en cancelarConfirmacionSelectiva: ' + err.toString());
    console.error('Error en cancelarConfirmacionSelectiva:', err);
    return { success: false, error: 'Error al cancelar. Intenta de nuevo.' };
  }
}

/**
 * Cancela la confirmación de un invitado (cambia su estado de "Confirmado" a "Pendiente").
 * Llamada desde Agradecimiento.html cuando el usuario cambia de opinión.
 *
 * @param {Object} datos - { id: string }
 * @returns {Object} { success: boolean, error?: string }
 */
function cancelarConfirmacion(datos) {
  return cancelarConfirmacion_(datos, SpreadsheetApp.getActiveSpreadsheet());
}

/**
 * Lógica interna de cancelarConfirmacion.
 *
 * @param {Object} datos - { id }
 * @param {Spreadsheet} ss - Objeto Spreadsheet
 * @returns {Object} { success: boolean, error?: string }
 */
function cancelarConfirmacion_(datos, ss) {
  try {
    if (!datos || !datos.id) {
      return { success: false, error: 'ID no proporcionado' };
    }

    var hojaInv = ss.getSheetByName('Invitados');
    if (!hojaInv) {
      return { success: false, error: 'Hoja Invitados no encontrada' };
    }

    var datosInv = hojaInv.getDataRange().getValues();
    var filaIdx = -1;
    var idPrincipal = String(datos.id);

    // Buscar el invitado
    for (var i = 1; i < datosInv.length; i++) {
      if (String(datosInv[i][0]) === idPrincipal) {
        filaIdx = i;
        break;
      }
    }

    if (filaIdx === -1) {
      return { success: false, error: 'Invitado no encontrado' };
    }

    // Verificar que esté confirmado
    if (datosInv[filaIdx][3] !== 'Confirmado') {
      return { success: false, error: 'Tu asistencia no está confirmada' };
    }

    // Cambiar estado a "Pendiente"
    hojaInv.getRange(filaIdx + 1, 4).setValue('Pendiente');
    Logger.log('✅ Confirmación cancelada para ID: ' + idPrincipal + ' (' + datosInv[filaIdx][1] + ')');

    // Cambiar estado de TODOS los vinculados también
    var idVinculadoPrincipal = datosInv[filaIdx][2] ? String(datosInv[filaIdx][2]) : '';
    
    for (var j = 1; j < datosInv.length; j++) {
      // Saltar el principal
      if (j === filaIdx) continue;
      
      var idActual = String(datosInv[j][0]);
      var idVinculadoActual = datosInv[j][2] ? String(datosInv[j][2]) : '';
      var esVinculado = false;
      
      // Verificar si está vinculado
      if (idVinculadoActual === idPrincipal) {
        esVinculado = true;
      } else if (idVinculadoPrincipal && idActual === idVinculadoPrincipal) {
        esVinculado = true;
      } else if (idVinculadoPrincipal && idVinculadoActual === idVinculadoPrincipal) {
        esVinculado = true;
      }
      
      if (esVinculado && datosInv[j][3] === 'Confirmado') {
        hojaInv.getRange(j + 1, 4).setValue('Pendiente');
        Logger.log('✅ Vinculado cancelado: ' + datosInv[j][1] + ' (ID: ' + idActual + ')');
      }
    }

    return { success: true };

  } catch (err) {
    Logger.log('❌ Error en cancelarConfirmacion: ' + err.toString());
    console.error('Error en cancelarConfirmacion:', err);
    return { success: false, error: 'Error al cancelar. Intenta de nuevo.' };
  }
}

/**
 * Valida el formato básico de una dirección de correo electrónico.
 * Función privada (sufijo _).
 *
 * @param {string} email - Dirección de correo a validar.
 * @returns {boolean} true si el formato es válido, false en caso contrario.
 */
function validarEmail_(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Lee Hoja_Invitados y Hoja_Respuestas y calcula métricas en tiempo real.
 * Función privada (sufijo _). Llamada por doGet cuando page=dashboard.
 *
 * @param {Spreadsheet} ss - Objeto Spreadsheet de Google Apps Script.
 * @returns {Object} Objeto de métricas:
 *   {
 *     totalConfirmados: number,
 *     totalPendientes: number,
 *     totalInvitados: number,
 *     porBebida: { Vino: number, Whisky: number, Tequila: number, 'Sin alcohol': number },
 *     porRestriccion: {
 *       Ninguna: number,
 *       Vegetariano: number,
 *       Vegano: number,
 *       'Sin gluten': number,
 *       'Sin lactosa': number,
 *       Otro: number
 *     }
 *   }
 */
function getDashboardData_(ss) {
  var metricas = {
    totalConfirmados: 0,
    totalPendientes: 0,
    totalInvitados: 0,
    porBebida: { 'Vino': 0, 'Whisky': 0, 'Tequila': 0, 'Sin alcohol': 0 },
    porRestriccion: { 'Ninguna': 0, 'Vegetariano': 0, 'Vegano': 0, 'Sin gluten': 0, 'Sin lactosa': 0, 'Otro': 0 }
  };

  // Leer Hoja_Invitados
  var hojaInv = ss.getSheetByName('Invitados');
  if (hojaInv) {
    var datosInv = hojaInv.getDataRange().getValues();
    for (var i = 1; i < datosInv.length; i++) {
      var estado = datosInv[i][3];
      metricas.totalInvitados++;
      if (estado === 'Confirmado') metricas.totalConfirmados++;
      else if (estado === 'Pendiente') metricas.totalPendientes++;
    }
  }

  // Leer Hoja_Respuestas
  var hojaResp = ss.getSheetByName('Respuestas');
  if (hojaResp) {
    var datosResp = hojaResp.getDataRange().getValues();
    for (var j = 1; j < datosResp.length; j++) {
      var bebida = datosResp[j][6];
      var restriccion = datosResp[j][5];
      if (metricas.porBebida.hasOwnProperty(bebida)) metricas.porBebida[bebida]++;
      if (metricas.porRestriccion.hasOwnProperty(restriccion)) metricas.porRestriccion[restriccion]++;
    }
  }

  return metricas;
}
