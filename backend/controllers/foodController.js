import FoodRequest from '../models/FoodRequest.js'; import Food from '../models/Food.js'; import User from '../models/User.js';
async function syncTakenFoods(){
  const takenFoodIds=await FoodRequest.find({status:{$in:['Accepted','Ready for Pickup','Collected','Completed']}}).distinct('food');
  if(takenFoodIds.length){
    await Food.updateMany({_id:{$in:takenFoodIds},status:'Active'},{$set:{status:'Removed'}});
  }
}
function normalize(f){if(f.status==='Active'&&new Date(f.availableUntil)<=new Date()){f.status='Expired';return f.save();}return f;}
export async function listFoods(req,res,next){try{
  await syncTakenFoods();
  const approvedBusinesses=await User.find({role:'business',status:'Approved'}).select('_id');
  const q={status:'Active',availableUntil:{$gt:new Date()},quantity:{$gt:0},business:{$in:approvedBusinesses.map(x=>x._id)}};
  if(req.query.search)q.$or=[{foodName:{$regex:req.query.search,$options:'i'}},{category:{$regex:req.query.search,$options:'i'}}];
  if(req.query.foodType)q.foodType=req.query.foodType;
  // A food already accepted by this user is no longer shown to that user in Browse Food.
  if(req.user?._id){
    const FoodRequest=(await import('../models/FoodRequest.js')).default;
    const taken=await FoodRequest.find({user:req.user._id,status:{$in:['Pending','Accepted','Ready for Pickup','Collected','Completed']}}).distinct('food');
    if(taken.length)q._id={$nin:taken};
  }
  const foods=await Food.find(q).populate('business','businessName businessType name status fssaiVerified location').sort({availableUntil:1});
  res.json({foods});
}catch(e){next(e)}}
export async function getFood(req,res,next){try{const f=await Food.findById(req.params.id).populate('business','businessName businessType name status fssaiVerified location');if(!f)return res.status(404).json({message:'Food not found'});await normalize(f);res.json({food:f});}catch(e){next(e)}}
export async function createFood(req,res,next){try{if(req.user.role!=='business'||req.user.status!=='Approved')return res.status(403).json({message:'Only approved businesses can publish food'});const b=req.body;const until=new Date(b.availableUntil);if(Number.isNaN(until.getTime())||until<=new Date())return res.status(400).json({message:'Available until must be in the future'});const loc=JSON.parse(b.pickupLocation);const f=new Food({business:req.user._id,foodName:b.foodName,category:b.category,description:b.description,foodType:b.foodType,ingredients:b.ingredients?JSON.parse(b.ingredients):[],allergens:b.allergens?JSON.parse(b.allergens):[],additionalAllergenInfo:b.additionalAllergenInfo,quantity:Number(b.quantity),preparationTime:b.preparationTime,availableUntil:until,pickupLocation:loc,status:b.status==='Draft'?'Draft':'Active',image:req.file?`/uploads/${req.file.filename}`:undefined});await f.save();res.status(201).json({food:f});}catch(e){next(e)}}
export async function updateFood(req,res,next){try{const f=await Food.findById(req.params.id);if(!f)return res.status(404).json({message:'Food not found'});if(String(f.business)!==String(req.user._id))return res.status(403).json({message:'You can edit only your own food'});Object.assign(f,{foodName:req.body.foodName,category:req.body.category,description:req.body.description,foodType:req.body.foodType,ingredients:req.body.ingredients,allergens:req.body.allergens,additionalAllergenInfo:req.body.additionalAllergenInfo,quantity:req.body.quantity,preparationTime:req.body.preparationTime,availableUntil:req.body.availableUntil,pickupLocation:req.body.pickupLocation,status:req.body.status});if(req.file)f.image=`/uploads/${req.file.filename}`;await f.save();res.json({food:f});}catch(e){next(e)}}
export async function deleteFood(req,res,next){try{const f=await Food.findById(req.params.id);if(!f)return res.status(404).json({message:'Food not found'});if(String(f.business)!==String(req.user._id))return res.status(403).json({message:'Forbidden'});f.status='Removed';await f.save();res.json({message:'Food removed'});}catch(e){next(e)}}
export async function myFoods(req,res,next){try{await syncTakenFoods();res.json({foods:await Food.find({business:req.user._id}).sort({createdAt:-1})});}catch(e){next(e)}}
