const express = require("express");
const crypto = require("crypto");
const emailjs = require("emailjs-com");
const app = express();

// Configuración para el servidor
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simulando una base de datos en memoria para almacenar el token
let resetTokens = {};

// Paso 1: Generar un token único
function generateToken() {
  return crypto.randomBytes(20).toString('hex'); // Genera un token aleatorio de 20 bytes
}

// Paso 2: Enviar el correo con el reset link
function sendResetLink(email, token) {
  const templateParams = {
    email: email,
    resetLink: `https://tudominio.com/reset-password?token=${token}`, // El reset link
  };

  emailjs.send(
    "YOUR_SERVICE_ID",  // ID de tu servicio en EmailJS
    "YOUR_TEMPLATE_ID",  // ID de tu template en EmailJS
    templateParams,
    "YOUR_PUBLIC_KEY"   // Tu public key de EmailJS
  ).then(response => {
    console.log('Correo enviado: ', response);
  }).catch(err => {
    console.error('Error al enviar el correo: ', err);
  });
}


app.post("/request-reset", (req, res) => {
  const { email } = req.body;
  const token = generateToken();
  resetTokens[token] = email;


  sendResetLink(email, token);


  res.status(200).send("Se ha enviado el enlace de recuperación a tu correo.");
});


app.post("/reset-password", (req, res) => {
  const { token, newPassword } = req.body;

  // Paso 6: Verificar el token
  const email = resetTokens[token];
  if (!email) {
    return res.status(400).send("Token inválido o expirado.");
  }


  console.log(`Actualizando contraseña para ${email} a ${newPassword}`);

  delete resetTokens[token];


  res.status(200).send("Contraseña actualizada correctamente.");
});


app.listen(3000, () => {
  console.log("Servidor corriendo en el puerto 3000");
});
