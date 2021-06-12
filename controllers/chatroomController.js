const mongoose = require("mongoose");
const Chatroom = mongoose.model("Chatroom");
const bson = require("bson");

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
// ||| used in routes/chatroom.js GET method
exports.getAllChatrooms = async (req, res) => {
  const chatrooms = await Chatroom.find({});

  res.json(chatrooms);
};

//!! get chatroom name
exports.getChatroomHeader = async (req, res) => {
  const bsonObjectId = new bson.ObjectId(req);
  console.log(bsonObjectId);
  const chatroomHeader = await Chatroom.findOne({ _id: bsonObjectId });
  alert(req);
  res.json(chatroomHeader);
};

//!! delete chatroom forever WIP
/* WIP
exports.deleteChatroom = async (req, res, err) => {
  const chatrooms = await Chatroom.find({ _id: req });
  console.log(chatrooms);
  //chatrooms.deleteOne({ _id: req });
  res.json({
    message: "Chatroom" + chatrooms.name + "deleted permanently, including all the messages.",
    icon: info,
    err: err,
  });
};
*/
