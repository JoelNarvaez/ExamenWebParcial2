const express = require("express");
const { login, logout, getProfile} = require("../controllers/auth.controller");
const { verifyToken, verificarEstado } = require("../middleware/auth.middleware");
const { startCertificacion, payment } = require("../controllers/auth.controller");

const router = express.Router();

// Ruta pública: POST /api/login
router.post("/login", login);

// Rutas protegidas (requieren token)
// POST /api/logout - Cerrar sesión
router.post("/logout", verifyToken, logout);

// GET /api/profile - Obtener perfil del usuario autenticado
//router.get("/profile", verifyToken, getProfile);

router.post("/payment",verifyToken, payment);

router.post("/start", verifyToken, verificarEstado, startCertificacion);

// router.post("/submit", verifyToken, submit);

// router.post("/pdf", verifyToken, pdf);

module.exports = router;
