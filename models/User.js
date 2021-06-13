const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      minlength: 5,
      maxlength: 20,
      required: "Name is required!",
    },
    email: {
      type: String,
      trim: true,
      required: "Email is required!",
    },
    password: {
      type: String,
      trim: true,
      minlength: 8,
      required: "Password is required!",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
