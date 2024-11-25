const express = require('express');
const { Profile } = require('../models/db');
const { authenticate } = require('./auth');

const router = express.Router();

// GET the list of users being followed by the requested user
router.get('/:user?', authenticate, async (req, res) => {
    const username = req.params.user || req.username;
    try {
        const profile = await Profile.findOne({ username });
        if (!profile) return res.status(404).send({ error: 'User not found' });
        res.send({ username, following: profile.following });
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

// PUT to add a user to the following list for the logged-in user
router.put('/:user', authenticate, async (req, res) => {
    const userToFollow = req.params.user;
    if (!userToFollow) return res.status(400).send({ error: 'User to follow is required' });

    try {
        const userProfile = await Profile.findOne({ username: req.username });
        const followProfile = await Profile.findOne({ username: userToFollow });

        if (!userProfile || !followProfile) return res.status(404).send({ error: 'User not found' });

        if (userProfile.following.includes(userToFollow)) {
            return res.status(400).send({ error: 'User is already being followed' });
        }

        userProfile.following.push(userToFollow);
        await userProfile.save();

        res.send({ username: req.username, following: userProfile.following });
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

// DELETE to remove a user from the following list for the logged-in user
router.delete('/:user', authenticate, async (req, res) => {
    const userToUnfollow = req.params.user;
    if (!userToUnfollow) return res.status(400).send({ error: 'User to unfollow is required' });

    try {
        const userProfile = await Profile.findOne({ username: req.username });

        if (!userProfile) return res.status(404).send({ error: 'User not found' });

        const index = userProfile.following.indexOf(userToUnfollow);
        if (index === -1) {
            return res.status(400).send({ error: 'User is not in the following list' });
        }

        userProfile.following.splice(index, 1);
        await userProfile.save();

        res.send({ username: req.username, following: userProfile.following });
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

module.exports = router;
