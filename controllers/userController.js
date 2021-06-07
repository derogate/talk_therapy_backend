const mongoose = require("mongoose");
const User = mongoose.model("User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

//! REGISTER PAGE BACKEND VALIDATION & SAVING TO MONGODB
exports.register = async (req, res) => {
	const { name, email, password } = req.body;

	if (name.trim().length === 0) throw "Please enter your name.";
	if (name.trim().length < 6) throw "Name must be at least 5 characters or more.";
	if (email.trim().length === 0) throw "Please enter your email.";
	const emailRegex = /@gmail.com|@yahoo.com|@hotmail.com|@live.com/;
	if (!emailRegex.test(email)) throw "Email provided is invalid!";
	if (password.trim().length === 0) throw "Please enter your password.";
	if (password.trim().length < 8) throw "Password must be at least 8 characters long.";

	const userExists = await User.findOne({
		email,
	});
	if (userExists) throw "User with same email already exits.";

	const salting = await bcrypt.hash(req.body.password, 14);
	const hashedPass = salting;

	const user = new User({
		name,
		email,
		password: hashedPass,
	});

	await user.save();

	res.json({
		message: "User [" + name + "] with email [" + email + "] registered successfully!",
		icon: "success",
	});
};

//! LOGIN PAGE BACKEND VALIDATION AND COMPARING RESULTS WITH MONGODB RECORDS
exports.login = async (req, res) => {
	const { email, password } = req.body;

	if (email.trim().length === 0) throw "Please enter your email.";
	const emailRegex = /@gmail.com|@yahoo.com|@hotmail.com|@live.com/;
	if (!emailRegex.test(email)) throw "Email provided is invalid!";
	if (password.trim().length === 0) throw "Please enter your password.";
	if (password.trim().length < 8) throw "Password must be at least 8 characters long.";

	const user = await User.findOne({
		email,
	});

	const match = await bcrypt.compare(req.body.password, user.password);

	if (!user) throw "Ensure the email is typed correctly.";
	if (!match) throw "Email and Password do not match!";

	if (match && user) {
		const token = await jwt.sign({ id: user.id }, process.env.PRIVATEKEY);

		res.json({
			message: "User logged in successfully!",
			token,
			icon: "success",
		});
	}
};
