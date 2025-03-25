require('dotenv').config();
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const mysql = require('mysql2');
const { OAuth2Client } = require('google-auth-library');

const app = express();
app.use(express.json());
app.use(cors());

// Database Connection
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: '',
    database: process.env.DB_database
});

console.log("connecting to database");
db.connect(err => {

    if (err) {
        console.error('Database connection failed:', err);
        return;
    }
    console.log("MySQL Connected...");
});

// Google OAuth2 Client setup
const googleClient = new OAuth2Client(process.env.Google_Auth);

// Register
app.post('/register', async (req, res) => {
    console.log("registering user");
    const { username, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    db.query('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', 
    [username, hashedPassword, role], (err) => {
        if (err) return res.status(500).send(err);
        res.json({ message: 'User registered' });
    });
});

// Login
app.post('/login', (req, res) => {
    console.log("try logging in");
    const { username, password } = req.body;
    db.query('SELECT * FROM users WHERE username = ?', [username], async (err, users) => {
        if (err || users.length === 0) return res.status(401).json({ message: 'User not found' });

        const user = users[0];
        if (!await bcrypt.compare(password, user.password)) 
            return res.status(401).json({ message: 'Invalid credentials' });
        // Generate JWT token 
        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    });
});

// Google Login
app.get('/google-login', (req, res) => {
    const googleAuthUrl = googleClient.generateAuthUrl({
        access_type: 'offline', // offline means you'll get a refresh token too
        scope: ['openid', 'profile', 'email'],
        redirect_uri: process.env.GOOGLE_REDIRECT_URI // this should be your backend callback URL
    });
    res.json({ authUrl: googleAuthUrl });
});

// Google OAuth2 Callback (redirect after user logs in)
app.get('/google-callback', async (req, res) => {
    const code = req.query.code;
    try {
        const { tokens } = await googleClient.getToken(code);
        googleClient.setCredentials(tokens);

        const ticket = await googleClient.verifyIdToken({
            idToken: tokens.id_token,
            audience: process.env.Google_Auth,  // Your Google Client ID
        });
        const payload = ticket.getPayload();

        // Check if the user exists in the database, otherwise create them
        db.query('SELECT * FROM users WHERE username = ?', [payload.email], (err, users) => {
            if (err) return res.status(500).send(err);
            
            let user = users[0];
            if (!user) {
                // Create a new user if not found
                db.query('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', 
                [payload.email, '', 'user'], (err, result) => {
                    if (err) return res.status(500).send(err);

                    user = { id: result.insertId, username: payload.email, role: 'user' };
                    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
                    res.json({ token });
                });
            } else {
                // User exists, generate JWT token
                const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
                res.json({ token });
            }
        });
    } catch (error) {
        res.status(400).send('Invalid Google Token');
    }
});

//old googlelogin
app.post('/google-login', async (req, res) => {
    console.log("logging in with google");
    const { token } = req.body;
    try {
        const ticket = await googleClient.verifyIdToken({
            idToken: token,
            audience: process.env.Google_Auth,  // Your Google Client ID
        });
        const payload = ticket.getPayload();

        // Check if the user exists in the database, otherwise create them
        db.query('SELECT * FROM users WHERE username = ?', [payload.email], (err, users) => {
            if (err) return res.status(500).send(err);
            
            let user = users[0];
            if (!user) {
                // Create a new user if not found
                db.query('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', 
                [payload.email, '', 'user'], (err, result) => {
                    if (err) return res.status(500).send(err);

                    user = { id: result.insertId, username: payload.email, role: 'user' };
                    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
                    res.json({ token });
                });
            } else {
                // User exists, generate JWT token
                const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
                res.json({ token });
            }
        });
    } catch (error) {
        res.status(400).send('Invalid Google Token');
    }
});

// Protected Route
app.get('/dashboard', (req, res) => {
    console.log("requesting to dashboard");
    const token = req.headers['authorization'];
    if (!token) return res.status(403).json({ message: 'No token' });

    jwt.verify(token.split(" ")[1], process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ message: 'Unauthorized' });
        res.json({ role: decoded.role });
    });
});

app.listen(5000, () => console.log("Server running on port 5000 \nREACTGGAUTH : " + process.env.REACT_APP_Google_Auth ) + "\n AUTH : " + process.env.Google_Auth);

