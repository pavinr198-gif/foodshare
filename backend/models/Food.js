import mongoose from 'mongoose';
const loc={address:{type:String,required:true,trim:true},latitude:{type:Number,required:true,min:-90,max:90},longitude:{type:Number,required:true,min:-180,max:180}};
const foodSchema=new mongoose.Schema({
 business:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true,index:true},
 foodName:{type:String,required:true,trim:true,maxlength:120},category:{type:String,required:true,trim:true},description:{type:String,trim:true,maxlength:1000},
 foodType:{type:String,enum:['VEG','NON-VEG','EGG','VEGAN'],required:true},ingredients:[{type:String,trim:true}],allergens:[{type:String,trim:true}],additionalAllergenInfo:{type:String,trim:true,maxlength:500},
 quantity:{type:Number,required:true,min:1},preparationTime:{type:String,required:true},availableUntil:{type:Date,required:true},pickupLocation:loc,image:{type:String},
 status:{type:String,enum:['Draft','Active','Expired','Removed'],default:'Draft'}
},{timestamps:true});
foodSchema.index({status:1,availableUntil:1});
export default mongoose.model('Food',foodSchema);
