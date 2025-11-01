// Almacenamiento en memoria de las sesiones activas
// Estructura: { token: userId }
const sessions = new Map();
const usuarios = new Map();


exports.verificarEstado = (req, res, next) => {
  const nombre = req.userId;
  const categoria = req.categoria;
  const user = obtenerUsuario(nombre);
  const cert = user.certificaciones[categoria];

  if (!cert) {
    return res.status(400).json({
      message: "Certificacion no valida."
    });
  }

  if (cert.pago && cert.examenHecho) {
    return res.status(400).json({
      message: `Ya hizo el examen una vez. No es posible hacerlo una vez mas.`,
      estado: "completo",
      pago: true,
      examenHecho: true
    });
  }

  if (!cert.pagado) {
    return res.status(200).json({
      message: `Acceso denegado: Aun no ha pagado el certificado.`,
      estado: "examenSinPago",
      pago: false,
      examenHecho: true
    });
  }

  next();
};

/**
 * Middleware para verificar el token de sesión
 * Espera el token en el header: Authorization: Bearer <token>
 */
exports.verifyToken = (req, res, next) => {
  // Obtener el header Authorization
  const authHeader = req.headers.authorization;

  // Verificar que exista y tenga el formato correcto
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      error: 'Token no proporcionado o formato incorrecto',
      formato_esperado: 'Authorization: Bearer <token>' 
    });
  }

  // Extraer el token (remover 'Bearer ')
  const token = authHeader.substring(7);

  // Verificar si el token existe en las sesiones activas
  const userId = sessions.get(token);

  if (!userId) {
    return res.status(401).json({ 
      error: 'Token inválido o expirado' 
    });
  }

  // Agregar la información del usuario al request para uso posterior
  req.userId = userId;
  req.token = token;
  req.categoria = req.query.categoria;

  // Continuar con la siguiente función
  next();
};

/**
 * Función para crear una nueva sesión
 * @param {string} userId - ID del usuario
 * @returns {string} token - Token generado
 */
exports.createSession = (userId) => {
  const crypto = require('crypto');
  // Usar crypto.randomUUID cuando esté disponible (Node 14.17+).
  // Si no está disponible, hacer fallback a randomBytes para compatibilidad.
  const token = (typeof crypto.randomUUID === 'function')
    ? crypto.randomUUID()
    : crypto.randomBytes(32).toString('hex');
  sessions.set(token, userId);
  return token;
};

/**
 * Función para eliminar una sesión (logout)
 * @param {string} token - Token de la sesión a eliminar
 * @returns {boolean} - True si se eliminó, false si no existía
 */
exports.deleteSession = (token) => {
  return sessions.delete(token);
};

/**
 * Función para obtener todas las sesiones activas (útil para debugging)
 * @returns {number} - Número de sesiones activas
 */
exports.getActiveSessions = () => {
  return sessions.size;
};

/**
 * Función para limpiar todas las sesiones (útil para mantenimiento)
 */
exports.clearAllSessions = () => {
  sessions.clear();
};

