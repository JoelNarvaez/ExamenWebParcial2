const PDFDocument = require("pdfkit");
const path = require("path");
const {
  obtenerUsuario,
  getOrCreateCert,
} = require("../middleware/auth.middleware");

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