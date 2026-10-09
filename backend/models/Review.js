import mongoose from 'mongoose';
const reviewSchema=new mongoose.Schema({
  user:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true,index:true},
  business:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true,index:true},
  food:{type:mongoose.Schema.Types.ObjectId,ref:'Food',required:true},
  request:{type:mongoose.Schema.Types.ObjectId,ref:'FoodRequest',required:true,unique:true},
  rating:{type:Number,required:true,min:1,max:5},
  review:{type:String,required:true,trim:true,minlength:3,maxlength:500}
},{timestamps:true});
reviewSchema.index({business:1,createdAt:-1});
export default mongoose.model('Review',reviewSchema);
