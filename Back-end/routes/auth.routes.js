const express = require("express");
const { login, logout, getProfile} = require("../controllers/auth.controller");
const { verifyToken } = require("../middleware/auth.middleware");
const { startCertificacion, payment, checarExamen, submit} = require("../controllers/auth.controller");
const { contacto } = require("../controllers/auth.controller");

const router = express.Router();

// Ruta pública: POST /api/login
router.post("/login", login);
router.post("/contacto", contacto);

// Rutas protegidas (requieren token)
// POST /api/logout - Cerrar sesión
router.post("/logout", verifyToken, logout);

router.post("/payment",verifyToken, payment);

router.post("/checarExamen",verifyToken, checarExamen);

router.post("/start", verifyToken, startCertificacion);

router.post("/submit", verifyToken, submit);

// router.post("/pdf", verifyToken, pdf);

module.exports = router;
