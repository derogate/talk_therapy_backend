const mongoose = require("mongoose");
const User = mongoose.model("User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

//! REGISTER PAGE BACKEND VALIDATION & SAVING TO MONGODB
exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  // backend registration validation - name, email && password MUST not be empty,
  // name length MUST be 6 or more characters while password length MUST be 8 or more characters,
  // email regex MUST pass popular domains
  if (name.trim().length === 0) throw "Please enter your name.";
  if (name.trim().length < 5) throw "Name must be at least 5 characters or more.";
  if (name.trim().length > 20) throw "Name must not exceed 20 characters.";
  if (email.trim().length === 0) throw "Please enter your email.";
  const emailRegex = /@gmail.com|@outlook.com|@hotmail.com|@live.com|@yahoo.com/;
  if (!emailRegex.test(email)) throw "Email provided is invalid!";
  if (password.trim().length === 0) throw "Please enter your password.";
  if (password.trim().length < 8) throw "Password must be at least 8 characters long.";

  // check if user already exists in mongoDB records of ALL user details
  const userExists = await User.findOne({
    email,
  });
  if (userExists) throw "Credentials provided already exists. Please choose a different one.";

  // hash the password input
  const salting = await bcrypt.hash(req.body.password, 14);
  const hashedPass = salting;

  // use User mongoose models to specify the req.body input to be inserted to the mongoose schema.
  // Also, assign password as the hashed password
  const user = new User({
    name,
    email,
    password: hashedPass,
  });

  // save user information to mongoDB
  await user.save();

  res.json({
    message: "User [" + name + "] with email [" + email + "] registered successfully!",
    icon: "success",
  });
};

//! LOGIN PAGE BACKEND VALIDATION AND COMPARING RESULTS WITH MONGODB RECORDS
exports.login = async (req, res) => {
  const { email, password } = req.body;

  // backend login validation - must enter email and password & have password longer than 8
  // must pass email regex of popular domains
  if (email.trim().length === 0) throw "Please enter your email.";
  const emailRegex = /@gmail.com|@outlook.com|@hotmail.com|@live.com|@yahoo.com/;
  if (!emailRegex.test(email)) throw "Email provided is invalid!";
  if (password.trim().length === 0) throw "Please enter your password.";
  if (password.trim().length < 8) throw "Password is invalid!";

  // find first matched mongoDB user information based on entered email input
  const user = await User.findOne({
    email,
  });

  // if no email is found in mongoDB records
  if (!user) throw "Ensure the email is typed correctly.";

  // compare the entered password input with mongoDB password (based on matched mongoDB user information)
  const match = await bcrypt.compare(req.body.password, user.password);

  /*
	???T TESTING: to check match, req.body and mongoDB information
	console.log(match);
	console.log(req.body.password);
	console.log(user.password);
	console.log(user.email);
	console.log(user);
	*/

  // if password is wrong, provide a vague message to tell that either email or password is wrong & both input should be checked
  if (!match) throw "Invalid credentials! Please ensure correct credentials are entered.";

  // if user password input matches with decrypted mongoDB password
  if (match) {
    // assign token token to user id (using the user id as the payload to be encoded)
    const token = await jwt.sign({ id: user.id }, process.env.PRIVATEKEY);

    console.log(`User [${user.name}] token (from backend /controller/userController.js) ===> [${token}]`);
    res.json({
      message: `User [${user.name}] logged in successfully!`,
      icon: "success",
      token,
    });
    // ||| the token in res.json({}) is required to pass to frontend src/Pages/LoginPg.js which will then, save it to localStorage as "CHAT_TOKEN"
  }
};
