const express = require('express');
const { Article, Profile } = require('../models/db');
const {authenticate} = require('./auth');

const router = express.Router();




// GET /articles/:id? - Fetch articles
router.get('/:id?', authenticate, async (req, res) => {
    const { id } = req.params;
    // console.log(id);
    try {
        if (id) {
            // Fetch by article ID or username
            const article = await Article.findOne({ _id: id }).exec();
            if (article) {
                return res.json({ articles: [article] });
            }

            const articlesByUser = await Article.find({ author: id }).exec();
            return res.json({ articles: articlesByUser });
        }

        // Fetch articles in the user's feed
        const user = await Profile.findOne({ username: req.username }).exec();
        const following = user ? user.following : [];
        const authors = [...following, req.username];

        const articles = await Article.find({ author: { $in: authors } }).exec();
        res.json({ articles });
    } catch (error) {
        // console.log(error);
        res.status(500).json({ error: 'Failed to retrieve articles' });
    }
});

// PUT /articles/:id - Update an article or comment
router.put('/:id', authenticate, async (req, res) => {
    const { id } = req.params;
    const { text, commentId } = req.body;

    if (!text) {
        return res.status(400).json({ error: 'Text is required' });
    }

    try {
        const article = await Article.findById(id).exec();
        if (!article) {
            return res.status(404).json({ error: 'Article not found' });
        }

        // Update an article
        if (!commentId && article.author === req.username) {
            article.text = text;
        } else if (commentId === -1) {
            // Add a new comment
            article.comments.push({ author: req.username, text });
        } else {
            // Update a comment
            const comment = article.comments.id(commentId);
            if (comment && comment.author === req.username) {
                comment.text = text;
            } else {
                return res.status(403).json({ error: 'Unauthorized to update this comment' });
            }
        }

        await article.save();
        res.json({ articles: [article] });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update article' });
    }
});

// POST /article - Add a new article
router.post('/', authenticate, async (req, res) => {
    const { text } = req.body;
    // console.log(req);
    if (!text) {
        return res.status(400).json({ error: 'Text is required' });
    }

    try {
        const newArticle = new Article({
            author: req.username,
            text,
            date: new Date(),
            comments: [],
        });

        await newArticle.save();
        res.json({ articles: [newArticle] });
    } catch (error) {
        // console.log(error);
        res.status(500).json({ error: 'Failed to add article' });
    }
});

module.exports = router;
