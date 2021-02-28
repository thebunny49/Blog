var mongoose = require('mongoose');
var pml = require('passport-local-mongoose');
mongoose.connect('mongodb://localhost/blog');

var userSchema = mongoose.Schema({
  name: String,
  username: String,
  email: String,
  profileImage: {
    type: String,
    default: './images/uploads/default.png'
  },
  posts:[
    {
      type: mongoose.Schema.Types.ObjectId,
      ref:'posts'
    }
  ],
  password: String
})
userSchema.plugin(pml);
module.exports = mongoose.model('user', userSchema)