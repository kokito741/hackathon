const r=require('express').Router();
const c=require('../controllers/userController');
r.get('/',c.list);
r.get('/:id',c.get);
module.exports=r;