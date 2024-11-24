const { Article, Profile } = require('../models/db');



const addArticle = async (author, text, picture = []) => {
    try {
        const newArticle = new Article({
            author,
            text,
            picture, 
        });

        const savedArticle = await newArticle.save(); // Save to the database
        return { article: savedArticle };
    } catch (error) {
        console.log(error);
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