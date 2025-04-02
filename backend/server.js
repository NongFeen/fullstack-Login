require('dotenv').config();
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const mysql = require('mysql2');
const passport = require('passport');
const session = require('express-session');
const cookieParser = require('cookie-parser'); // Required for handling cookies
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const app = express();
app.use(express.json());
app.use(cookieParser()); // Enable cookie parsing
app.use(cors({ origin: 'https://feenfeenfeen.online', credentials: true })); // Allow frontend to send cookies
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
console.log("Connecting to database...");
db.connect(err => {
    if (err) {
        console.error('Database connection failed:', err);
        return;
    }
    console.log("MySQL Connected...");
});

// Google OAuth Strategy
passport.use(new GoogleStrategy(
    {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: 'https://feenfeenfeen.online/api/auth/google/callback'
    },
    async (accessToken, refreshToken, profile, done) => {
        const email = profile.emails[0].value;

        // Check if user exists
        db.query('SELECT * FROM users WHERE username = ?', [email], (err, results) => {
            if (err) return done(err);

            let user = results[0];

            // If user doesn't exist, create one
            if (!user) {
                db.query('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [email, '', 'user'], (err, result) => {
                    if (err) return done(err);

                    user = { email, role: 'user' };
                    const userId = result.insertId;

                    // Create blank profile
                    db.query(
                        'INSERT INTO user_profiles (user_id, name, surname, email, age, tel) VALUES (?, ?, ?, ?, ?, ?)',
                        [userId, '', '', email, null, ''],
                        (err) => {
                            if (err) return done(err);

                            const token = jwt.sign({ username: email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
                            done(null, { user, token });
                        }
                    );
                });
            } else {
                const token = jwt.sign({ username: email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
                done(null, { user, token });
            }
        });
    }
));

// Google Authentication Routes
app.get('/auth/google', passport.authenticate('google', { scope: ['email', 'profile'] }));

app.get('/auth/google/callback', passport.authenticate('google', { session: false }), (req, res) => {
    res.cookie('token', req.user.token, {
        httpOnly: true,
        secure: true,
        sameSite: 'Strict',
        maxAge: 7200000 // 1 hour
    });
    res.redirect('https://feenfeenfeen.online/dashboard');
});

// Register Route
app.post('/register', async (req, res) => {
    console.log("Registering user...");
    const { username, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    db.query('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', 
    [username, hashedPassword, role], 
    function(err, result) {
        if (err) return res.status(500).send(err);

        const user_id = result.insertId; 

        db.query(
            'INSERT INTO user_profiles (user_id, name, surname, email, age, tel) VALUES (?, ?, ?, ?, ?, ?)',
            [user_id, '', '', '', null, ''],
            function(err) {
                if (err) return res.status(500).send(err);
                res.json({ message: 'User registered successfully' });
            }
        );
    });
});

// Login Route
app.post('/login', (req, res) => {
    console.log("User logging in...");
    const { username, password } = req.body;
    db.query('SELECT * FROM users WHERE username = ?', [username], async (err, users) => {
        if (err || users.length === 0) return res.status(401).json({ message: 'User not found' });

        const user = users[0];
        if (!await bcrypt.compare(password, user.password)) 
            return res.status(401).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'Strict',
            maxAge: 3600000
        });

        res.json({ message: "Login successful" });
    });
});

// Logout Route (Clears Cookie)
app.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ message: "Logged out successfully" });
});

// Middleware for Protecting Routes
const verifyToken = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) return res.status(403).json({ message: 'No token provided' });

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ message: 'Unauthorized' });
        req.user = decoded;
        next();
    });
};

// Protected Route (Requires Authentication)
app.get('/dashboard', verifyToken, (req, res) => {
    res.json({ role: req.user.role });
});

// Get User Profile (Protected)
app.get('/user/profile', verifyToken, (req, res) => {
    const { username } = req.user;

    db.query(
        'SELECT * FROM user_profiles WHERE email = ?',
        [username],
        (err, results) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            if (results.length === 0) return res.status(404).json({ error: 'Profile not found' });
            res.json(results[0]);
        }
    );
});

// Update User Profile (Protected)
app.put('/user/profile', verifyToken, (req, res) => {
    const { username, role } = req.user;
    const { name, surname, email, age, tel } = req.body;

    if (username !== email && role !== 'admin') {
        return res.status(403).json({ error: 'You are not authorized to update this profile' });
    }

    db.query(
        'UPDATE user_profiles SET name = ?, surname = ?, email = ?, age = ?, tel = ? WHERE email = ?',
        [name, surname, email, age, tel, username],
        (err, results) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            if (results.affectedRows === 0) return res.status(404).json({ error: 'Profile not found' });
            res.json({ message: 'Profile updated successfully' });
        }
    );
});

// Start Server
app.listen(5000, () => console.log("Server running on port 5000"));