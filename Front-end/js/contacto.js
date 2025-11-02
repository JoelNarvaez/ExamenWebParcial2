document.getElementById("contacto-formulario").addEventListener("submit", async (e) => {
  e.preventDefault(); // evita que se recargue la página

  const datos = {
    nombre: document.getElementById("nombre").value,
    apellido: document.getElementById("apellido").value,
    email: document.getElementById("email").value,
    mensaje: document.getElementById("mensaje").value
  };

  try {
    const respuesta = await fetch("http://localhost:3000/api/contacto", {   
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos)
    });

   
    
    if (respuesta.ok) {
      alert("Mensaje enviado");
      document.getElementById("contacto-formulario").reset();
    } else {
      alert("Error al enviar el mensaje");
    }
  } catch (err) {
    console.error("Error:", err);
  }
});
