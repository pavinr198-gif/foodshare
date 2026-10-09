import multer from 'multer'; import path from 'path'; import crypto from 'crypto';
const storage=multer.diskStorage({destination:'uploads/',filename:(req,file,cb)=>cb(null,crypto.randomUUID()+path.extname(file.originalname).toLowerCase())});
const allowed=new Set(['image/jpeg','image/png','image/webp']);
export const upload=multer({storage,limits:{fileSize:5*1024*1024},fileFilter:(req,file,cb)=>allowed.has(file.mimetype)?cb(null,true):cb(new Error('Only JPG, PNG and WEBP images are allowed'))});
