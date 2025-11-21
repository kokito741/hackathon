const User = require('../models/userModel');
exports.list = async (req,res)=> res.json(await User.findAll());
exports.get = async (req,res)=> {
  const u = await User.findById(req.params.id);
  if(!u) return res.status(404).json({error:'not found'});
  res.json(u);
};