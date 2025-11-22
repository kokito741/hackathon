const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const h = req.headers.authorization;
  if (!h) return res.status(401).json({ error: 'missing token' });

  const jwtSecret = process.env.JWT_SECRET || 'localdevsecret123';

  try {
    const token = h.split(' ')[1];
    console.log('Token received in middleware:', token);
    console.log('JWT_SECRET used in middleware:', jwtSecret);
    req.user = jwt.verify(token, jwtSecret);
    next();
  } catch (e) {
    res.status(401).json({ error: 'invalid token' });
  }
};
