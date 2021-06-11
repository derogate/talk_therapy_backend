//import dotenv module to use backend .env file
require("dotenv").config();

// MONGODB & MONGOOSE SETUP =======================================================================================
const mongoose = require("mongoose");
const mongoUser = "administrator_talk_therapy";
const mongoPass = "administrator_talk_therapy";
const mongoDatabase = "talk_therapy_chat_BN";
const mongoURI = `mongodb+srv://${mongoUser}:${mongoPass}@cluster0.y1f9v.mongodb.net/${mongoDatabase}?retryWrites=true&w=majority`;
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

// import the models .js files necessary ==========================================================================
require("./models/User");
require("./models/Chatroom");
require("./models/Message");

// listen to express app server ==================================================================================
const app = require("./app");
const PORT = 4040;
const server = app.listen(PORT, () => {
	console.log(`Backend Server.js listening on port: ${PORT}`);
});
//! ==============================================================================================================
//! SOCKET.IO SETUP ==============================================================================================
//! ==============================================================================================================
// import socket.io, jwt tokens and moment
const io = require("socket.io")(server, {
	// need to use CORS for socket.io since
	// backend origin is port 4040, whereas frontend origin is port 3000 (React default port)
	cors: {
		origin: "http://localhost:3000",
		methods: ["GET", "POST", "PUT", "DELETE"],
	},
});
const jwt = require("jsonwebtoken");
const moment = require("moment");

// use mongoose models and declare User and Message variables to be used below
const Message = mongoose.model("Message");
const User = mongoose.model("User");
const Chatroom = mongoose.model("Chatroom");

// ||| verify & decode the token in the socket handshake query key object (origin from localStorage "CHAT_TOKEN" in frontend src/App.js )
// |||| & then, assigning the socket id as the user id ( which is the payload.id)
//! io is server-side, socket is client-side
io.use(async (socket, next) => {
	try {
		/*
		??? TESTING: to see socket contents
		console.log(socket)
		console.log(socket.handshake)
		console.log(socket.handshake.query)
		console.log(socket.handshake.query.token)
		*/
		const token = socket.handshake.query.token;
		const payload = await jwt.verify(token, process.env.PRIVATEKEY);
		socket.userId = payload.id;

		/*
		??? TESTING: to check the decoded payload information and its payload.id value (which is mongoDB user _id)
		console.log("socket.userId: " + socket.userId);
		console.log(payload);
		console.log(payload.id);
		*/

		next();
	} catch (err) {
		console.log(err);
	}
});

// current time
var date = moment();
console.log(date);

// on successfully establishing connection ("connection" event)
io.on("connection", async (socket) => {
	const user = await User.findOne({ _id: socket.userId });

	console.log("[server.js] " + user.name + " [id: " + socket.userId + "] connected on " + moment().format("Do MMM YYYY, h:mm:ss A"));

	// when someone disconnect ("disconnect" event)
	socket.on("disconnect", (reason) => {
		console.log("[server.js]{" + user.name + "} disconnected at " + moment().format("h:mm:ss A") + ": " + reason);
	});

	// ||| when someone join the room ("joinRoom" event) - related to frontend src/Pages/ChatroomPg.js
	socket.on("joinRoom", async ({ chatroomId }) => {
		const chatroom = await Chatroom.findOne({ _id: chatroomId });
		socket.join(chatroomId);
		console.log("[server.js] " + user.name + " joined chatroom [" + chatroom.name + " (id:" + chatroomId + ")] " + moment().format("h:mm:ss A"));
	});

	// ||| when someone leave the room ("leaveRoom" event) - related to frontend src/Pages/ChatroomPg.js
	socket.on("leaveRoom", async ({ chatroomId }) => {
		const chatroom = await Chatroom.findOne({ _id: chatroomId });
		socket.leave(chatroomId);
		console.log("[server.js] " + user.name + " left chatroom: [" + chatroom.name + " (id:" + chatroomId + ")] " + moment().format("h:mm:ss A"));
	});

	// ||| when someone type a message in a chatroom ("chatroomMessage" event),
	// ||| emit the message to that particular chatroom and save it in mongoDB  - related to frontend src/Pages/ChatroomPg.js
	socket.on("chatroomMessage", async ({ chatroomId, message }) => {
		// if there is something in the message excluding whitespaces at start and end of message
		if (message.trim().length > 0) {
			const user = await User.findOne({ _id: socket.userId });

			const newMessage = new Message({
				chatroom: chatroomId,
				user: socket.userId,
				message,
			});
			// ||| "newMessage" event  - related to frontend src/Pages/ChatroomPg.js
			io.to(chatroomId).emit("newMessage", {
				message,
				name: user.name,
				userId: socket.userId,
			});
			await newMessage.save();
		}
	});
});
