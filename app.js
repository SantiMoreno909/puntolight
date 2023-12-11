const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 5000;

// Configuración de multer para manejar la carga de archivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Directorio donde se almacenarán las imágenes
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage: storage });

// Middleware para parsear el cuerpo de la solicitud en formato JSON
app.use(express.json());

// Definimos dónde buscamos archivos js, css e imágenes
app.use(express.static(`${__dirname}/public`));

// Definimos la ruta
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.get("/testimonios", (req, res) => {
  res.sendFile(__dirname + "/views/testimonios.html");
});

app.get("/gracias", (req, res) => {
  res.sendFile(__dirname + "/views/gracias.html");
});

// Ruta para manejar la carga de archivos e información del formulario
app.post("/testimonios", upload.single("imagen"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("No se ha seleccionado ninguna imagen.");
  }

  // Obtener la información del formulario
  const nombre = req.body.nombre;
  const mensaje = req.body.mensaje;
  const fecha = obtenerFechaActual(); // Función para obtener la fecha actual en formato DD/MM/AAAA
  const imagenPath = req.file.path;

  // Crear un objeto con la información
  const testimonio = {
    nombre: nombre,
    mensaje: mensaje,
    fecha: fecha,
    imagenPath: imagenPath,
  };

  // Guardar la información en un archivo JSON
  guardarTestimonio(testimonio);

  // Redirigir al usuario a la página de agradecimiento
  res.redirect("/gracias");
});

app.listen(PORT, () => console.log("Server funcionando en puerto " + PORT));

// Función para obtener la fecha actual en formato DD/MM/AAAA
function obtenerFechaActual() {
  const ahora = new Date();
  const dia = ahora.getDate().toString().padStart(2, "0");
  const mes = (ahora.getMonth() + 1).toString().padStart(2, "0"); // Sumamos 1 porque los meses van de 0 a 11
  const anio = ahora.getFullYear();
  return `${dia}/${mes}/${anio}`;
}

// Función para guardar la información del testimonio en un archivo JSON
function guardarTestimonio(testimonio) {
  const testimoniosPath = "testimonios.json";

  // Leer el archivo JSON existente o crear uno vacío si no existe
  let testimonios = [];
  if (fs.existsSync(testimoniosPath)) {
    const contenido = fs.readFileSync(testimoniosPath, "utf-8");
    testimonios = JSON.parse(contenido);
  }

  // Agregar el nuevo testimonio al arreglo
  testimonios.push(testimonio);

  // Guardar el arreglo actualizado en el archivo JSON
  fs.writeFileSync(
    testimoniosPath,
    JSON.stringify(testimonios, null, 2),
    "utf-8"
  );
}
