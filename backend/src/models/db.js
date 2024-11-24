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

const articleSchema = new mongoose.Schema(
    {
        author: { type: String, required: true },
        text: { type: String, required: true },
        comments: [{ author: String, text: String }],
        picture: [{ type: String }] // Array of strings for picture URLs
    },
    { timestamps: true } // Automatically adds createdAt and updatedAt fields
);

const User = mongoose.model('User', userSchema);
const Profile = mongoose.model('Profile', profileSchema);
const Article = mongoose.model('Article', articleSchema);


module.exports = {
    mongoose,
    User,
    Profile,
    Article,
};