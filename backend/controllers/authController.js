import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import {generateOtp,hashOtp,otpExpiry} from '../utils/otp.js';
import {sendOtpEmail} from '../utils/email.js';
import {signToken,publicUser} from '../utils/auth.js';import {emailOk,passwordOk,otpOk,fssaiOk,phoneOk} from '../utils/validation.js';

const bad=(message,status=400)=>Object.assign(new Error(message),{status});

async function createAccount(data,role){
  const email=String(data.email||'').trim().toLowerCase();
  if(!emailOk(email)) throw bad('Valid email is required');
  if(!passwordOk(data.password)) throw bad('Password must be 8 to 128 characters');
  if(!phoneOk(data.phone)) throw bad('Enter a valid phone number');
  if(await User.findOne({email})) throw bad('Email already registered',409);

  const otp=generateOtp();
  const user=new User({
    ...data,email,
    password:await bcrypt.hash(data.password,12),
    role,
    status:role==='business'?'Pending':'Pending',
    isEmailVerified:false,
    otpHash:hashOtp(otp),
    otpExpiresAt:otpExpiry(),
    otpPurpose:'verification',
    otpSentAt:new Date()
  });

  await sendOtpEmail(user.email,otp,'verification',user.name);
  await user.save();
  return user;
}

export async function register(req,res,next){
  try{
    const u=await createAccount({
      name:req.body.name,
      email:req.body.email,
      phone:req.body.phone,
      password:req.body.password
    },'user');
    res.status(201).json({message:'Registration successful. OTP sent.',email:u.email});
  }catch(e){next(e)}
}

export async function registerBusiness(req,res,next){
  try{
    const b=req.body;
    if(!['Hotel','Restaurant','Catering / Event Management Business'].includes(b.businessType)) throw bad('Invalid business type');
    if(!fssaiOk(b.fssaiNumber)) throw bad('FSSAI number must be exactly 14 digits');
    const lat=Number(b.latitude),lon=Number(b.longitude);
    if(!Number.isFinite(lat)||lat<-90||lat>90||!Number.isFinite(lon)||lon<-180||lon>180) throw bad('Valid business coordinates are required');

    const u=await createAccount({
      name:b.ownerName,
      email:b.email,
      businessName:b.businessName,
      businessType:b.businessType,
      ownerName:b.ownerName,
      phone:b.phone,
      password:b.password,
      address:b.address,
      fssaiNumber:b.fssaiNumber,
      location:{address:b.address,latitude:lat,longitude:lon}
    },'business');

    res.status(201).json({message:'Business registered. Verify your email, then wait for admin approval.',email:u.email});
  }catch(e){next(e)}
}

export async function verifyOtp(req,res,next){
  try{
    const email=String(req.body.email||'').trim().toLowerCase();
    const u=await User.findOne({email});
    if(!u||u.otpPurpose!=='verification'||!u.otpHash) return res.status(400).json({message:'Verification OTP not found'});
    if(!u.otpExpiresAt||u.otpExpiresAt.getTime()<Date.now()) return res.status(400).json({message:'OTP expired. Please request a new OTP.'});
    if(hashOtp(String(req.body.otp||''))!==u.otpHash) return res.status(400).json({message:'Invalid OTP'});

    u.isEmailVerified=true;
    u.otpHash=undefined;
    u.otpExpiresAt=undefined;
    u.otpPurpose=undefined;
    u.otpSentAt=undefined;
    if(u.role==='user') u.status='Approved';
    await u.save();

    const token=u.role==='user' ? signToken(u) : null;
    res.json({
      message:u.role==='business'?'Email verified. Your account is waiting for admin approval.':'Email verified successfully.',
      token,
      user:token?publicUser(u):undefined,
      status:u.status,
      role:u.role
    });
  }catch(e){next(e)}
}

export async function resendOtp(req,res,next){
  try{
    const email=String(req.body.email||'').trim().toLowerCase();
    const u=await User.findOne({email});
    if(!u) return res.status(404).json({message:'Account not found'});
    if(u.isEmailVerified) return res.status(400).json({message:'Email is already verified'});
    if(u.otpSentAt && Date.now()-u.otpSentAt.getTime()<30000) return res.status(429).json({message:'Please wait 30 seconds before requesting another OTP.'});

    const otp=generateOtp();
    u.otpHash=hashOtp(otp);
    u.otpExpiresAt=otpExpiry();
    u.otpPurpose='verification';
    u.otpSentAt=new Date();
    await sendOtpEmail(u.email,otp,'verification',u.name);
    await u.save();
    res.json({message:'A new OTP has been sent.'});
  }catch(e){next(e)}
}

