import {Router} from 'express';
import {register,registerBusiness,verifyOtp,resendOtp,login,me,forgotPassword,resendResetOtp,verifyResetOtp,resetPassword} from '../controllers/authController.js';
import {auth} from '../middleware/auth.js';
import rateLimit from 'express-rate-limit';

const r=Router();
const sendOtpLimit=rateLimit({windowMs:15*60*1000,max:10,standardHeaders:true,legacyHeaders:false,message:{message:'Too many OTP requests. Please try again later.'}});
const verifyOtpLimit=rateLimit({windowMs:15*60*1000,max:20,standardHeaders:true,legacyHeaders:false,message:{message:'Too many OTP verification attempts. Please try again later.'}});
const passwordLimit=rateLimit({windowMs:15*60*1000,max:10,standardHeaders:true,legacyHeaders:false,message:{message:'Too many password recovery requests. Please try again later.'}});

r.post('/register',sendOtpLimit,register);
r.post('/register-business',sendOtpLimit,registerBusiness);
r.post('/login',login);
r.post('/verify-otp',verifyOtpLimit,verifyOtp);
r.post('/resend-otp',sendOtpLimit,resendOtp);
r.post('/forgot-password',passwordLimit,forgotPassword);
r.post('/forgot-password-otp',verifyOtpLimit,verifyResetOtp);
r.post('/forgot-password-resend',sendOtpLimit,resendResetOtp);
r.post('/reset-password',verifyOtpLimit,resetPassword);
r.get('/me',auth,me);
export default r;
