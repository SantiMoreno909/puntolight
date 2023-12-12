const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const nodemailer = require("nodemailer");

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
  const fecha = obtenerFechaActual();
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

  // Enviar correo electrónico con la información y la imagen adjunta
  enviarCorreo(nombre, mensaje, fecha, imagenPath);

  // Redirigir al usuario a la página de agradecimiento
  res.redirect("/gracias");
});

app.listen(PORT, () => console.log("Server funcionando en puerto " + PORT));

// Función para obtener la fecha actual en formato DD/MM/AAAA
function obtenerFechaActual() {
  const ahora = new Date();
  const dia = ahora.getDate().toString().padStart(2, "0");
  const mes = (ahora.getMonth() + 1).toString().padStart(2, "0");
  const anio = ahora.getFullYear();
  return `${dia}/${mes}/${anio}`;
}

// Función para guardar la información del testimonio en un archivo JSON
function guardarTestimonio(testimonio) {
  const testimoniosPath = "testimonios.json";

  let testimonios = [];
  if (fs.existsSync(testimoniosPath)) {
    const contenido = fs.readFileSync(testimoniosPath, "utf-8");
    testimonios = JSON.parse(contenido);
  }

  testimonios.push(testimonio);

  fs.writeFileSync(
    testimoniosPath,
    JSON.stringify(testimonios, null, 2),
    "utf-8"
  );
}

// Función para enviar correo electrónico con la información y la imagen adjunta
function enviarCorreo(nombre, mensaje, fecha, imagenPath) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "santimoreno909@gmail.com", // Coloca tu dirección de correo electrónico
      pass: "41264200Sm", // Coloca tu contraseña
    },
  });

  const mailOptions = {
    from: "santimoreno909@gmail.com", // Coloca tu dirección de correo electrónico
    to: "santiagom.contact@gmail.com", // Coloca la dirección de correo del destinatario
    subject: "Nuevo testimonio recibido",
    html: `<p><strong>Nombre:</strong> ${nombre}</p>
           <p><strong>Mensaje:</strong> ${mensaje}</p>
           <p><strong>Fecha:</strong> ${fecha}</p>`,
    attachments: [
      {
        filename: "imagen_adjunta.jpg", // Puedes cambiar el nombre del archivo adjunto
        path: imagenPath,
      },
    ],
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.error(error);
    } else {
      console.log("Correo enviado: " + info.response);
    }
  });
}
