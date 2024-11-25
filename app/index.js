const express = require('express');
const cookieParser = require('cookie-parser');
const { router} = require('./src/controllers/auth'); 
const articleRoutes = require('./src/controllers/articles');
const profileRouter = require('./src/controllers/profile');
const followRouter = require('./src/controllers/following');
const cors = require('cors');
const path = require('path');

// const { Profile, Article } = require('./db');

const app = express();

app.use(
    cors({
      origin: 'http://localhost:8000', // Your frontend URL
      credentials: true, // Allow cookies and credentials
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type'], // Allow Content-Type header
    })
  );
  
app.use(express.json());
app.use(cookieParser());



// Use the auth routes
app.use('/auth', router);
app.use('/articles', articleRoutes);
app.use('/profile',profileRouter);
app.use('/following',followRouter);

app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome</title>
        </head>
        <body>
            <h1>Welcome to my homework!</h1>
            <p>please use postman to login.</p>
            <p>the login info is in the README.md file</p>
        </body>
        </html>
    `);
});


// Serve static files from the React frontend app
app.use(express.static(path.join(__dirname, 'frontend/build')));

// Handle any requests that don't match the above
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/build', 'index.html'));
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

module.exports = app;