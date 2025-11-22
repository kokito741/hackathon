const jwt=require('jsonwebtoken');
module.exports=(req,res,next)=>{
  const h=req.headers.authorization;
  if(!h) return res.status(401).json({error:'missing token'});
  const jwtSecret = process.env.JWT_SECRET || 'localdevsecret123';
  try{
    req.user=jwt.verify(h.split(' ')[1], jwtSecret);
    console.log('Middleware JWT_SECRET:', process.env.JWT_SECRET);
    console.log('Token received:', h.split(' ')[1]);
    next();
  }catch(e){ res.status(401).json({error:'invalid token'}); 
}
};