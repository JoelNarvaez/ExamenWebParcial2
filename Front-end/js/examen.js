const API = "http://localhost:3000/api";
const btnCargar = document.getElementById("btnCargar");
const quizForm = document.getElementById("quizForm");
const listaPreguntas = document.getElementById("listaPreguntas");
const resultado = document.getElementById("resultado");
let preguntas = [];
const fecha = new Date().toLocaleDateString();

// Mostrar info del usuario
document.getElementById("nombreCategoria").textContent = localStorage.getItem("categoria");
document.getElementById("nombreUsuario").textContent += localStorage.getItem("nombreCompleto");
document.getElementById("cuentaUsuario").textContent += localStorage.getItem("userName");
document.getElementById("fechaAplicacion").textContent += fecha;

// Limpiar restos
localStorage.removeItem("categoriaAprobada");

function mezclar(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

// Solicitar examen
btnCargar.addEventListener("click", async () => {
  const token = localStorage.getItem("token");
  const categoria = localStorage.getItem("categoria");

  const check = await fetch(`${API}/checarExamen`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ categoria }),
  });

  const checkData = await check.json();
  //if (!checkData.ok) return alert(checkData.message);
  if (!checkData.ok) {
  Swal.fire({
    icon: "error",
    title: "Oh no...",
    text: checkData.message 
  });
  return; // detenemos la ejecución aquí
}

  const res = await fetch(`${API}/start`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ categoria }),
  });

  const data = await res.json();
  preguntas = data.questions;

  let num = 0;
  listaPreguntas.innerHTML = "";
  preguntas.forEach((q) => {
    const opciones = mezclar([...q.options]);
    btnCargar.remove();

    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <p><strong>${++num}.</strong> ${q.text}</p>
      ${opciones.map(opt => `
        <label>
          <input type="radio" name="q_${q.id}" value="${opt}">
          ${opt}
        </label><br>
      `).join("")}
    `;
    listaPreguntas.appendChild(div);
  });

  quizForm.style.display = "block";
  resultado.innerHTML = "";
});

// Enviar respuestas
quizForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const token = localStorage.getItem("token");
  const categoria = localStorage.getItem("categoria");

  const answers = preguntas.map((q) => {
    const selected = document.querySelector(`input[name="q_${q.id}"]:checked`);
    return { id: q.id, answer: selected ? selected.value : null };
  });

  const res = await fetch(`${API}/submit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ categoria, answers }),
  });

  const data = await res.json();

  resultado.innerHTML = `
    <h2>Resultado: ${data.score}/${data.total}</h2>
    ${data.details.map(d => `
      <div class="card">
        <p>${d.text}</p>
        <p>Tu respuesta: ${d.yourAnswer ?? "(sin responder)"}</p>
        <p>Correcta: ${d.correctAnswer}</p>
        <p class="${d.correct ? "ok" : "bad"}">
          ${d.correct ? "✔ Correcto" : "✘ Incorrecto"}
        </p>
      </div>
    `).join("")}
  `;

  quizForm.style.display = "none";

  if (data.aprobado) {
    //alert(`¡Felicidades! Aprobaste con ${data.score}/${data.total}`);
    Swal.fire({
      title: "¡Felicidades!",
      text: `Aprobaste con ${data.score}/${data.total}`,
      icon: "success"
    });

    // Guardar categoria aprobada SOLO aquí
    localStorage.setItem("categoriaAprobada", categoria);

    resultado.innerHTML += `
      <div style="text-align:center; margin-top:15px;">
        <button id="btnDescargarCert">Descargar Certificado</button>
        <button id="btnRegresarInicioCert">Volver al inicio</button>
      </div>
    `;

    document.getElementById("btnDescargarCert").addEventListener("click", descargarCertificado);

    document.getElementById("btnRegresarInicioCert").addEventListener("click", () => {
      localStorage.removeItem("categoriaAprobada");
      localStorage.removeItem("categoria");
      window.location.href = "index.html";
    });

  } else {
    //alert(`No aprobaste. Obtuviste ${data.score}/${data.total}`);
    Swal.fire({
      title: "No aprobaste",
      text: `Obtuviste ${data.score}/${data.total}`,
      icon: "error",
    });

    // Borrar categoría si falló
    localStorage.removeItem("categoria");

    resultado.innerHTML += `
      <div style="text-align:center; margin-top:15px;">
        <button id="btnRegresarInicio">Volver al inicio</button>
      </div>
    `;

    document.getElementById("btnRegresarInicio").addEventListener("click", () => {
      window.location.href = "index.html";
    });
  }
});

// Descargar PDF
async function descargarCertificado() {
  const token = localStorage.getItem("token");

  const body = {
    nombreCompleto: localStorage.getItem("nombreCompleto"),
    certificacion: localStorage.getItem("categoriaAprobada"),
    fecha: fecha,
    ciudad: "Aguascalientes, México"
  };

  const res = await fetch(`${API}/pdf`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const data = await res.json();
    //alert(data.message);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: data.message 
    });
    return;
  }

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `certificado_${body.nombreCompleto}.pdf`;
  a.click();
}
