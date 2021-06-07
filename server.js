require("dotenv").config();

//! MONGODB & MONGOOSE SETUP
const mongoose = require("mongoose");
const mongoPass = "LooBdFdtqMKNufoo";
const mongoURI = `mongodb+srv://admin:${mongoPass}@cluster0.fncho.mongodb.net/chat-app?retryWrites=true&w=majority`;
mongoose.connect(mongoURI, {
	useUnifiedTopology: true,
	useNewUrlParser: true,
});
mongoose.connection.on("error", (err) => {
	console.log("Mongoose Connection ERROR: " + err.message);
});
mongoose.connection.once("open", () => {
	console.log("MongoDB Connected!");
});

//Bring in the models
require("./models/User");
require("./models/Chatroom");
require("./models/Message");

const app = require("./app");
const PORT = 4040;
const server = app.listen(PORT, () => {
	console.log(`Backend Server.js listening on port: ${PORT}`);
});

//! SOCKET.IO SETUP
const io = require("socket.io")(server, {
	cors: {
		origin: "http://localhost:4040",
		methods: ["GET", "POST"],
	},
});
const jwt = require("jsonwebtoken");

const Message = mongoose.model("Message");
const User = mongoose.model("User");

io.use(async (socket, next) => {
	try {
		const token = socket.handshake.query.token;
		const payload = await jwt.verify(token, process.env.PRIVATEKEY);
		socket.userId = payload.id;
		next();
	} catch (err) {}
});

io.on("connection", (socket) => {
	console.log("Connected: " + socket.userId);

	socket.on("disconnect", () => {
		console.log("Disconnected: " + socket.userId);
	});

	socket.on("joinRoom", ({ chatroomId }) => {
		socket.join(chatroomId);
		console.log("A user joined chatroom: " + chatroomId);
	});

	socket.on("leaveRoom", ({ chatroomId }) => {
		socket.leave(chatroomId);
		console.log("A user left chatroom: " + chatroomId);
	});

	socket.on("chatroomMessage", async ({ chatroomId, message }) => {
		if (message.trim().length > 0) {
			const user = await User.findOne({ _id: socket.userId });
			const newMessage = new Message({
				chatroom: chatroomId,
				user: socket.userId,
				message,
			});
			io.to(chatroomId).emit("newMessage", {
				message,
				name: user.name,
				userId: socket.userId,
			});
			await newMessage.save();
		}
	});
});
