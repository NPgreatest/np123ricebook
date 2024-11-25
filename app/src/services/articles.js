const { Article, Profile } = require('../models/db');
const { uploadImage } = require('./image');

const addArticle = async (author, text, imageFiles = []) => {
    try {
        // Upload multiple images to Cloudinary if present
        const pictureUrls = [];
        if (imageFiles && imageFiles.length > 0) {
            for (const file of imageFiles) {
                try {
                    const uploadResult = await uploadImage(file);
                    pictureUrls.push(uploadResult.secure_url);
                } catch (uploadError) {
                    console.error('Image upload error:', uploadError);
                    throw new Error('Failed to upload image');
                }
            }
        }

        const newArticle = new Article({
            author,
            text,
            picture: pictureUrls, // Store array of Cloudinary URLs
        });

        const savedArticle = await newArticle.save();
        return { article: savedArticle };
    } catch (error) {
        console.error('Error adding article:', error);
        throw new Error('Error adding a new article');
    }
};


// Server Function: Fetch article by ID or by author
const fetchArticleByIdOrAuthor = async (id) => {
    try {
        const article = await Article.findOne({ _id: id }).exec();
        if (article) {
            return { articles: [article] };
        }

        const articlesByUser = await Article.find({ author: id }).exec();
        return { articles: articlesByUser };
    } catch (error) {
        throw new Error('Error fetching article by ID or author');
    }
};

// Server Function: Fetch most recent articles
const fetchRecentArticles = async (ps, pn) => {
    try {
        const articles = await Article.find()
            .sort({ createdAt: -1 }) // Sort by most recent
            .skip((pn - 1) * ps)
            .limit(parseInt(ps))
            .exec();
        return { articles };
    } catch (error) {
        throw new Error('Error fetching recent articles');
    }
};

// Server Function: Fetch user's and followed users' articles
const fetchUserAndFollowedArticles = async (username, ps, pn) => {
    try {
        const user = await Profile.findOne({ username }).exec();
        const following = user ? user.following : [];
        const authors = [...following, username];

        const articles = await Article.find({ author: { $in: authors } })
            .sort({ createdAt: -1 }) // Sort by most recent creation time
            .skip((pn - 1) * ps)
            .limit(parseInt(ps))
            .exec();

        return { articles };
    } catch (error) {
        throw new Error('Error fetching user and followed users\' articles');
    }
};

// Exporting all service functions
module.exports = {
    fetchArticleByIdOrAuthor,
    fetchRecentArticles,
    fetchUserAndFollowedArticles,
    addArticle // New function added here
};