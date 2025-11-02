// --- Manejo del modal de login y logout ---
document.addEventListener('DOMContentLoaded', function() {
  // Verificar si hay sesión activa al cargar la página
  checkSession();

  // Abrir/cerrar modal de login
  document.getElementById('loginBtn').onclick = () => {
    document.getElementById('loginModal').style.display = 'block';
  };
  
  document.getElementById('closeModal').onclick = () => {
    document.getElementById('loginModal').style.display = 'none';
  };
  
  window.onclick = (e) => {
    if (e.target === document.getElementById('loginModal')) {
      document.getElementById('loginModal').style.display = 'none';
    }
  };

  // Manejar logout
  document.getElementById('logoutBtn').onclick = logout;
});

// Capturamos el formulario
const form = document.getElementById("formLogin");

// Escuchamos el evento "submit"
form.addEventListener("submit", async (e) => {
  e.preventDefault(); // evita que la página se recargue

  // Obtener los valores escritos por el usuario
  const login = document.getElementById("login").value;
  const contrasena = document.getElementById("password").value;

  // Enviar los datos al servidor usando fetch + async/await
  try {
    const res = await fetch("http://localhost:3000/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        cuenta: login, // nombre del campo esperado el backend
        contrasena: contrasena
      })
    });

    // Intentamos parsear el JSON (puede fallar si el servidor responde vacío)
    let data;
    try {
      data = await res.json();
    } catch (parseErr) {
      console.warn("Respuesta no JSON del servidor", parseErr);
      data = {};
    }

    // Revisar la respuesta
    if (res.ok) {
      const cuenta = data.usuario?.cuenta;
      const token = data.token;
      
      localStorage.setItem('token', token);
      localStorage.setItem('userName', cuenta);
      
      alert("Acceso permitido: " + cuenta);
      updateUILoggedIn(cuenta);
      
      document.getElementById('loginModal').style.display = 'none';
      document.getElementById("login").value = "";
      document.getElementById("password").value = "";
    } else {
      alert(data?.error ?? `Error ${res.status}`);
      document.getElementById("login").value = "";
      document.getElementById("password").value = "";
    }

  } catch (err) {
    console.error("Error al conectar con el servidor:", err);
    alert("Error de conexión con el servidor");
  }
});

// --- Función para verificar si hay sesión activa ---
function checkSession() {
  const userName = localStorage.getItem('userName');
  if (userName) {
    updateUILoggedIn(userName);
  } else {
    updateUILoggedOut();
  }
}

function checkPago() {
  const userName = localStorage.getItem('userName');
  if (userName) {
    return true;
  } else {
    return false;
  }
}

// --- Actualizar UI cuando hay sesión ---
function updateUILoggedIn(userName) {
  document.getElementById('userName').textContent = userName;
  document.getElementById('loginBtn').style.display = 'none';
  document.getElementById('logoutBtn').style.display = 'inline-block';
}

// --- Actualizar UI cuando NO hay sesión ---
function updateUILoggedOut() {
  document.getElementById('userName').textContent = '';
  document.getElementById('loginBtn').style.display = 'inline-block';
  document.getElementById('logoutBtn').style.display = 'none';
}

// --- Función para hacer logout ---
async function logout() {
  try {
    const res = await fetch("http://localhost:3000/api/logout", { 
      method: "POST",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    if (res.ok) {
      alert('Sesión cerrada correctamente');
    } else {
      const data = await res.json();
      alert(data?.error ?? `Error al cerrar sesión`);
    }
  } catch (err) {
    console.error("Error al conectar con el servidor:", err);
    alert("Error de conexión");
  } finally {
    // Siempre limpiar localStorage y actualizar UI, incluso si hay error
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    updateUILoggedOut();
  }
}

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



