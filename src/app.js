const express = require('express');
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
app.use(express.static('public'));

app.get('/health', (req,res)=>res.json({status:'ok'}));

app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/home', homeRouter);

app.use(errorHandler);

module.exports = app;