import mongoose from 'mongoose';
const userSchema=new mongoose.Schema({
 name:{type:String,required:true,trim:true,maxlength:100},
 email:{type:String,required:true,unique:true,lowercase:true,trim:true},
 phone:{type:String,trim:true},
 password:{type:String,required:true},
 role:{type:String,enum:['admin','user','business'],default:'user'},
 businessName:{type:String,trim:true},
 businessType:{type:String,enum:['Hotel','Restaurant','Catering / Event Management Business']},
 ownerName:{type:String,trim:true},
 address:{type:String,trim:true},
 fssaiNumber:{type:String,trim:true},
 fssaiVerified:{type:Boolean,default:false},
 location:{address:String,latitude:Number,longitude:Number},
 status:{type:String,enum:['Pending','Approved','Rejected','Blocked'],default:'Pending'},
 isEmailVerified:{type:Boolean,default:false},
 otpHash:String,otpExpiresAt:Date,otpPurpose:String,otpSentAt:Date,
 resetOtpHash:String,resetOtpExpiresAt:Date,resetOtpVerifiedAt:Date,resetOtpSentAt:Date,
 createdAt:{type:Date,default:Date.now}
},{timestamps:true});
export default mongoose.model('User',userSchema);
