const express = require("express");
const { login, logout} = require("../controllers/auth.controller");
const { verifyToken} = require("../middleware/auth.middleware");
const { startCertificacion, payment, checarExamen, submit} = require("../controllers/exam.controller");
const { contacto } = require("../controllers/contact.controller");
const { generarCertificado } = require("../controllers/cert.controller");

const router = express.Router();

// Ruta pública: POST /api/login
router.post("/login", login);
router.post("/contacto", contacto);

// Rutas protegidas (requieren token)
router.post("/logout", verifyToken, logout);

router.post("/payment",verifyToken, payment);

router.post("/checarExamen",verifyToken, checarExamen);

router.post("/start", verifyToken, startCertificacion);

router.post("/submit", verifyToken, submit);

router.post("/pdf", verifyToken, generarCertificado);

module.exports = router;
