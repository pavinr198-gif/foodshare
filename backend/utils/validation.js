export const emailOk=email=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email||'').trim());
export const passwordOk=password=>typeof password==='string'&&password.length>=8&&password.length<=128;
export const otpOk=otp=>/^\d{6}$/.test(String(otp||''));
export const ratingOk=rating=>Number.isInteger(Number(rating))&&Number(rating)>=1&&Number(rating)<=5;
export const reviewOk=review=>typeof review==='string'&&review.trim().length>=3&&review.trim().length<=500;
export const fssaiOk=fssai=>/^\d{14}$/.test(String(fssai||''));
export const phoneOk=phone=>!phone||/^\+?[0-9\s()-]{7,20}$/.test(String(phone).trim());
