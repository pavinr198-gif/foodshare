import {Router} from 'express';
import {auth,roles} from '../middleware/auth.js';
import {createReview,businessReviews,myReviewStatus} from '../controllers/reviewController.js';
const r=Router();
r.post('/',auth,roles('user'),createReview);
r.get('/my',auth,roles('user'),myReviewStatus);
r.get('/business',auth,roles('business'),businessReviews);
export default r;