export async function login(req,res,next){
  try{
    const email=String(req.body.email||'').trim().toLowerCase();
    const u=await User.findOne({email});
    if(!u||!(await bcrypt.compare(req.body.password||'',u.password))) return res.status(401).json({message:'Invalid email or password'});
    if(u.status==='Blocked') return res.status(403).json({message:'Your account has been blocked by Admin.'});
    if(!u.isEmailVerified) return res.status(403).json({message:'Please verify your email first.',code:'EMAIL_NOT_VERIFIED',email:u.email});
    if(u.role==='business'&&u.status!=='Approved') return res.status(403).json({message:`Business approval status: ${u.status}.`,code:'BUSINESS_NOT_APPROVED',status:u.status});
    if(u.role==='admin'&&u.status!=='Approved') return res.status(403).json({message:'Admin account is not active.'});
    const token=signToken(u);
    res.json({token,user:publicUser(u)});
  }catch(e){next(e)}
}

export async function me(req,res){res.json({user:publicUser(req.user)})}

export async function forgotPassword(req,res,next){
  try{
    const email=String(req.body.email||'').trim().toLowerCase();
    const u=await User.findOne({email});
    if(u){
      const otp=generateOtp();
      u.resetOtpHash=hashOtp(otp);
      u.resetOtpExpiresAt=otpExpiry();
      u.resetOtpVerifiedAt=undefined;
      u.resetOtpSentAt=new Date();
      await sendOtpEmail(u.email,otp,'reset',u.name);
      await u.save();
    }
    res.json({message:'If the email exists, a reset OTP has been sent.'});
  }catch(e){next(e)}
}

export async function resendResetOtp(req,res,next){
  try{
    const email=String(req.body.email||'').trim().toLowerCase();
    const u=await User.findOne({email});
    if(u?.resetOtpSentAt && Date.now()-u.resetOtpSentAt.getTime()<30000) return res.status(429).json({message:'Please wait 30 seconds before requesting another OTP.'});
    if(u){
      const otp=generateOtp();
      u.resetOtpHash=hashOtp(otp); u.resetOtpExpiresAt=otpExpiry(); u.resetOtpVerifiedAt=undefined; u.resetOtpSentAt=new Date();
      await sendOtpEmail(u.email,otp,'reset',u.name); await u.save();
    }
    res.json({message:'If the email exists, a new reset OTP has been sent.'});
  }catch(e){next(e)}
}

export async function verifyResetOtp(req,res,next){
  try{
    const email=String(req.body.email||'').trim().toLowerCase();
    const u=await User.findOne({email});
    if(!u||!u.resetOtpHash) return res.status(400).json({message:'Invalid reset request'});
    if(!u.resetOtpExpiresAt||u.resetOtpExpiresAt.getTime()<Date.now()) return res.status(400).json({message:'OTP expired'});
    if(!otpOk(req.body.otp)) return res.status(400).json({message:'OTP must be exactly 6 digits'});
    if(hashOtp(String(req.body.otp||''))!==u.resetOtpHash) return res.status(400).json({message:'Invalid OTP'});
    u.resetOtpVerifiedAt=new Date();
    await u.save();
    res.json({message:'OTP verified. You may now create a new password.'});
  }catch(e){next(e)}
}

export async function resetPassword(req,res,next){
  try{
    const email=String(req.body.email||'').trim().toLowerCase();
    const u=await User.findOne({email});
    if(!u||!u.resetOtpHash||!u.resetOtpExpiresAt||u.resetOtpExpiresAt.getTime()<Date.now()||!u.resetOtpVerifiedAt||u.resetOtpVerifiedAt.getTime()<Date.now()-10*60*1000||hashOtp(String(req.body.otp||''))!==u.resetOtpHash) return res.status(400).json({message:'Please verify a valid reset OTP first'});
    if(!passwordOk(req.body.password)) return res.status(400).json({message:'Password must be 8 to 128 characters'});
    u.password=await bcrypt.hash(req.body.password,12);
    u.resetOtpHash=undefined;
    u.resetOtpExpiresAt=undefined;
    u.resetOtpVerifiedAt=undefined;
    u.resetOtpSentAt=undefined;
    await u.save();
    res.json({message:'Password reset successful. You can now login.'});
  }catch(e){next(e)}
}
