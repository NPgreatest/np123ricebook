const express = require('express');
const md5 = require('md5');
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const { User, Profile } = require('../models/db');

const router = express.Router();
const cookieKey = 'sid';
const sessionUser = {};
require('dotenv').config();



const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const callbackURL = process.env.GITHUB_CALLBACK_URL || 'http://localhost:3000/auth/github/callback';


// Helper Functions
const generateSalt = (username) => md5(username + new Date().getTime());
const getHash = (password, salt) => md5(password + salt);

const generateSaltHash = (username,password) => {
    const salt = generateSalt(username);
    const hash = getHash(password, salt);
    return {salt,hash};
};

const authenticate = (req, res, next) => {
    const sessionKey = req.cookies[cookieKey];
    if (sessionKey && sessionUser[sessionKey]) {
        req.username = sessionUser[sessionKey].username;
        next();
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
};


const authenticateOrNot = (req, res, next) => {
    const sessionKey = req.cookies[cookieKey];
    if (sessionKey && sessionUser[sessionKey]) {
        req.username = sessionUser[sessionKey].username;
    }
    next();
};


// Registration endpoint
router.post('/register', async (req, res) => {
    const { username, password, email, dob, phone, zipcode } = req.body;
    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ error: 'Username already exists' });
        }
        const {salt,hash} = generateSaltHash(username,password);
        const newUser = new User({ username, salt, hash });
        await newUser.save();

        const newProfile = new Profile({ username, email, dob, phone, zipcode });
        await newProfile.save();

        res.json({ result: 'success', username });
    } catch (error) {
        res.status(500).json({ error: 'Registration failed' });
    }
});

// Login endpoint
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Attempt to find a local user
        const user = await User.findOne({ username, salt: { $ne: null }, hash: { $ne: null } });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials or user does not exist' });
        }

        const hash = getHash(password, user.salt);
        if (hash !== user.hash) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const sessionKey = md5('mySecretMessage' + new Date().getTime() + user.username);
        sessionUser[sessionKey] = { username: user.username };

        res.cookie(cookieKey, sessionKey, { maxAge: 3600 * 1000, httpOnly: true, sameSite: 'None', secure: true });
        res.json({ username, message: 'Login successful' });
    } catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
});


// Logout endpoint
router.put('/logout', authenticate, (req, res) => {
    const sessionKey = req.cookies[cookieKey];
    if (sessionKey) {
        delete sessionUser[sessionKey];
        res.clearCookie(cookieKey);
        res.sendStatus(200);
    } else {
        res.status(400).json({ error: 'Already logged out' });
    }
});

router.put('/password', authenticate, async (req,res) =>{
    const { password } = req.body;
    if (!password) return res.status(400).send({ error: 'new password is required' });
    try {

        const user = await User.findOne({ username: req.username });
        const hash = getHash(password, user.salt);
        user.hash = hash;

        await user.save();

        res.send({ username: req.username  });
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});


passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(obj, done) {
    done(null, obj);
});

passport.use(new GitHubStrategy({
    clientID: GITHUB_CLIENT_ID,
    clientSecret: GITHUB_CLIENT_SECRET,
    callbackURL: callbackURL
}, async function(accessToken, refreshToken, profile, done) {
    try {
        // Search for a user with this GitHub ID
        let user = await User.findOne({ 'auth.provider': 'github', 'auth.id': profile.id });

        if (!user) {
            // User not found, create a new one
            user = new User({
                username: `github_${profile.username}`,
                salt: null,
                hash: null,
                auth: [{
                    provider: 'github',
                    id: profile.id,
                    username: profile.username,
                    displayName: profile.displayName
                }]
            });
            await user.save();

            // Create a profile for the new user
            const newProfile = new Profile({
                username: user.username,
                email: profile.emails[0].value,
                dob: null,
                phone: null,
                zipcode: null
            });
            await newProfile.save();
        }

        return done(null, user);
    } catch (err) {
        return done(err);
    }
}));



// Start GitHub authentication
router.get('/github', passport.authenticate('github', { scope: [ 'user:email' ] }));

// GitHub callback URL
router.get('/github/callback', function(req, res, next) {
    passport.authenticate('github', async function(err, user, info) {
        try{
            if (err) { return next(err); }
            if (!user) { return res.redirect('/login'); }
    
            // Check if this is for linking accounts
            if (req.query.state === 'link') {
                const sessionKey = req.cookies[cookieKey];
                const currentUser = sessionUser[sessionKey];
    
                if (!currentUser) {
                    return res.status(401).json({ error: 'Unauthorized' });
                }
    
                // Find the currently logged-in user
                let existingUser = await User.findOne({ username: currentUser.username });
    
                // Check if the GitHub account is already linked
                if (existingUser.auth.some(a => a.provider === 'github' && a.id === user.auth[0].id)) {
                    return res.status(400).json({ error: 'GitHub account already linked' });
                }
    
                // Merge the auth info
                existingUser.auth.push(user.auth[0]);
                await existingUser.save();
    
                // Optionally, remove the standalone GitHub user if it exists
                await User.deleteOne({ username: user.username });
    
                res.redirect('/profile_page'); // Redirect to the profile page
            } else {
                // Regular login with GitHub
                const sessionKey = md5('mySecretMessage' + new Date().getTime() + user.username);
                sessionUser[sessionKey] = { username: user.username };
        
                res.cookie(cookieKey, sessionKey, { maxAge: 3600 * 1000, httpOnly: true, sameSite: 'None', secure: true });
                        res.redirect('/'); // Redirect to the homepage
            }
        } catch (error) {
            console.error('Callback error:', error);
            res.redirect('/main'); // Redirect to the homepage
        }
        
    })(req, res, next);
});


// Route to link GitHub account
router.get('/github/link', authenticate, function(req, res, next) {
    passport.authenticate('github', { scope: [ 'user:email' ], state: 'link' })(req, res, next);
});

// Route to unlink GitHub account
router.get('/github/unlink', authenticate, async (req, res) => {
    try {
        const user = await User.findOne({ username: req.username });
        user.auth = user.auth.filter(a => a.provider !== 'github');
        await user.save();
        res.redirect('/profile_page'); // Redirect to the profile page
    } catch (err) {
        res.status(500).json({ error: 'Failed to unlink GitHub account' });
    }
});




module.exports = {
  authenticate,
  authenticateOrNot,
  getHash,
  generateSaltHash,
  router,
  sessionUser
};
