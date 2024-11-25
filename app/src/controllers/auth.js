const express = require('express');
const md5 = require('md5');
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const { User, Profile } = require('../models/db');

const router = express.Router();
const cookieKey = 'sid';
const sessionUser = {};

// GitHub OAuth Config
// const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
// const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;


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
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        // console.log(user);
        const hash = getHash(password, user.salt);
        // console.log('compare',user.hash, hash);
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



// // Configure GitHub Strategy
// passport.use(new GitHubStrategy({
//     clientID: GITHUB_CLIENT_ID,
//     clientSecret: GITHUB_CLIENT_SECRET,
//     callbackURL: "http://localhost:3000/auth/github/callback"
//   },
//   async function(accessToken, refreshToken, profile, done) {
//     try {
//       // Check if user exists with GitHub auth
//       let user = await User.findOne({ 
//         'auth.github': profile.username 
//       });

//       if (!user) {
//         // Create new user if doesn't exist
//         const username = `github_${profile.username}`;
//         user = new User({
//           username,
//           auth: { github: profile.username }
//         });
//         await user.save();

//         // Create profile
//         const newProfile = new Profile({
//           username,
//           email: profile.emails?.[0]?.value
//         });
//         await newProfile.save();
//       }
//       done(null, user);
//     } catch (err) {
//       done(err, null);
//     }
//   }
// ));

// // GitHub auth routes
// router.get('/github',
//   passport.authenticate('github', { scope: [ 'user:email' ] })
// );

// router.get('/github/callback',
//   passport.authenticate('github', { failureRedirect: '/login' }),
//   function(req, res) {
//     // Success - create session
//     const sessionKey = md5('mySecretMessage' + new Date().getTime() + req.user.username);
//     sessionUser[sessionKey] = { username: req.user.username };
//     res.cookie(cookieKey, sessionKey, { maxAge: 3600 * 1000, httpOnly: true });
//     res.redirect('/');
//   }
// );

// // Link accounts
// router.post('/link/github', authenticate, async (req, res) => {
//   try {
//     const { githubUsername } = req.body;
//     const user = await User.findOne({ username: req.username });
    
//     // Check if GitHub account already linked to another user
//     const existingUser = await User.findOne({ 'auth.github': githubUsername });
//     if (existingUser && existingUser.username !== req.username) {
//       return res.status(400).json({ error: 'GitHub account already linked to another user' });
//     }

//     // Add GitHub auth to existing user
//     if (!user.auth) user.auth = {};
//     user.auth.github = githubUsername;
//     await user.save();

//     res.json({ message: 'Account linked successfully' });
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to link account' });
//   }
// });

// // Unlink GitHub account
// router.delete('/unlink/github', authenticate, async (req, res) => {
//   try {
//     const user = await User.findOne({ username: req.username });
//     if (user.auth && user.auth.github) {
//       delete user.auth.github;
//       await user.save();
//     }
//     res.json({ message: 'Account unlinked successfully' });
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to unlink account' });
//   }
// });

// Keep existing endpoints...

module.exports = {
  authenticate,
  authenticateOrNot,
  getHash,
  generateSaltHash,
  router,
  sessionUser
};
