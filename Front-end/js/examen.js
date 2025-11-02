const API = "http://localhost:3000/api";
const btnCargar = document.getElementById("btnCargar");
const quizForm = document.getElementById("quizForm");
const listaPreguntas = document.getElementById("listaPreguntas");
const resultado = document.getElementById("resultado");
let preguntas = [];
const fecha = new Date().toLocaleDateString();


// Mostrar nombre categoria
document.getElementById("nombreCategoria").textContent = localStorage.getItem("categoria");
document.getElementById("nombreUsuario").textContent += localStorage.getItem("nombreCompleto");
document.getElementById("cuentaUsuario").textContent += localStorage.getItem("userName");
document.getElementById("fechaAplicacion").textContent += fecha;

// Funcion para mezclar opciones
function mezclar(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

// Iniciar examen 
btnCargar.addEventListener("click", async () => {
  const token = localStorage.getItem("token");
  const categoria = localStorage.getItem("categoria");

  // Validar acceso
  const check = await fetch(`${API}/checarExamen`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ categoria }),
  });

  const checkData = await check.json();
  if (!checkData.ok) return alert(checkData.message);

  // Pedir preguntas 
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
  let enumeracion = 0;

  listaPreguntas.innerHTML = "";
  preguntas.forEach((q) => {
    const opciones = mezclar([...q.options]); 
    btnCargar.remove();
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <p><strong>${enumeracion += 1}.</strong> ${q.text}</p>
      ${opciones.map(opt => `
        <label>
          <input type="radio" name="q_${q.id}" value="${opt}"> ${opt}
        </label><br>
      `).join("")}
    `;
    listaPreguntas.appendChild(div);
  });

  quizForm.style.display = "block";
  resultado.innerHTML = "";
});

// Enviar examen
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

  // Bloquear otro intento
  localStorage.removeItem("categoria");
});
