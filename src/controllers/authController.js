const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

exports.register = async (req,res)=>{
  const {name,email,password} = req.body;
  if(!name||!email||!password) return res.status(400).json({error:'missing fields'});
  const existing = await User.findByEmail(email);
  if(existing) return res.status(400).json({error:'email exists'});
  const hashed = await bcrypt.hash(password,10);
  const user = await User.create({name,email,password:hashed});
  res.status(201).json({message:'registered', user});
};

exports.login = async (req,res)=>{
  const {email,password} = req.body;
  const user = await User.findByEmail(email);
  if(!user) return res.status(400).json({error:'invalid creds'});
  const ok = await bcrypt.compare(password,user.password);
  if(!ok) return res.status(400).json({error:'invalid creds'});
  const token = jwt.sign({id:user.id}, process.env.JWT_SECRET,{expiresIn:'2h'});
  res.json({message:'logged in',token});
};