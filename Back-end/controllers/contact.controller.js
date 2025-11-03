
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