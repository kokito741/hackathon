const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

router.get('/', auth, (req, res) => {
  res.json({ message: 'Welcome to protected home!', user: req.user });
});

module.exports = router;
