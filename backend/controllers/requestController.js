import FoodRequest from '../models/FoodRequest.js';import Food from '../models/Food.js';import Notification from '../models/Notification.js';
const transitions={Pending:['Accepted','Rejected','Cancelled'],Accepted:['Ready for Pickup'], 'Ready for Pickup':['Collected'],'Collected':['Completed']};
async function notify(recipient,title,message){await Notification.create({recipient,title,message});}
export async function createRequest(req,res,next){try{
 const food=await Food.findById(req.body.foodId).populate('business');
 if(!food||food.status!=='Active'||new Date(food.availableUntil)<=new Date()||food.business.status!=='Approved')return res.status(400).json({message:'Food is no longer available'});
 const existing=await FoodRequest.findOne({food:food._id,user:req.user._id,status:{$nin:['Rejected','Cancelled','Completed']}});
 if(existing)return res.status(409).json({message:'You already have an active request for this food'});
 const reserved=await FoodRequest.findOne({food:food._id,status:{$in:['Pending','Accepted','Ready for Pickup','Collected']}});
 if(reserved)return res.status(409).json({message:'This food has already been reserved by another user'});
 const r=await FoodRequest.create({user:req.user._id,business:food.business._id,food:food._id});
 await notify(food.business._id,'New food request',`${req.user.name} requested ${food.foodName}.`);
 res.status(201).json({request:r});
}catch(e){next(e)}}
export async function myRequests(req,res,next){try{res.json({requests:await FoodRequest.find({user:req.user._id}).populate('food','foodName image pickupLocation availableUntil foodType').populate('business','businessName businessType location').sort({createdAt:-1})});}catch(e){next(e)}}
export async function businessRequests(req,res,next){try{res.json({requests:await FoodRequest.find({business:req.user._id}).populate('food','foodName image pickupLocation availableUntil').populate('user','name email phone').sort({createdAt:-1})});}catch(e){next(e)}}
export async function getRequest(req,res,next){try{const r=await FoodRequest.findById(req.params.id).populate('food').populate('business','businessName businessType address location').populate('user','name email phone');if(!r)return res.status(404).json({message:'Request not found'});const ok=req.user.role==='admin'||String(r.user._id)===String(req.user._id)||String(r.business._id)===String(req.user._id);if(!ok)return res.status(403).json({message:'Forbidden'});res.json({request:r});}catch(e){next(e)}}
export async function changeStatus(req,res,next){try{
 const r=await FoodRequest.findById(req.params.id).populate('food');
 if(!r)return res.status(404).json({message:'Request not found'});
 const nextStatus=req.body.status;
 if(!transitions[r.status]?.includes(nextStatus))return res.status(400).json({message:`Invalid transition from ${r.status} to ${nextStatus}`});
 if(['Accepted','Rejected','Ready for Pickup'].includes(nextStatus)&&String(r.business)!==String(req.user._id))return res.status(403).json({message:'Only the business can perform this action'});
 if(['Cancelled','Collected','Completed'].includes(nextStatus)&&String(r.user)!==String(req.user._id))return res.status(403).json({message:'Only the user can perform this action'});
 r.status=nextStatus;
 if(nextStatus==='Collected')r.collectedAt=new Date();
 await r.save();
 // Once a business accepts a request, the food is reserved and must disappear from Browse for everyone.
 if((nextStatus==='Accepted'||nextStatus==='Completed')&&r.food){
   r.food.status='Removed';
   await r.food.save();
 }
 if(nextStatus==='Accepted')await notify(r.user,'Request accepted','Your food request was accepted. The food is reserved for you and is no longer available in Browse.');
 if(nextStatus==='Rejected')await notify(r.user,'Request rejected','Your food request was rejected.');
 if(nextStatus==='Ready for Pickup')await notify(r.user,'Food ready for pickup','Your food is ready for direct pickup.');
 if(nextStatus==='Completed')await notify(r.business,'Collection completed','A food request has been completed. The food listing is no longer active.');
 res.json({request:r});
}catch(e){next(e)}}
