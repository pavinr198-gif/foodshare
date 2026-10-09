import crypto from 'crypto';
export function generateOtp(){return String(crypto.randomInt(100000,1000000));}
export function hashOtp(otp){return crypto.createHash('sha256').update(otp).digest('hex');}
export function otpExpiry(){return new Date(Date.now()+Number(process.env.OTP_EXPIRY_MINUTES||10)*60000);}
