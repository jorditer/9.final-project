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
  },
  friends: [{
    type: String,
    ref: 'User',
    // Validate no repeated usernames
    validate: {
      validator: async function(username) {
        const User = mongoose.model('User');
        const user = await User.findOne({ username: username });
        return user != null;
      },
      message: props => `Username ${props.value} does not exist!`
    }
  }],
  pendingFriendRequests: [{
    type: String,
    ref: 'User',
    validate: {
      validator: async function(username) {
        const User = mongoose.model('User');
        const user = await User.findOne({ username: username });
        return user != null;
      },
      message: props => `Username ${props.value} does not exist!`
    }
  }],
  sentFriendRequests: [{
    type: String,
    ref: 'User'
  }],
}, {
  timestamps: true
});

UserSchema.path('friends').validate(function(friends) {
  return new Set(friends).size === friends.length;
}, 'Friends array contains duplicate usernames!');

// Don't return password in queries
UserSchema.pre('find', function() {
  this.select('-password');
});

// UserSchema.pre('findOne', function() {
//   this.select('-password');
// });

const User = mongoose.model("User", UserSchema); // Create a model from the schema

export default User;
