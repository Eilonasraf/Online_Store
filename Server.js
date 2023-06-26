//Import necessary modules
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
require('dotenv').config(); // Load environment variables from a .env file into process.env

const session = require('express-session');

// Instantiate an express app
const app = express();

const userController = require('./controllers/userController');

app.use(
  session({
    secret: 'Ri0505838397o',
    resave: false,
    saveUninitialized: true,
  })
);


app.use(
  "/css",
  express.static(path.join(__dirname, "node_modules/bootstrap/dist/css"))
);
app.use(
  "/js",
  express.static(path.join(__dirname, "node_modules/bootstrap/dist/js"))
);
app.use("/js", express.static(path.join(__dirname, "node_modules/jquery/dist")));

// Set view engine to EJS and views directory
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Connect to MongoDB using the connection string stored in the environment variable
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB'); // Log a success message if the connection is successful
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error); 
    // Log an error message if there's an error connecting to MongoDB
  });

// Middleware to serve static files from 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to parse incoming requests with JSON payloads and form data
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

const methodOverride = require('method-override');
app.use(methodOverride('_method'));

// Import routes
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');

// Use imported routes with base paths
app.use('/products', productRoutes);
app.use('/users', userRoutes);

// Middleware to check if user is logged in
function checkLoggedIn(req, res, next) {
  if (req.session.user) {
    // User is logged in
    next(); // Proceed to the next middleware or route handler
  } else {
    // User is not logged in, redirect to the login page
    res.redirect('/login');
  }
}

// handle these routes in Express application
app.get('/signup', (req, res) => {
  res.render('users/signup', { user: req.session.user });
});

app.post('/signup', userController.createUser);

app.get('/login', (req, res) => {
  res.render('users/login');
});

// Protected route: only accessible if user is logged in
app.get('/admin', checkLoggedIn, checkAdmin, (req, res) => {
  res.render('users/admin');
});

app.get('/user', checkLoggedIn, (req, res) => {
  res.render('user', { user: req.session.user });
});

// Middleware to check if user is an admin
function checkAdmin(req, res, next) {
  if (req.session.user && req.session.user.isAdmin) {
      next();
  } else {
      res.status(403).json({ error: 'You do not have admin access' });
  }
}

app.get('/', (req, res) => {
  const user = req.session.user; // Get the user object from the session
  res.render('Store', { user }); // Pass the user object to the view
});

// Start the server and listen on port 5500
app.listen(5500, () => {
  console.log('Server is running on port 5500');
});
