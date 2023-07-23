const router = require("express").Router();
const User = require("../controllers/user.controller");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const verifySignUp = require("../middleware/verifySignUp");
const auth = require("../middleware/auth");
const TOKEN = require("../config/auth.config");

//*Probando con promesas y sincrónico.
//* Registro de una nuevo usuario, acceso público
router.post("/api/signup", verifySignUp, (req, res) => {
	const { firstName, lastName, email, password } = req.body;
	if (!(firstName && lastName && email && password)) {
		return res.status(400).send("Todos los campos son requeridos");
	}
	// Encriptando la contraseña del usuario
	bcrypt.hash(password, 10).then((encryptedPassword) => {
		User.createUser({
			firstName,
			lastName,
			email: email.toLowerCase(), // Convertimos a minúscula
			password: encryptedPassword,
		}).then((user) => {
			// Creación del Token
			const token = jwt.sign(
				{
					user_id: user._id,
					email,
				},
				TOKEN.TOKEN_KEY,
				{
					expiresIn: "30m",
				}
			);
			// Token Generado
			console.log("\nToken Generado: " + token);
			// retornamos el nuevo usuario
			return res.status(201).json(user);
		});
	});
});

// lógica del registro Login
//* Más claro y fácil asíncrono, además de demostrar que también se usarlo.
//* Inicio de sesión en la API, acceso público
router.post("/api/signin", async (req, res) => {
	// lógica del inicio de sesión
	try {
		// obteniendo los datos de entrada
		const { email, password } = req.body;
		// Validar los datos de entrada
		if (!(email && password)) {
			res.status(400).send("Todos los datos son requeridos, email y password");
		}
		// Validando la existencia del usuario en la base de datos
		const user = await User.findUserByEmail(email);
		console.log(user);
		if (user && (await bcrypt.compare(password, user.password))) {
			// Se genera el Token
			const token = jwt.sign(
				{
					user_id: user._id,
					email,
				},
				TOKEN.TOKEN_KEY,
				{
					expiresIn: "30m",
				}
			);
			// Impresión por el terminal del Token generado para el usuario
			console.log("Usuario: " + email + "\nToken: " + token);
			// Retornando los datos del usuario
			return res.status(200).json(user);
		}
		return res.status(400).send("Credenciales invalidas");
	} catch (err) {
		console.log(err);
	}
});

//* Lista información del usuario según id, acceso por medio de token, previamente iniciado sesión
router.get("/api/user/:id", auth, (req, res) => {
	const { id } = req.params;
	User.findUserById(id)
		.then((user) => {
			if (user) {
				return res.status(200).json({ user: user });
			} else {
				return res.status(404).send(`No se pueden leer los datos de ${id}`);
			}
		})
		.catch((err) => {
			return res.status(500).json({
				code: 500,
				message: `Error al obtener al usuario ID ${id}`,
			});
		});
});

//* Lista información de todos los usuarios y los Bootcamp registrados, acceso por medio de token,
//* previamente iniciado sesión
router.get("/api/user/", auth, (req, res) => {
	User.findAll()
		.then((user) => {
			if (user) {
				return res.status(200).json({ user: user });
			} else {
				return res.status(404).send(`No se pueden leer los datos`);
			}
		})
		.catch((err) => {
			return res.status(500).json({
				code: 500,
				message: `Error al obtener a los usuarios`,
			});
		});
});

//* Actualiza los campos de firstName y lastName de un usuario según su id, 
//* acceso por medio de token, previamente iniciado sesión 
router.put("/api/user/:id", auth, (req, res) => {
	const id = req.params.id;
	const { firstName, lastName } = req.body;
	User.updateUserById(id, firstName, lastName)
		.then((user) => {
			if (user != 0) {
				return res.status(200).json({ user: user });
			} else {
				return res.status(404).send(`No se pueden leer los datos de ${id}`);
			}
		})
		.catch((err) => {
			return res.status(500).json({
				code: 500,
				message: `Error al obtener al usuario ID ${id}`,
			});
		});
});

//* Elimina el usuario según id, acceso por medio de token, previamente iniciado sesión
router.delete("/api/user/:id", auth, (req, res) => {
	const id = req.params.id;
	User.deleteUserById(id)
		.then((user) => {
			if (user != 0) {
				return res.status(200).send(`Usuario ID ${id} eliminado`);
			} else {
				return res.status(404).send(`No se pueden leer los datos de ${id}`);
			}
		})
		.catch((err) => {
			return res.status(500).json({
				code: 500,
				message: `Error al obtener al usuario ID ${id}`,
			});
		});
});

module.exports = router;
