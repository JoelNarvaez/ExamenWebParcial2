// preguntas.js
module.exports = {
  javascript: [
    {
      id: 1,
      text: "¿Qué tipo de lenguaje es JavaScript?",
      options: ["Compilado", "Interpretado", "Ensamblador", "Binario"],
      correct: "Interpretado"
    },
    {
      id: 2,
      text: "¿Cuál es el tipo de dato de 'null' en JavaScript?",
      options: ["null", "undefined", "object", "string"],
      correct: "object"
    },
    {
      id: 3,
      text: "¿Qué palabra clave se usa para declarar una variable que no cambia?",
      options: ["var", "let", "const", "static"],
      correct: "const"
    },
    {
      id: 4,
      text: "¿Qué método convierte un JSON a un objeto de JavaScript?",
      options: ["JSON.convert()", "JSON.parse()", "JSON.toObject()", "JSON.stringify()"],
      correct: "JSON.parse()"
    },
    {
      id: 5,
      text: "¿Qué imprime console.log(typeof NaN)?",
      options: ["number", "NaN", "undefined", "object"],
      correct: "number"
    },
    {
      id: 6,
      text: "¿Cuál de las siguientes NO es una estructura de control en JavaScript?",
      options: ["if", "for", "foreach", "loop"],
      correct: "loop"
    },
    {
      id: 7,
      text: "¿Qué método se usa para agregar un elemento al final de un array?",
      options: ["push()", "pop()", "shift()", "concat()"],
      correct: "push()"
    },
    {
      id: 8,
      text: "¿Qué operador se usa para comparar tanto valor como tipo?",
      options: ["==", "!=", "===", "="],
      correct: "==="
    },
    {
      id: 9,
      text: "¿Qué devuelve una función que no tiene la palabra 'return'?",
      options: ["0", "null", "undefined", "false"],
      correct: "undefined"
    },
    {
      id: 10,
      text: "¿Cómo se llama el objeto global del navegador en JavaScript?",
      options: ["document", "window", "global", "browser"],
      correct: "window"
    },
    {
      id: 11,
      text: "¿Qué método permite ejecutar una función después de cierto tiempo?",
      options: ["setInterval()", "setTimeout()", "delay()", "wait()"],
      correct: "setTimeout()"
    },
    {
      id: 12,
      text: "¿Qué palabra clave se usa para manejar errores en JavaScript?",
      options: ["catch", "handle", "error", "except"],
      correct: "catch"
    },
    {
      id: 13,
      text: "¿Qué tipo de valor devuelve una función asíncrona?",
      options: ["Promise", "Callback", "Object", "String"],
      correct: "Promise"
    },
    {
      id: 14,
      text: "¿Cuál de las siguientes es una librería o framework basado en JavaScript?",
      options: ["Laravel", "Flask", "React", "Django"],
      correct: "React"
    },
    {
      id: 15,
      text: "¿Qué método elimina el último elemento de un arreglo?",
      options: ["remove()", "delete()", "pop()", "slice()"],
      correct: "pop()"
    },
    {
      id: 16,
      text: "¿Qué palabra clave se usa para declarar una clase en JavaScript?",
      options: ["object", "class", "constructor", "prototype"],
      correct: "class"
    }
  ],

  cpp: [
    {
      id: 1,
      text: "¿Qué tipo de lenguaje es C++?",
      options: ["Interpretado", "Compilado", "Script", "Markup"],
      correct: "Compilado"
    },
    {
      id: 2,
      text: "¿Cuál es el símbolo de inicio de un bloque de código en C++?",
      options: ["{", "(", "[", "<"],
      correct: "{"
    },
    {
      id: 3,
      text: "¿Qué extensión de archivo se usa para programas de C++?",
      options: [".cpp", ".c", ".hpp", ".class"],
      correct: ".cpp"
    },
    {
      id: 4,
      text: "¿Qué palabra clave se usa para definir una constante?",
      options: ["constant", "let", "const", "#define"],
      correct: "#define"
    },
    {
      id: 5,
      text: "¿Cuál de los siguientes no es un tipo de dato primitivo en C++?",
      options: ["int", "float", "string", "double"],
      correct: "string"
    },
    {
      id: 6,
      text: "¿Qué operador se usa para acceder a miembros de una clase a través de un puntero?",
      options: [".", "->", "::", "&"],
      correct: "->"
    },
    {
      id: 7,
      text: "¿Qué biblioteca estándar se necesita para usar cout?",
      options: ["<string>", "<iostream>", "<stdio.h>", "<stdlib.h>"],
      correct: "<iostream>"
    },
    {
      id: 8,
      text: "¿Qué hace el operador 'new' en C++?",
      options: ["Libera memoria", "Declara una variable", "Asigna memoria dinámicamente", "Crea un hilo"],
      correct: "Asigna memoria dinámicamente"
    },
    {
      id: 9,
      text: "¿Qué palabra clave se usa para heredar una clase?",
      options: ["inherits", "extends", "public", "super"],
      correct: "public"
    },
    {
      id: 10,
      text: "¿Qué función se ejecuta automáticamente al crear un objeto?",
      options: ["main()", "start()", "constructor", "init()"],
      correct: "constructor"
    },
    {
      id: 11,
      text: "¿Qué palabra clave destruye un objeto?",
      options: ["delete", "free", "destroy", "remove"],
      correct: "delete"
    },
    {
      id: 12,
      text: "¿Cuál es el operador lógico AND en C++?",
      options: ["&", "&&", "and", "||"],
      correct: "&&"
    },
    {
      id: 13,
      text: "¿Qué tipo de estructura permite almacenar varios valores del mismo tipo?",
      options: ["class", "struct", "array", "map"],
      correct: "array"
    },
    {
      id: 14,
      text: "¿Qué salida produce este código: cout << 2 + 3 * 4;?",
      options: ["20", "14", "24", "9"],
      correct: "14"
    },
    {
      id: 15,
      text: "¿Qué función es el punto de entrada de un programa en C++?",
      options: ["start()", "init()", "main()", "run()"],
      correct: "main()"
    },
    {
      id: 16,
      text: "¿Qué palabra clave se usa para definir una plantilla genérica?",
      options: ["template", "generic", "typename", "macro"],
      correct: "template"
    }
  ]
};
