const db = require("../models");
const User = db.users;

//* Esta verificación esta con promesas para hacerlo síncrona. Aunque en este caso creo que no tiene
//* sentido hacerlo así.
const verifySignUp = (req, res, next) => {
	const email = req.body.email;
	// Validamos si existe email en el req
	if (!email) {
		return res.status(403).send("Campo email es requerido");
	}
	User.findOne({ where: { email}}).then(user => {
		if(user) {
			return res.status(409).send("Email ingresado existe, inicie login en http://localhost:3000/signin");
		}
		req.user = user;
		return next();
	}).catch(err => {
		console.log(err.message);
		return res.status(401).send("Email no valido, acceso denegado");
	})
};

module.exports = verifySignUp;
