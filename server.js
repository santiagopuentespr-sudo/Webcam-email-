require("dotenv").config();

const express = require("express");
const nodemailer = require("nodemailer");
const path = require("path");

const app = express();

// Permitir recibir imágenes en Base64
app.use(express.json({
    limit: "10mb"
}));

// Mostrar los archivos de la carpeta public
app.use(express.static(
    path.join(__dirname, "public")
));


// ===============================
// COMPROBAR VARIABLES DEL .ENV
// ===============================

console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log(
    "EMAIL_PASSWORD:",
    process.env.EMAIL_PASSWORD ? "CARGADA" : "VACÍA"
);


// ===============================
// CONFIGURACIÓN DEL CORREO
// ===============================

const transporter = nodemailer.createTransport({
    service: "gmail",

    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});


// ===============================
// PROBAR CONEXIÓN CON EL CORREO
// ===============================

transporter.verify(function (error, success) {

    if (error) {
        console.log("❌ Error de conexión con el correo:");
        console.log(error);
    } else {
        console.log("✅ Servidor de correo listo para enviar");
    }

});


// ===============================
// ENDPOINT PARA ENVIAR LA FOTO
// ===============================

app.post("/send-email", async (req, res) => {

    try {

        const { email, image } = req.body;

        // Verificar que lleguen los datos
        if (!email || !image) {

            return res.status(400).json({
                success: false,
                message: "Faltan datos."
            });

        }


        // Convertir la imagen Base64 a Buffer
        const base64Data = image.replace(
            /^data:image\/jpeg;base64,/,
            ""
        );

        const imageBuffer = Buffer.from(
            base64Data,
            "base64"
        );


        // Enviar correo
        await transporter.sendMail({

            from: process.env.EMAIL_USER,

            to: email,

            subject: "Fotografía tomada desde la webcam",

            text: "Se adjunta la fotografía tomada desde la aplicación web.",

            attachments: [

                {
                    filename: "fotografia.jpg",
                    content: imageBuffer,
                    contentType: "image/jpeg"
                }

            ]

        });


        console.log("✅ Correo enviado correctamente a:", email);


        res.json({
            success: true
        });


    } catch (error) {

        console.error("❌ Error enviando correo:");
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Error enviando el correo."
        });

    }

});


// ===============================
// INICIAR SERVIDOR
// ===============================

const PORT = 3000;

app.listen(PORT, () => {

    console.log(
        `Servidor ejecutándose en http://localhost:${PORT}`
    );

});