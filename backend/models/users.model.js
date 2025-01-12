import mongoose from "mongoose";

const UserSchema =  new mongoose.Schema({
  username: {
    type: String,
    required: true,
    min: 3,
    max: 20,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    max: 50,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    min: 6,
  }
},
{
	  timestamps: true, // createdAt, updated
}
);

const User = mongoose.model("User", UserSchema); // Create a model from the schema

export default User;
