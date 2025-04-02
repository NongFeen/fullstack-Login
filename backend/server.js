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
        callbackURL: `${process.env.APIURL}/auth/google/callback`
        // callbackURL: 'https://feenfeenfeen.online/api/auth/google/callback'`

    },
    async (accessToken, refreshToken, profile, done) => {
        const email = profile.emails[0].value;

        // Check if the user already exists
        db.query('SELECT * FROM users WHERE username = ?', [email], (err, results) => {
            if (err) return done(err);

            let user = results[0];

            // If user does not exist, insert into `users` and `user_profiles`
            if (!user) {
                db.query('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [email, '', 'user'], (err, result) => {
                    if (err) return done(err);

                    user = { email, role: 'user' };

                    // Get the newly inserted user_id (insertId)
                    const userId = result.insertId;

                    // Insert into user_profiles with default (blank) profile data
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

app.get('/auth/google', passport.authenticate('google', { scope: ['email', 'profile'] }));
app.get('/auth/google/callback', passport.authenticate('google', { session: false }), (req, res) => {
    res.redirect(`${process.env.WEBURL}/dashboard?token=${req.user.token}`);
  });

// Register
app.post('/register', async (req, res) => {
    console.log("registering user");
    const { username, password, role } = req.body;

    // Hash the password before saving it
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the new user into the users table
    db.query('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', 
    [username, hashedPassword, role], 
    function(err, result) {
        if (err) return res.status(500).send(err);

        const user_id = result.insertId;  // Get the inserted user_id

        // After user is created, create a blank profile in user_profiles
        const defaultProfile = {
            user_id: user_id,  // Link profile by user_id
            name: '',
            surname: '',
            email: '',  // You can store the email as the username if not provided
            age: null,
            tel: ''
        };

        db.query(
            'INSERT INTO user_profiles (user_id, name, surname, email, age, tel) VALUES (?, ?, ?, ?, ?, ?)',
            [defaultProfile.user_id, defaultProfile.name, defaultProfile.surname, defaultProfile.email, defaultProfile.age, defaultProfile.tel],
            function(err) {
                if (err) return res.status(500).send(err);

                res.json({ message: 'User registered and profile created' });
            }
        );
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

app.get('/user/profile', (req, res) => {
    const token = req.headers['authorization']; // Get token from the Authorization header
    if (!token) return res.status(403).json({ error: 'No token provided' });
  
    // Verify the token
    jwt.verify(token.split(" ")[1], process.env.JWT_SECRET, (err, decoded) => {
      if (err) return res.status(401).json({ error: 'Unauthorized' });
  
      const { username } = decoded; // Extract the username (email) from the decoded token
  
      db.query(
        'SELECT * FROM user_profiles WHERE email = ?',
        [username],
        (err, results) => {
          if (err) return res.status(500).json({ error: 'Database error' });
          if (results.length === 0) return res.status(404).json({ error: 'Profile not found' });
          res.json(results[0]); // Return the user profile
        }
      );
    });
  });
  
  // Update user profile
  app.put('/user/profile', (req, res) => {
    const token = req.headers['authorization']; // Get token from the Authorization header
    if (!token) return res.status(403).json({ error: 'No token provided' });
  
    // Verify the token
    jwt.verify(token.split(" ")[1], process.env.JWT_SECRET, (err, decoded) => {
      if (err) return res.status(401).json({ error: 'Unauthorized' });
  
      const { username } = decoded; // Extract the username (email) from the decoded token
      const { name, surname, email, age, tel } = req.body;
  
      // Check if the logged-in user is updating their own profile or if they are an admin
      if (username !== email && decoded.role !== 'admin') {
        return res.status(403).json({ error: 'You are not authorized to change this profile' });
      }
  
      // Update the user profile in the database
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
  });
  
app.listen(5000, () => console.log("Server running on port 5000 \n AUTH : ") + process.env.Google_Auth);

