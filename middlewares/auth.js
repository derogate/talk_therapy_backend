const jwt = require("jsonwebtoken");

module.exports = async (req, res, next) => {
	try {
		if (!req.headers.authorization)
			return res.status(401).json({
				message: "Missing required token!",
				icon: "error",
			});
		console.log("request.headers", req.headers.authorization)
		const token = req.headers.authorization.split(" ")[1];
		console.log("token!!!", token)
		const payload = await jwt.verify(token, process.env.PRIVATEKEY);
		console.log("PAYLOAD", payload)
		req.payload = payload;
		next();
	} catch (err) {
		res.status(403).json({
			message: "Invalid token!",
			icon: "error",
		});
	}
};
