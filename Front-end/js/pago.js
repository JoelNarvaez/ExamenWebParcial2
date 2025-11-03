// --- Manejo del modal de pago ---
document.addEventListener('DOMContentLoaded', function() {

  const btnPagoJS = document.getElementById('btn-pago-js');
  const pagoModal = document.getElementById('pagoModal');
  const closePagoModal = document.getElementById('closePagoModal');
  const formPago = document.getElementById('formPago');

  // Abrir el modal de pago al hacer clic en "Pagar"
  btnPagoJS.onclick = () => {
    if(checkPago()){
      const categoria = btnPagoJS.value; 
      localStorage.setItem("categoria", categoria);
      pagoModal.style.display = 'block';
    }
    else{
      alert("Inicia sesion");
    }
  };

  // Cerrar modal con la X
  closePagoModal.onclick = () => {
    pagoModal.style.display = 'none';
  };

  // Cerrar modal si se hace clic fuera del contenido
  window.onclick = (e) => {
    if (e.target === pagoModal) {
      pagoModal.style.display = 'none';
    }
  };

  // Enviar formulario de pago local
  formPago.addEventListener('submit', (e) => {
    e.preventDefault();
    pagoModal.style.display = 'none';
    formPago.reset();
  });
});


// --- Enviar pago al servidor ---
const pagarCertificacion = document.getElementById("btn-confirmar-pago");

pagarCertificacion.addEventListener("click", async () => {
  const token = localStorage.getItem("token");
  const categoria = localStorage.getItem("categoria");

  try {
    const res = await fetch("http://localhost:3000/api/payment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ categoria })
    });

    const data = await res.json();

    if (!res.ok) {
      return alert(data.message ?? "Error al pagar");
    }

    alert(`Gracias por tu pago. ${data.message}`);
    localStorage.removeItem("categoria");

  } catch (err) {
    console.error("Error de conexión:", err);
    alert("Error de conexión con el servidor");
  }
});

const btnExamenJS = document.getElementById("btn-examen-js");

btnExamenJS.addEventListener("click", async () => {
  const token = localStorage.getItem("token");
  const categoria = btnExamenJS.value;

  if (!token) return alert("Inicia sesión primero");

  const res = await fetch("http://localhost:3000/api/checarExamen", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ categoria })
  });

  const data = await res.json();

  if (!data.ok) {
    alert(data.message);
    return;
  }

  localStorage.setItem("categoria", categoria);

  window.location.href = "examen.html";
});
