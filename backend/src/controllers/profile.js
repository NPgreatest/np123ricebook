const express = require('express');
const { Profile } = require('../models/db');
const { authenticate } = require('./auth');

const router = express.Router();

router.get('/:user?', authenticate, async (req, res) => {
    const username = req.params.user || req.username;
    try {
        const profile = await Profile.findOne({ username });
        if (!profile) return res.status(404).send({ error: 'User not found' });
        res.send(profile);
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});


// GET headline for a user
router.get('/headline/:user?', authenticate, async (req, res) => {
    const username = req.params.user || req.username;
    try {
        const profile = await Profile.findOne({ username });
        // console.log(username,profile.username,profile.headline);
        if (!profile) return res.status(404).send({ error: 'User not found' });
        res.send({ username, headline: profile.headline });
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

// PUT headline for the logged-in user
router.put('/headline', authenticate, async (req, res) => {
    const { headline } = req.body;
    if (!headline) return res.status(400).send({ error: 'Headline is required' });
    try {
        const profile = await Profile.findOneAndUpdate(
            { username: req.username },
            { headline },
            { new: true }
        );
        res.send({ username: req.username, headline: profile.headline });
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

// GET email for a user
router.get('/email/:user?', authenticate, async (req, res) => {
    const username = req.params.user || req.username;
    try {
        const profile = await Profile.findOne({ username });
        if (!profile) return res.status(404).send({ error: 'User not found' });
        res.send({ username, email: profile.email });
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

// PUT email for the logged-in user
router.put('/email', authenticate, async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).send({ error: 'Email is required' });
    try {
        const profile = await Profile.findOneAndUpdate(
            { username: req.username },
            { email },
            { new: true }
        );
        res.send({ username: req.username, email: profile.email });
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

// GET zipcode for a user
router.get('/zipcode/:user?', authenticate, async (req, res) => {
    const username = req.params.user || req.username;
    try {
        const profile = await Profile.findOne({ username });
        if (!profile) return res.status(404).send({ error: 'User not found' });
        res.send({ username, zipcode: profile.zipcode });
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

// PUT zipcode for the logged-in user
router.put('/zipcode', authenticate, async (req, res) => {
    const { zipcode } = req.body;
    if (!zipcode) return res.status(400).send({ error: 'Zipcode is required' });
    try {
        const profile = await Profile.findOneAndUpdate(
            { username: req.username },
            { zipcode },
            { new: true }
        );
        res.send({ username: req.username, zipcode: profile.zipcode });
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

// GET date of birth for a user
router.get('/dob/:user?', authenticate, async (req, res) => {
    const username = req.params.user || req.username;
    try {
        const profile = await Profile.findOne({ username });
        if (!profile) return res.status(404).send({ error: 'User not found' });
        res.send({ username, dob: new Date(profile.dob).getTime() });
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

// GET avatar for a user
router.get('/avatar/:user?', authenticate, async (req, res) => {
    const username = req.params.user || req.username;
    try {
        const profile = await Profile.findOne({ username });
        if (!profile) return res.status(404).send({ error: 'User not found' });
        res.send({ username, avatar: profile.picture });
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

// PUT avatar for the logged-in user
router.put('/avatar', authenticate, async (req, res) => {
    const { avatar } = req.body;
    if (!avatar) return res.status(400).send({ error: 'Avatar is required' });
    try {
        const profile = await Profile.findOneAndUpdate(
            { username: req.username },
            { picture: avatar },
            { new: true }
        );
        res.send({ username: req.username, avatar: profile.picture });
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

// GET phone number for a user
router.get('/phone/:user?', authenticate, async (req, res) => {
    const username = req.params.user || req.username;
    try {
        const profile = await Profile.findOne({ username });
        if (!profile) return res.status(404).send({ error: 'User not found' });
        res.send({ username, phone: profile.phone });
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

// PUT phone number for the logged-in user
router.put('/phone', authenticate, async (req, res) => {
    const { phone } = req.body;
    if (!phone) return res.status(400).send({ error: 'Phone number is required' });
    try {
        const profile = await Profile.findOneAndUpdate(
            { username: req.username },
            { phone },
            { new: true }
        );
        res.send({ username: req.username, phone: profile.phone });
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

module.exports = router;
