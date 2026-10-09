import mongoose from 'mongoose';
const requestSchema=new mongoose.Schema({user:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},business:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},food:{type:mongoose.Schema.Types.ObjectId,ref:'Food',required:true},status:{type:String,enum:['Pending','Accepted','Ready for Pickup','Collected','Completed','Rejected','Cancelled'],default:'Pending'},requestedAt:{type:Date,default:Date.now},collectedAt:Date},{timestamps:true});
requestSchema.index({user:1,status:1}); requestSchema.index({business:1,status:1});
export default mongoose.model('FoodRequest',requestSchema);
