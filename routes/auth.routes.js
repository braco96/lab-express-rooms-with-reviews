// Routes responsible for user authentication: signup, login and logout.

const express = require('express');
const bcrypt = require('bcryptjs'); // Library to hash and compare passwords
const User = require('../models/User');

const router = express.Router();

// GET /signup - render the signup form
router.get('/signup', (req, res) => {
  res.render('auth/signup', { user: req.session.currentUser });
});

// POST /signup - process form and create a new user
router.post('/signup', async (req, res, next) => {
  try {
    const { email, password, fullName } = req.body;

    // Basic validation: ensure all fields were provided
    if (!email || !password || !fullName) {
      return res.render('auth/signup', { errorMessage: 'All fields are mandatory.', user: req.session.currentUser });
    }

    // Hash the password so we never store plain text passwords in the DB
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user document in MongoDB
    await User.create({ email, password: hashedPassword, fullName });

    res.redirect('/login'); // Redirect to the login page after successful signup
  } catch (error) {
    next(error); // Forward any error to the error handler
  }
});

// GET /login - render login form
router.get('/login', (req, res) => {
  res.render('auth/login', { user: req.session.currentUser });
});

// POST /login - authenticate the user
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.render('auth/login', { errorMessage: 'Invalid credentials.', user: req.session.currentUser });
    }

    // Compare the provided password with the hashed one in the database
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.render('auth/login', { errorMessage: 'Invalid credentials.', user: req.session.currentUser });
    }

    // Save user info in the session to persist login
    req.session.currentUser = user;

    res.redirect('/rooms');
  } catch (error) {
    next(error);
  }
});

// POST /logout - remove the user from the session
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

module.exports = router;
