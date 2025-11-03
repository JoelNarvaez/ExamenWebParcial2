
const PREGUNTAS = require("../data/preguntas");
const {
  obtenerUsuario,
  getOrCreateCert,
} = require("../middleware/auth.middleware");

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