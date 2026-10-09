import 'dotenv/config';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Food from './models/Food.js';
import {connectDB} from './config/db.js';

await connectDB();

const adminEmail=String(process.env.ADMIN_EMAIL||'').trim().toLowerCase();
const adminPassword=process.env.ADMIN_PASSWORD;
if(!adminEmail||!adminPassword) throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD are required');

let admin=await User.findOne({email:adminEmail});
if(!admin){
  admin=await User.create({name:'FoodShare Admin',email:adminEmail,password:await bcrypt.hash(adminPassword,12),role:'admin',status:'Approved',isEmailVerified:true});
  console.log('Admin created');
}else{
  if(admin.role!=='admin'){admin.role='admin';}
  admin.status='Approved';
  admin.isEmailVerified=true;
  await admin.save();
  console.log('Admin already exists and was normalized');
}

let business=await User.findOne({email:'demo.business@foodshare.local'});
if(!business){
  business=await User.create({name:'Demo Owner',email:'demo.business@foodshare.local',password:await bcrypt.hash('DemoBusiness123!',12),role:'business',businessName:'Green Leaf Kitchen',businessType:'Restaurant',ownerName:'Demo Owner',phone:'9999999999',address:'Thiruvananthapuram, Kerala',fssaiNumber:'12345678901234',fssaiVerified:true,location:{address:'Thiruvananthapuram, Kerala',latitude:8.5241,longitude:76.9366},status:'Approved',isEmailVerified:true});
  await Food.create({business:business._id,foodName:'Vegetable Meals',category:'Meals',description:'Fresh surplus vegetarian meals available for direct pickup.',foodType:'VEG',ingredients:['Rice','Vegetables','Lentils','Spices'],allergens:['No Known Allergens'],quantity:10,preparationTime:'Ready',availableUntil:new Date(Date.now()+24*60*60*1000),pickupLocation:business.location,status:'Active'});
  console.log('Demo business and food created');
}else console.log('Demo business already exists');

process.exit(0);
