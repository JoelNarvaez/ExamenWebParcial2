// Importa el array de usuarios desde el archivo JSON (se carga una sola vez al iniciar)
const users = require("../data/users.json");
const PREGUNTAS = require ("../data/preguntas")
const { createSession, deleteSession, obtenerUsuario} = require("../middleware/auth.middleware");
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
      ejemplo: { cuenta: "gina", contrasena: "1234" }
    });
  }

  // Busca un usuario que coincida exactamente con cuenta Y contraseña
  const match = users.find(u => u.cuenta === cuenta && u.contrasena === contrasena);

  // Si no encuentra coincidencia, credenciales incorrectas
  if (!match) {
    // Responde 401 Unauthorized
    return res.status(401).json({ error: "Credenciales inválidas." });
  }

  // Login exitoso: generar token de sesión
  const token = createSession(match.cuenta); // Usamos 'cuenta' como userId
  
  console.log(`[LOGIN] Usuario: ${match.cuenta} | Token: ${token} | Procede el login`);

  return res.status(200).json({
    mensaje: "Acceso permitido",
    usuario: { cuenta: match.cuenta }, // Devuelve solo la cuenta, NO la contraseña
    token: token // Token de sesión para usar en peticiones protegidas
  });
};

// Función controladora para manejar el logout
exports.logout = (req, res) => {
  const token = req.token; // El token viene del middleware verifyToken
  const userId = req.userId; // El userId viene del middleware verifyToken

  console.log(`[LOGOUT] Usuario en sesión: ${userId} | Token: ${token} | Procede el logout`);

  // Eliminar la sesión
  const deleted = deleteSession(token);

  if (deleted) {
    return res.status(200).json({ 
      mensaje: "Sesión cerrada correctamente" 
    });
  } else {
    return res.status(404).json({ 
      error: "Sesión no encontrada" 
    });
  }
};

exports.startCertificacion = (req, res) => {
  const categoria = req.categoria;

  // Validar que exista la categoría
  if (!categoria || !PREGUNTAS[categoria]) {
    return res.status(400).json({
      message: "Categoría inválida o no especificada.",
    });
  }

  // Obtener las preguntas de la categoria
  const preguntasCategoria = PREGUNTAS[categoria];

  // Mezclar
  const preguntasAleatorias = preguntasCategoria
    .sort(() => Math.random() - 0.5) 
    .slice(0, 8); // nomas 8

  // Formato
  const preguntas = preguntasAleatorias.map(({ id, text, options }) => ({
    id, text, options
  }));

  examCache.set(req.userId, preguntas.map(p => p.id));

  // Enviar respuesta
  res.status(200).json({
    message: "Inicio de la certificación",
    questions: preguntas
  });

  // A ver si jala
  console.log(
    `Acceso a la certificación ${req.userId} /api/questions/start certificacion: ${categoria}`
  );
  console.log(preguntas)
};


exports.submit = (req, res) => {
  const { categoria, answers } = req.body;

  if (!categoria || !PREGUNTAS[categoria]) {
    return res.status(400).json({ message: "Categoría inválida" });
  }

  const askedIds = examCache.get(req.userId);
  if (!askedIds) {
    return res.status(400).json({ message: "No se inició el examen o expiró." });
  }

  const userAnswers = Array.isArray(answers) ? answers : [];

  const questions = PREGUNTAS[categoria].filter(q => askedIds.includes(q.id));

  let score = 0;
  const details = [];

  for (const q of questions) {
    const user = userAnswers.find(a => a.id === q.id);
    const isCorrect = user?.answer === q.correct;

    if (isCorrect) score++;

    details.push({
      id: q.id,
      text: q.text,
      yourAnswer: user?.answer ?? null,
      correctAnswer: q.correct,
      correct: isCorrect
    });
  }

  examCache.delete(req.userId); // limpiar la sesión del examen

  const user = obtenerUsuario(req.userId);
  user.certificaciones[categoria].examenRealizado = true;

  res.status(200).json({
    message: "Respuestas evaluadas",
    categoria,
    score,
    total: questions.length,
    details
  });
};

exports.payment = (req, res) => {
  const nombre = req.userId;
  const categoria  = req.categoria;
  const user = obtenerUsuario(nombre);
  console.log(categoria);

  if (!user || !user.certificaciones[categoria]) {
    return res.status(400).json({ message: "Categoría inválida" });
  }

  if (user.certificaciones[categoria].pagado){
     return res.status(400).json({ message: "No puedes pagar 2 veces el certificado" });
  }

  user.certificaciones[categoria].pagado = true;

  res.status(200).json({
    message: `Pago registrado para ${nombre} en ${categoria}`,
    user
  });
}

exports.checarExamen = (req, res) => {
  const { categoria } = req.body;
  const user = obtenerUsuario(req.userId);

  const cert = user.certificaciones[categoria];

  if (!cert) return res.status(400).json({ ok: false, message: "Categoría inválida" });
  if (!cert.pagado) return res.status(403).json({ ok: false, message: "Primero paga" });
  if (cert.examenRealizado) return res.status(403).json({ ok: false, message: "Ya hiciste este examen" });

  return res.status(200).json({ ok: true });
}




// exports.registrarExamen = (req, res) => {
//   const nombre = req.userId;
//   const categoria = req.categoria;
//   const user = obtenerUsuario(nombre);

//   if (!user.certificaciones[categoria]) {
//     return res.status(400).json({ message: "Categoría inválida" });
//   }

//   if (!user.certificaciones[categoria].pagado) {
//     return res.status(403).json({ message: "Debe pagar antes de hacer el examen." });
//   }

//   // Marcar como examen realizado
//   user.certificaciones[categoria].examenRealizado = true;

//   res.status(200).json({
//     message: `Examen registrado para ${nombre} en ${categoria}`,
//     user
//   });
// }

// Función controladora para obtener el perfil del usuario autenticado
// exports.getProfile = (req, res) => {
//   const userId = req.userId; // El userId viene del middleware verifyToken

//   // Buscar el usuario en la base de datos
//   const user = users.find(u => u.cuenta === userId);

//   if (!user) {
//     return res.status(404).json({ 
//       error: "Usuario no encontrado" 
//     });
//   }

//   // Devolver información del usuario (sin contraseña)
//   return res.status(200).json({
//     usuario: { 
//       cuenta: user.cuenta 
//     }
//   });
// };
