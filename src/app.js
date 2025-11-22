const express = require('express');
const path = require('path'); // <-- added
require('express-async-errors');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const auth = require('./middleware/auth'); // for auth

const authRouter = require('./routes/auth');
const usersRouter = require('./routes/users');
const homeRouter = require('./routes/home');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(
  helmet({
    contentSecurityPolicy: false
  })
);
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));
app.use("/public", express.static(path.join(__dirname, "../public")));
// Health check
app.use(express.static(path.join(__dirname, '../public')));
app.use("/chat", require(path.join(__dirname, "routes/chat")));
// home protected route
app.get('/home', (req, res) => res.sendFile(path.join(__dirname, './views/home.html')));
// Root route serves login page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/login.html'));
});
// Register route serves register page
app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/register.html'));
});


// API routes
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/home', homeRouter);

// Error handling
app.use(errorHandler);

module.exports = app;
