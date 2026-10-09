import jwt from 'jsonwebtoken';
import User from '../models/User.js';
export async function optionalAuth(req,res,next){
  try{
    const h=req.headers.authorization||'';
    if(h.startsWith('Bearer ')){
      const p=jwt.verify(h.slice(7),process.env.JWT_SECRET);
      const user=await User.findById(p.id);
      if(user && user.status!=='Blocked') req.user=user;
    }
  }catch{}
  next();
}
