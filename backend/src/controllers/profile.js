const express = require('express');
const { Profile,User } = require('../models/db');
const {generateSaltHash} = require('../controllers/auth')
const { authenticate } = require('./auth');
const {   upload,    uploadImage,    getImageUrl } = require('../services/image'); 

const router = express.Router();


// Helper validation functions
const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validatePhone = (phone) => /^[0-9]{10}$/.test(phone);
const validateZipcode = (zipcode) => /^[0-9]{5}$/.test(zipcode);

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


const bcrypt = require('bcrypt');

router.put('/', authenticate, upload.single('picture'), async (req, res) => {
    const { email, phone, zipcode, password, status, headline } = req.body;
    const username = req.username;

    try {
        const profile = await Profile.findOne({ username });
        if (!profile) {
            return res.status(404).json({ error: 'User Profile not found' });
        }

        // Handle image upload if file is present
        if (req.file) {
            try {
                const uploadResult = await uploadImage(req.file);
                profile.picture = uploadResult.secure_url; // Store the Cloudinary URL
            } catch (uploadError) {
                console.error('Image upload error:', uploadError);
                return res.status(500).json({ error: 'Failed to upload image' });
            }
        }

        // Update other fields as before
        if (email) {
            if (!validateEmail(email)) {
                return res.status(400).json({ error: 'Invalid email format' });
            }
            profile.email = email;
        }

        // ... rest of your existing field updates ...

        await profile.save();
        res.json(profile);
    } catch (err) {
        console.error('Error updating profile:', err);
        res.status(500).json({ error: 'Failed to update profile' });
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
