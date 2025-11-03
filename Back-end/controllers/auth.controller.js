// Importa el array de usuarios desde el archivo JSON (se carga una sola vez al iniciar)
const users = require("../data/users.json");
const PDFDocument = require("pdfkit");
const path = require("path");
const PREGUNTAS = require("../data/preguntas");
const {
  createSession,
  deleteSession,
  obtenerUsuario,
  getOrCreateCert,
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

exports.startCertificacion = (req, res) => {
  const categoria = req.categoria;

  // Validar que exista la categoria
  if (!categoria || !PREGUNTAS[categoria]) {
    return res.status(400).json({
      message: "Categoria invalida o no especificada.",
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
    id,
    text,
    options,
  }));

  examCache.set(
    req.userId,
    preguntas.map((p) => p.id)
  );

  // Enviar respuesta
  res.status(200).json({
    message: "Inicio de la certificacion",
    questions: preguntas,
  });

  // A ver si jala
  console.log(
    `Acceso a la certificacion ${req.userId} /api/questions/start certificacion: ${categoria}`
  );
  console.log(preguntas);
};

exports.submit = (req, res) => {
  const { categoria, answers } = req.body;

  if (!categoria || !PREGUNTAS[categoria]) {
    return res.status(400).json({ message: "Categoría inválida" });
  }

  const askedIds = examCache.get(req.userId);
  if (!askedIds) {
    return res
      .status(400)
      .json({ message: "No se inicio el examen o expiro." });
  }

  const userAnswers = Array.isArray(answers) ? answers : [];
  const questions = PREGUNTAS[categoria].filter((q) => askedIds.includes(q.id));

  let score = 0;
  const details = [];

  for (const q of questions) {
    const userAnswer = userAnswers.find((a) => a.id === q.id);
    const isCorrect = userAnswer?.answer === q.correct;

    if (isCorrect) score++;

    details.push({
      id: q.id,
      text: q.text,
      yourAnswer: userAnswer?.answer ?? null,
      correctAnswer: q.correct,
      correct: isCorrect,
    });
  }

  examCache.delete(req.userId); // limpiar la sesion

  const user = obtenerUsuario(req.userId);
  const cert = getOrCreateCert(user, categoria);

  cert.examenRealizado = true;
  cert.score = score;
  cert.aprobado = score >= 6; 

  return res.status(200).json({
    message: "Respuestas evaluadas correctamente",
    categoria,
    score,
    total: questions.length,
    aprobado: cert.aprobado,
    details,
  });
};

exports.payment = (req, res) => {
  const userId = req.userId;
  const categoria = req.categoria;

  const user = obtenerUsuario(userId);
  const cert = getOrCreateCert(user, categoria);

  if (cert.pagado) {
    return res
      .status(400)
      .json({ message: "No puedes pagar dos veces este certificado" });
  }

  cert.pagado = true;

  res.status(200).json({
    message: `Pago registrado para ${userId} en la certificación ${categoria}`,
    user,
  });
};

exports.checarExamen = (req, res) => {
  const { categoria } = req.body;
  const user = obtenerUsuario(req.userId);

  // Validar categoría real
  if (!categoria || !PREGUNTAS[categoria]) {
    return res.status(400).json({ ok: false, message: "Categoría inválida" });
  }

  const cert = getOrCreateCert(user, categoria);

  if (!cert.pagado)
    return res.status(403).json({ ok: false, message: "Primero paga" });

  if (cert.examenRealizado)
    return res
      .status(403)
      .json({ ok: false, message: "Ya hiciste este examen" });

  return res.status(200).json({ ok: true });
};

exports.generarCertificado = (req, res) => {
  const userId = req.userId; 
  const categoria = req.body.certificacion;

  const user = obtenerUsuario(userId);
  const cert = getOrCreateCert(user, categoria);

  if (!cert.examenRealizado) {
    return res.status(403).json({
      ok: false,
      message: "No has completado el examen.",
    });
  }

  if (!cert.aprobado) {
    return res.status(403).json({
      ok: false,
      message: "No aprobaste, no puedes generar certificado.",
    });
  }
  const { nombreCompleto, certificacion, fecha, ciudad } = req.body;

  const empresa = "Digital IDEA";
  const instructor = "Ing. Joel Narvaez MArtinez";
  const ceo = "Dra. Ana Lorena Rosales";

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=certificado_${nombreCompleto.replace(
      /\s+/g,
      "_"
    )}.pdf`
  );

  const doc = new PDFDocument({ size: "LETTER", layout: "landscape" });
  doc.pipe(res);

  doc.rect(0, 0, doc.page.width, doc.page.height).fill("#ffffff");

  doc.image(path.join(__dirname, "../Certificacion/logo.png"), 50, 40, {
    width: 140,
  });

  doc
    .fontSize(28)
    .font("Helvetica-Bold")
    .fillColor("#000")
    .text("CERTIFICADO DE COMPETENCIA", 0, 80, { align: "center" });

  doc
    .fontSize(14)
    .font("Helvetica")
    .text(`Por haber aprobado el examen oficial de certificación`, {
      align: "center",
    });

  doc.moveDown(1.2);
  doc
    .fontSize(40)
    .fillColor("#5C2CDF")
    .font("Helvetica-Bold")
    .text(nombreCompleto, { align: "center" });

  doc.moveDown(0.5);
  doc.fontSize(22).fillColor("#000").text(certificacion, { align: "center" });

  doc.moveDown(1);
  doc.fontSize(14).text(`Fecha: ${fecha}`, { align: "center" });

  doc.text(`Ciudad: ${ciudad}`, { align: "center" });
  doc.text(`Empresa certificadora: ${empresa}`, { align: "center" });

  const yBase = 350;

  doc.image(
    path.join(__dirname, "../Certificacion/formaInstructor.png"),
    160,
    yBase,
    { width: 150 }
  );
  doc.text(instructor, 150, yBase + 80, { width: 200, align: "center" });

  doc.image(path.join(__dirname, "../Certificacion/firmaCEO.png"), 520, yBase, {
    width: 150,
  });
  doc.text(ceo, 510, yBase + 80, { width: 200, align: "center" });

  doc.end();
};

exports.generarCertificado = (req, res) => {
  const userId = req.userId;
  const categoria = req.body.certificacion;

  const user = obtenerUsuario(userId);
  const cert = getOrCreateCert(user, categoria);

  if (!cert.examenRealizado) {
    return res.status(403).json({
      ok: false,
      message: "Debes completar el examen antes de generar tu certificado.",
    });
  }

  if (!cert.aprobado) {
    return res.status(403).json({
      ok: false,
      message: "No aprobaste el examen. No puedes generar un certificado.",
    });
  }

  const { nombreCompleto, certificacion, fecha, ciudad } = req.body;

  const empresa = "Digital IDEA Academy";
  const instructor = "Ing. Joel Narváez Martínez";
  const ceo = "Dra. Ana Lorena Rosales";

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=certificado_${nombreCompleto.replace(
      " ",
      "_"
    )}.pdf`
  );

  const doc = new PDFDocument({size: "A4", layout: "landscape", margins: { top: 0, left: 0, right: 0, bottom: 0 },});

  doc.pipe(res);

  doc.rect(0, 0, doc.page.width, doc.page.height).fill("#ffffff");

  const width = doc.page.width;

  doc.image(path.join(__dirname, "../Certificacion/logo.png"), 30, 15, {
    width: 130,
  });

  doc.image(
    path.join(__dirname, "../Certificacion/sello.png"),
    width / 2 - 50,
    40,
    { width: 100 }
  );

  doc.fillColor("#000").font("Helvetica-Bold").fontSize(26);
  doc.text("CERTIFICADO DE COMPETENCIA", 0, 140, { align: "center" });

  doc.fontSize(13).font("Helvetica").fill("#444");
  doc.text(
    "Por haber demostrado las competencias necesarias y aprobar el examen oficial de certificación como:",
    0,
    175,
    { align: "center" }
  );

  doc.fontSize(26).font("Helvetica-Bold").fill("#000");
  doc.text(`Desarrollador Certificado en ${certificacion}`, 0, 205, {
    align: "center",
  });

  doc.fontSize(14).font("Helvetica").fill("#444");
  doc.text("Otorgado a:", 0, 250, { align: "center" });

  doc.fontSize(35).font("Helvetica-Bold").fillColor("#6A1B9A");
  doc.text(nombreCompleto, 0, 280, { align: "center" });


  doc.fontSize(14).font("Helvetica").fill("#444");
  doc.text(`Fecha de evaluación: ${fecha}`, 0, 330, { align: "center" });
  doc.text(`Ciudad: ${ciudad}`, 0, 350, { align: "center" });
  doc.text(`Empresa: ${empresa}`, 0, 370, { align: "center" });

  const y = 410;

  doc.image(
    path.join(__dirname, "../Certificacion/firmaInstructor.png"),
    width * 0.25 - 60,
    y,
    { width: 120 }
  );

  doc
    .fontSize(14)
    .font("Helvetica-Bold")
    .fill("#000")
    .text(instructor, width * 0.25 - 100, y + 80, {
      width: 200,
      align: "center",
    });

  doc
    .fontSize(12)
    .font("Helvetica")
    .fill("#444")
    .text("Instructor Certificado", width * 0.25 - 100, y + 100, {
      width: 200,
      align: "center",
    });

  doc.image(
    path.join(__dirname, "../Certificacion/firmaCEO.png"),
    width * 0.75 - 60,
    y,
    { width: 120 }
  );

  doc
    .fontSize(14)
    .font("Helvetica-Bold")
    .fill("#000")
    .text(ceo, width * 0.75 - 100, y + 80, { width: 200, align: "center" });

  doc
    .fontSize(12)
    .font("Helvetica")
    .fill("#444")
    .text("Directora General (CEO)", width * 0.75 - 100, y + 100, {
      width: 200,
      align: "center",
    });

  doc
  .rect(0, doc.page.height - 20, doc.page.width, 20)
  .fillColor("#4A148C")  // Morado tech profesional
  .fill();

  doc.end();
};

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

// Función para imprimir la información de Contacto enviada por el Front
// Declaración del arreglo de objetos
const contactoArreglo = [];
exports.contacto = (req, res) => {
  console.log("POST /api/contacto recibido");
  console.log("req.body:", req.body);

  // Desestructuración
  const { nombre, apellido, email, mensaje } = req.body;

  // Se crea el objeto
  const nuevoMensaje = {
    nombre,
    apellido,
    email,
    mensaje,
  };

  // Se agrega al arreglo
  contactoArreglo.push(nuevoMensaje);

  // Se imprime en consola
  console.log("Informacion del formulario de contacto recibida del front:");
  console.log(contactoArreglo);

  // Respuesta de éxito al front
  res.status(200).json({ mensaje: "Mensaje recibido correctamente" });
};
