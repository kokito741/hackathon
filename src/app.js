const express = require('express');
const path = require('path'); // <-- added
require('express-async-errors');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');

const authRouter = require('./routes/auth');
const usersRouter = require('./routes/users');
const homeRouter = require('./routes/home');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Root route serves login page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/login.html'));
});

// API routes
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/home', homeRouter);

// Error handling
app.use(errorHandler);

module.exports = app;
