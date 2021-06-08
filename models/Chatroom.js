const mongoose = require("mongoose");

const chatroomSchema = new mongoose.Schema({
	name: {
		type: String,
		maxlength: 40,
		trim: true,
		required: "Name is required!",
	},
});

module.exports = mongoose.model("Chatroom", chatroomSchema);
