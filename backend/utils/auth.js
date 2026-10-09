import jwt from 'jsonwebtoken';
export function signToken(user){return jwt.sign({id:user._id.toString(),role:user.role},process.env.JWT_SECRET,{expiresIn:'7d'});}
export function publicUser(u){const x=u.toObject?u.toObject():u; delete x.password; delete x.otpHash; delete x.resetOtpHash; delete x.otpExpiresAt; delete x.resetOtpExpiresAt; return x;}
