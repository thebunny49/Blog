var mongoose = require('mongoose');
var mongooserandom = require('mongoose-simple-random');
var postSchema = mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'users'
    },
    post:String,
    time: {
        type: Date,
        default: Date.now
    }
})
postSchema.plugin(mongooserandom);
module.exports =mongoose.model('posts', postSchema)