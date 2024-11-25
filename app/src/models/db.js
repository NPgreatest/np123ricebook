const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://root:root@cluster0.ijqrksk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', { useNewUrlParser: true, useUnifiedTopology: true });

// Define schemas
const userSchema = new mongoose.Schema({
    username: String,
    salt: String,
    hash: String,
});

const profileSchema = new mongoose.Schema({
    username: String,
    status: { type: String, default: 'Hello World' },
    following: { type: Array, default: [] },
    picture: { type: String, default: null },
    email: String,
    phone: String,
    dob: Date,
    zipcode: String,
    headline: { type: String, default: 'Happy coding!' },
});

const commentSchema = new mongoose.Schema({
    author: String,
    text: String,
    date: { type: Date, default: Date.now }
});

const articleSchema = new mongoose.Schema({
    author: String,
    text: String,
    picture: [String],
    comments: [commentSchema],
    createdAt: { type: Date, default: Date.now }
});


const User = mongoose.model('User', userSchema);
const Profile = mongoose.model('Profile', profileSchema);
const Article = mongoose.model('Article', articleSchema);


module.exports = {
    mongoose,
    User,
    Profile,
    Article,
};