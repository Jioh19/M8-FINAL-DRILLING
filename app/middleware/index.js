const express = require("express");
const cors = require("cors");

//RUTAS
const rutaUser = require("../routes/user.routes");
const rutaBootcamp = require("../routes/bootcamp.routes");
const auth = require("./auth");

const app = express();

//middlewares generales del proyecto.
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Acceso a la ruta User
app.use("/", rutaUser);

// Acceso a la ruta bootcamp
app.use("/api/bootcamp", rutaBootcamp);

//RUTA POR DEFECTO
// Acceso a la ruta raíz vacía
app.get("/", auth, (req, res) => {
	res.status(200).send("Bienvenido, se ha validado correctamente esta ruta /inicio con el Token JWT 🙌");
});

app.all("*", (req, res) => {
	res.status(404).send("Ruta desconocida.");
});
module.exports = app;
