import Review from '../models/Review.js';
import FoodRequest from '../models/FoodRequest.js';
import User from '../models/User.js';import {ratingOk,reviewOk} from '../utils/validation.js';
const bad=(message,status=400)=>Object.assign(new Error(message),{status});
export async function createReview(req,res,next){try{
  const {requestId,rating,review}=req.body;
  const score=Number(rating);
  if(!requestId||!ratingOk(score)) throw bad('Select a rating from 1 to 5 stars');
  if(!reviewOk(review)) throw bad('Review must be between 3 and 500 characters');
  const request=await FoodRequest.findById(requestId).populate('food','foodName').populate('business','businessName businessType');
  if(!request) throw bad('Request not found',404);
  if(String(request.user)!==String(req.user._id)) throw bad('You can review only your own completed request',403);
  if(request.status!=='Completed') throw bad('You can review the business only after completing the food collection');
  if(await Review.exists({request:request._id})) throw bad('You have already reviewed this food request',409);
  const created=await Review.create({user:req.user._id,business:request.business._id,food:request.food._id,request:request._id,rating:score,review:review.trim()});
  res.status(201).json({review:created});
}catch(e){next(e)}}
export async function businessReviews(req,res,next){try{
  const business=await User.findOne({_id:req.user._id,role:'business'}); if(!business) throw bad('Business account required',403);
  const reviews=await Review.find({business:req.user._id}).populate('user','name').populate('food','foodName').sort({createdAt:-1});
  const average=reviews.length?Math.round((reviews.reduce((s,r)=>s+r.rating,0)/reviews.length)*10)/10:0;
  res.json({reviews,average,total:reviews.length});
}catch(e){next(e)}}
export async function myReviewStatus(req,res,next){try{const reviews=await Review.find({user:req.user._id}).select('request rating review');res.json({reviews});}catch(e){next(e)}}
