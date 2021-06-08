const mongoose = require("mongoose");
const Chatroom = mongoose.model("Chatroom");

//! CREATE CHATROOM AND SAVE TO MONGODB
exports.createChatroom = async (req, res) => {
	const { name } = req.body;

	if (name.trim() === "") throw "Please enter a chatroom name.";
	if (name.trim().length > 40) throw "Please enter a chatroom name containing 40 characters or less.";
	const nameRegex = /^[A-Za-z\s]+$/;
	if (!nameRegex.test(name)) throw "Chatroom name can contain only alphabets.";

	const chatroomExists = await Chatroom.findOne({ name });
	if (chatroomExists) throw "Chatroom with that name have been used! Please try another name.";

	const chatroom = new Chatroom({
		name,
	});

	await chatroom.save();

	res.json({
		message: "Chatroom created!",
		icon: "success",
	});
};

//!! GET ALL CHATROOMS TO BE DISPLAYED IN DASHBOARD PAGE (FRONTEND FOLDER)
exports.getAllChatrooms = async (req, res) => {
	const chatrooms = await Chatroom.find({});

	res.json(chatrooms);
};
