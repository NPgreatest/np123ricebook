const express = require('express');
const { Article, Profile } = require('../models/db');
const {authenticate, authenticateOrNot} = require('./auth');
const router = express.Router();
const {fetchArticleByIdOrAuthor, fetchRecentArticles, fetchUserAndFollowedArticles, addArticle} = require('../services/articles');
const { upload } = require('../services/image');




// Controller Function: Handle article retrieval logic
router.get('/:id?', authenticateOrNot, async (req, res) => {
    const { id } = req.params;
    const { ps = 10, pn = 1 } = req.query; 

    try {
        if (id) {
            // Fetch by article ID or articles by author
            const result = await fetchArticleByIdOrAuthor(id);
            return res.json(result);
        }

        if (!req.username) {
            // User not logged in, fetch most recent articles
            const result = await fetchRecentArticles(ps, pn);
            return res.json(result);
        }

        // User logged in, fetch user and following's articles
        const result = await fetchUserAndFollowedArticles(req.username, ps, pn);
        return res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to retrieve articles' });
    }
});


// POST /articles - Add a new article
router.post('/', authenticate, async (req, res) => {
    // Handle file uploads with multer
    upload.array('pictures', 10)(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ error: 'File upload error' });
        }

        const text = req.body.text;
        const pictureFiles = req.files || [];

        // console.log(pictureFiles);

        // Ensure the user is logged in
        if (!req.username) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        // Validate input parameters
        if (!text || typeof text !== 'string') {
            return res.status(400).json({ error: 'Invalid or missing text field' });
        }

        try {
            // // Convert uploaded files to URLs or file paths
            // const pictureUrls = pictureFiles.map(file => file.path);

            // Add the article
            const result = await addArticle(req.username, text, pictureFiles);
            res.status(201).json(result);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to add the article' });
        }
    });
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



module.exports = router;
