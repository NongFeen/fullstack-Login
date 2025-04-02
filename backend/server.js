require('dotenv').config();
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const mysql = require('mysql2');
const passport = require('passport');
const session = require('express-session');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const app = express();
app.use(express.json());
app.use(cors());
app.use(session({ secret: process.env.JWT_SECRET, resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

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

passport.use(new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: 'https://feenfeenfeen.online/api/auth/google/callback'
    },
    async (accessToken, refreshToken, profile, done) => {
      const email = profile.emails[0].value;
      db.query('SELECT * FROM users WHERE username = ?', [email], (err, results) => {
        if (err) return done(err);
        let user = results[0];
        if (!user) {
          db.query('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [email,'', 'user'], (err) => {
            if (err) return done(err);
            user = { email, role: 'user' };
            const token = jwt.sign({ username: email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
            done(null, { user, token });
          });
        } else {
          const token = jwt.sign({ username: email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
          done(null, { user, token });
        }
      });
    }
  ));
app.get('/auth/google', passport.authenticate('google', { scope: ['email', 'profile'] }));
app.get('/auth/google/callback', passport.authenticate('google', { session: false }), (req, res) => {
    res.redirect(`https://feenfeenfeen.online/dashboard?token=${req.user.token}`);
  });

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

app.listen(5000, () => console.log("Server running on port 5000 \n AUTH : ") + process.env.Google_Auth);

