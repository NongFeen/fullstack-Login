require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const mysql = require('mysql2');
const passport = require('passport');
const session = require('express-session');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const cookieParser = require('cookie-parser');
const argon2 = require('argon2');

const app = express();
const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

// Basic middleware setup
app.use(express.json());
app.use(cookieParser());

app.use(cors({
    origin: process.env.WEBURL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
  }));
// CORS configuration - set up before any routes
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin',  process.env.WEBURL);
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// Session and passport setup
app.use(session({ 
  secret: process.env.JWT_SECRET || 'your-fallback-secret', 
  resave: false, 
  saveUninitialized: true 
}));
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

// Configure cookie options
const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
    maxAge: 3600000, // 1 hour in milliseconds
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax' // Important for cross-site cookies
};

passport.use(new GoogleStrategy(
    {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.APIURL || 'http://localhost:5000'}/auth/google/callback`
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

                            const token = jwt.sign({ username: email, role: user.role }, process.env.JWT_SECRET || 'your-fallback-secret', { expiresIn: '1h' });
                            done(null, { user, token });
                        }
                    );
                });
            } else {
                const token = jwt.sign({ username: email, role: user.role }, process.env.JWT_SECRET || 'your-fallback-secret', { expiresIn: '1h' });
                done(null, { user, token });
            }
        });
    }
));

// Passport serialization/deserialization
passport.serializeUser((user, done) => {
    done(null, user);
});
  
passport.deserializeUser((user, done) => {
    done(null, user);
});

app.get('/auth/google', passport.authenticate('google', { scope: ['email', 'profile'] }));
app.get('/auth/google/callback', passport.authenticate('google', { session: false }), (req, res) => {
    // Set JWT in a cookie instead of passing in URL
    res.cookie('jwt_token', req.user.token, cookieOptions);
    res.redirect(`${process.env.WEBURL || 'http://localhost:3000'}/dashboard`);
});

const validatePassword = (password) => {
    const minLength = 8;
    const upperCase = /[A-Z]/;
    const lowerCase = /[a-z]/;
    const numbers = /[0-9]/;
    const specialChar = /[!@#$%^&*(),.?":{}|<>]/;

    if (password.length < minLength) return 'Password must be at least 8 characters long';
    if (!upperCase.test(password)) return 'Password must contain at least one uppercase letter';
    if (!lowerCase.test(password)) return 'Password must contain at least one lowercase letter';
    if (!numbers.test(password)) return 'Password must contain at least one number';
    if (!specialChar.test(password)) return 'Password must contain at least one special character';
    return null;  // If all validations pass
};

// user@example.com
// MyS3cur3P@ssword!
// Register
app.post('/register', async (req, res) => {
    console.log("registering user");

    const { username, password, role } = req.body;
    //validate format
    try {
        // Validate email format
        if (!emailRegex.test(username)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }
        const passwordValidationError = validatePassword(password);
        if (passwordValidationError) {
            return res.status(400).json({ message: passwordValidationError });
        }
    } catch (error) {
        console.log(error)
    }

    // Validate password based on OWASP guidelines

    try {
        // Hash the password before saving it
        const hashedPassword = await argon2.hash(password);

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
                email: username,  // You can store the email as the username if not provided
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
    } catch (err) {
        console.error(err);
        res.status(500).send('Error registering user');
    }
});

// Login
app.post('/login', (req, res) => {
    console.log("try logging in");
    const { username, password } = req.body;
    db.query('SELECT * FROM users WHERE username = ?', [username], async (err, users) => {
        if (err || users.length === 0) return res.status(401).json({ message: 'User not found' });

        const user = users[0];  
        if (!await argon2.verify(user.password,password )) 
            return res.status(401).json({ message: 'Invalid credentials' });
        
        // Generate JWT token and set it as a cookie
        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'your-fallback-secret', { expiresIn: '1h' });
        console.log("jwt_token : "+ token);
        
        // Updated cookie options for development environment
        const cookieOptions = {
            httpOnly: true,
            secure: false, // Set to false for http in development
            maxAge: 3600000, // 1 hour
            sameSite: 'lax',
            path: '/' // Ensure cookie is available for the entire site
        };
        
        res.cookie('jwt_token', token, cookieOptions);
        
        // Also send token in response body as a backup
        res.json({ 
            message: 'Login successful',
            token: token // Include token in response
        });
    });
});

// Middleware to verify JWT from cookies
const verifyToken = (req, res, next) => {
    const token = req.cookies.jwt_token;
    if (!token) return res.status(403).json({ message: 'No token' });

    jwt.verify(token, process.env.JWT_SECRET || 'your-fallback-secret', (err, decoded) => {
        if (err) return res.status(401).json({ message: 'Unauthorized' });
        req.user = decoded;
        next();
    });
};

// Protected Route
app.get('/dashboard', verifyToken, (req, res) => {
    console.log("requesting to dashboard");
    res.json({ role: req.user.role });
});

app.get('/user/profile', verifyToken, (req, res) => {
    const email = req.user.username; // 'username' from JWT payload (used as email)
  
    db.query(
      'SELECT * FROM user_profiles WHERE email = ?',
      [email],
      (err, results) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (results.length === 0) return res.status(404).json({ error: 'Profile not found' });
  
        res.json(results[0]); // Return user profile info
      }
    );
  });

// Update user profile
app.put('/user/profile', verifyToken, (req, res) => {
    const { id, role } = req.user;  // Get user ID from the JWT
    const { name, surname, email, age, tel } = req.body;

    // Check if the logged-in user is updating their own profile or if they are an admin
    if (id !== req.user.id && role !== 'admin') {
        return res.status(403).json({ error: 'You are not authorized to change this profile' });
    }

    // Update the user profile in the database
    db.query(
        'UPDATE user_profiles SET name = ?, surname = ?, email = ?, age = ?, tel = ? WHERE user_id = ?',
        [name, surname, email, age, tel, id], // Use user_id from JWT instead of email
        (err, results) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            if (results.affectedRows === 0) return res.status(404).json({ error: 'Profile not found' });
            res.json({ message: 'Profile updated successfully' });
        }
    );
});

// Logout route
app.get('/logout', (req, res) => {
    res.clearCookie('jwt_token');
    res.json({ message: 'Logged out successfully' });
});

app.get('/redirect-dashboard', verifyToken, (req, res) => {
    const role = req.user.role;
  
    if (role === 'admin') {
      res.json({ redirect: '/admin-dashboard' });
    } else if (role === 'manager') {
      res.json({ redirect: '/manager-dashboard' });
    } else if (role === 'user') {
      res.json({ redirect: '/user-dashboard' });
    } else {
      res.status(403).json({ message: 'Unknown role' });
    }
  });

app.get('/auth/me', verifyToken, (req, res) => {
    console.log("retive you own data");
    try {
        const { role, username } = req.user;
        res.json({ role, username });
        
    } catch (error) {
        console.log("retive you own data");
        
    }
});
app.listen(5000, () => console.log("Server running on port 5000"));
