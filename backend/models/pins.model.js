import mongoose from "mongoose";

const PinSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      require: true,
      min: 3,
    },
    title: {
      type: String,
      require: true,
    },
    location: {
      type: String,
      require: true,
    },
    date: {
      type: Date,
      require: true,
    },
    description: {
      type: String,
      require: true,
      min: 3,
    },
    lat: {
      type: Number,
      require: true,
    },
    long: {
      type: Number,
      require: true,
    },
    assistants: [
      {
        type: String,
        ref: "User",
        validate: {
          validator: async function (username) {
            const User = mongoose.model("User");
            const user = await User.findOne({ username: username });
            return user != null;
          },
          message: (props) => `Username ${props.value} does not exist!`,
        },
      },
    ],
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);
PinSchema.path("assistants").validate(function (assistants) {
  return new Set(assistants).size === assistants.length;
}, "Assistants array contains duplicate usernames!");

const Pin = mongoose.model("Pin", PinSchema); // Create a model from the schema

export default Pin;
