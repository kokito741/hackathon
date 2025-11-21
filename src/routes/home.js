const r=require('express').Router();
const auth=require('../middleware/auth');
r.get('/',auth,(req,res)=> res.json({message:`Welcome home user #${req.user.id}`}));
module.exports=r;