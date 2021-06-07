const jwt = require("jsonwebtoken");

module.exports = async (req, res, next) => {
	try {
		if (!req.headers.authorization)
			return res.status(401).json({
				message: "Missing required token!",
				icon: "error",
			});
		const token = req.headers.authorization.split(" ")[1];
		const payload = await jwt.verify(token, process.env.SECRET);
		req.payload = payload;
		next();
	} catch (err) {
		res.status(403).json({
			message: "Invalid token!",
			icon: "error",
		});
	}
};
