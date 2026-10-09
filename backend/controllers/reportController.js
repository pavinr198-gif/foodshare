import Report from '../models/Report.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import {sendComplaintEmail} from '../utils/email.js';

export async function createReport(req,res,next){
 try{
  const {reportedBusiness,reportedFood,reportedRequest,reason,description}=req.body;
  if(!reason||!String(description||'').trim()) return res.status(400).json({message:'Reason and description are required'});
  const r=await Report.create({reporter:req.user._id,reportedBusiness,reportedFood,reportedRequest,reason,description:String(description).trim()});
  const user=await User.findById(req.user._id).select('name email');
  const message='Your complaint has been raised successfully. Our Admin team will check the problem and take the necessary action. Further action details will be sent to your registered email.';
  await Notification.create({recipient:req.user._id,title:'Complaint raised successfully',message});
  if(user?.email){try{await sendComplaintEmail(user.email,user.name,'FoodShare Complaint Raised',message)}catch(emailError){console.error('Complaint email failed:',emailError.message)}}
  res.status(201).json({message,report:r});
 }catch(e){next(e)}
}
export async function listReports(req,res,next){try{res.json({reports:await Report.find().populate('reporter','name email').populate('reportedBusiness','businessName email').populate('reportedFood','foodName').sort({createdAt:-1})})}catch(e){next(e)}}
export async function updateReport(req,res,next){
 try{
  const status=req.body.status;
  if(!['Open','Resolved','Rejected'].includes(status)) return res.status(400).json({message:'Invalid complaint status'});
  const r=await Report.findById(req.params.id).populate('reporter','name email');
  if(!r)return res.status(404).json({message:'Report not found'});
  r.status=status;
  if(status==='Resolved'){
   r.resolutionMessage=String(req.body.resolutionMessage||'Your complaint has been reviewed and resolved by the FoodShare Admin team.');
   r.resolvedAt=new Date();
  } else if(status==='Rejected'){
   r.resolutionMessage=String(req.body.resolutionMessage||'Your complaint was reviewed by the FoodShare Admin team and could not be accepted based on the available information.');
   r.resolvedAt=new Date();
  } else {r.resolutionMessage='';r.resolvedAt=undefined;}
  await r.save();
  if(r.reporter?._id){
   const title=status==='Resolved'?'Complaint resolved':status==='Rejected'?'Complaint update':'Complaint reopened';
   const message=status==='Open'?'Your complaint has been reopened and is being reviewed again.':r.resolutionMessage;
   await Notification.create({recipient:r.reporter._id,title,message});
   if(r.reporter.email){try{await sendComplaintEmail(r.reporter.email,r.reporter.name,`FoodShare Complaint ${status}`,message)}catch(emailError){console.error('Complaint resolution email failed:',emailError.message)}}
  }
  res.json({message:`Complaint ${status.toLowerCase()}`,report:r});
 }catch(e){next(e)}
}
