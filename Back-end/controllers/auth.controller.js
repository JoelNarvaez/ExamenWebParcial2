// Importa el array de usuarios desde el archivo JSON (se carga una sola vez al iniciar)
const users = require("../data/users.json");
const {
  createSession,
  deleteSession,
} = require("../middleware/auth.middleware");


const examCache = new Map(); // userId -> [ids]
exports.examCache = examCache;

// Función controladora para manejar el login
exports.login = (req, res) => {
  // Extrae 'cuenta' del body de la petición (protección contra body undefined)
  const { cuenta } = req.body || {};
  // Acepta 'contrasena' o 'contraseña' (con/sin ñ) usando optional chaining
  const contrasena = req.body?.contrasena ?? req.body?.["contraseña"];

  // Valida que vengan ambos campos requeridos
  if (!cuenta || !contrasena) {
    // Responde 400 Bad Request si faltan datos
    return res.status(400).json({
      error: "Faltan campos obligatorios: 'cuenta' y 'contrasena'.",
      ejemplo: { cuenta: "gina", contrasena: "1234" },
    });
  }

  // Busca un usuario que coincida exactamente con cuenta Y contraseña
  const match = users.find(
    (u) => u.cuenta === cuenta && u.contrasena === contrasena
  );

  // Si no encuentra coincidencia, credenciales incorrectas
  if (!match) {
    // Responde 401 Unauthorized
    return res.status(401).json({ error: "Credenciales inválidas." });
  }

  // Login exitoso: generar token de sesión
  const token = createSession(match.cuenta); // Usamos 'cuenta' como userId

  console.log(
    `[LOGIN] Usuario: ${match.cuenta} | Token: ${token} | Procede el login`
  );

  return res.status(200).json({
    mensaje: "Acceso permitido",
    usuario: {
      cuenta: match.cuenta,
      nombreCompleto: match.nombre
    },
    token: token,
  });
};

// Función controladora para manejar el logout
exports.logout = (req, res) => {
  const token = req.token; // El token viene del middleware verifyToken
  const userId = req.userId; // El userId viene del middleware verifyToken

  console.log(
    `[LOGOUT] Usuario en sesión: ${userId} | Token: ${token} | Procede el logout`
  );

  // Eliminar la sesión
  const deleted = deleteSession(token);

  if (deleted) {
    return res.status(200).json({
      mensaje: "Sesion cerrada correctamente",
    });
  } else {
    return res.status(404).json({
      error: "Sesion no encontrada",
    });
  }
};

