// Main application file for Rooms App with Reviews.
// We set up express, connect to MongoDB, configure sessions, and mount routes.

const express = require('express');            // Web framework for routing and middleware
const mongoose = require('mongoose');          // ODM to interact with MongoDB
const session = require('express-session');    // Session middleware to persist user data between requests
const MongoStore = require('connect-mongo');   // Store session information inside MongoDB
const morgan = require('morgan');              // HTTP request logger for debugging
const path = require('path');                  // Utility to work with file and directory paths
const hbs = require('hbs');                    // Handlebars templating engine for views
const cookieParser = require('cookie-parser'); // Parse cookies so we can read the session cookie

// Load environment variables from .env if present
require('dotenv').config();

// Create the express application instance
const app = express();

// ----- Database connection -----
// We connect to MongoDB using the MONGODB_URI environment variable. If the variable is
// not defined, we default to a local database called rooms-app. The connection is
// established once when the server starts.
mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost/rooms-app')
  .then(x => {
    console.log(`Connected to Mongo! Database name: "${x.connections[0].name}"`);
  })
  .catch(err => {
    console.error('Error connecting to mongo: ', err);
  });

// ----- Middleware configuration -----
app.use(morgan('dev'));                 // Log each request on the console for debugging
app.use(express.urlencoded({ extended: false })); // Parse URL-encoded bodies (as sent by HTML forms)
app.use(cookieParser());                // Read cookies (needed for session handling)

// Configure the session middleware so authenticated users persist across requests.
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'super-secret', // Used to sign the session ID cookie
    resave: false,                   // Avoid saving session if unmodified
    saveUninitialized: false,        // Do not save empty sessions
    cookie: { maxAge: 24 * 60 * 60 * 1000 }, // Session expiration: one day
    store: MongoStore.create({       // Store sessions in Mongo to keep them even if server restarts
      mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost/rooms-app'
    })
  })
);

// ----- View engine setup -----
// We configure Handlebars as the view engine and tell Express where the templates live.
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// Register partials folder so we can reuse snippets like the navigation bar across pages.
hbs.registerPartials(path.join(__dirname, 'views', 'partials'));

hbs.registerHelper("ifCond", function(v1, v2, options) {
  return v1 && v2 && v1.toString() === v2.toString() ? options.fn(this) : options.inverse(this);
});
hbs.registerHelper("eq", function(a, b) {
  return a && b && a.toString() === b.toString();
});

// Serve static files (e.g. CSS, client-side JS) from the public folder.
app.use(express.static(path.join(__dirname, 'public')));

// ----- Route mounting -----
// We split our routes in dedicated files for clarity.
const authRoutes = require('./routes/auth.routes');
const roomRoutes = require('./routes/room.routes');
const reviewRoutes = require('./routes/review.routes');

app.use('/', authRoutes);          // Authentication routes: signup, login, logout
app.use('/rooms', roomRoutes);     // CRUD operations for rooms
app.use('/reviews', reviewRoutes); // CRUD operations for reviews

// ----- Default route -----
// Render a simple homepage listing rooms; the controller lives in room.routes.js
app.get('/', (req, res) => {
  res.redirect('/rooms');
});

// ----- Error handling -----
// If no route handled the request, render the 404 page.
app.use((req, res) => {
  res.status(404).render('not-found', { user: req.session.currentUser });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
