# FoodShare — Surplus Food Sharing Platform

A MERN application for sharing **free surplus food** from verified hotels, restaurants and catering/event businesses with common users for **direct pickup only**. There is intentionally no payment, cart, checkout, delivery or shipping workflow.

## Stack
- React + Vite
- Node.js + Express
- MongoDB + Mongoose
- JWT + bcryptjs
- Brevo transactional email API OTP
- Leaflet + OpenStreetMap
- Multer, Helmet, CORS, rate limiting

## Folder structure
`frontend/` contains the React application. `backend/` contains REST APIs, models, authentication, OTP email, uploads and admin logic.

## Requirements
- Node.js 18+ recommended
- MongoDB Atlas account or local MongoDB
- Brevo account with a verified sender and Brevo API key for transactional OTP email

## 1. Backend setup
```bash
cd backend
npm install
copy .env.example .env
```
Edit `.env`: set `MONGO_URI`, a strong `JWT_SECRET`, `FRONTEND_URL`, Brevo settings and admin seed credentials. Never commit `.env`.

In Brevo, create an API key under SMTP & API settings and configure a verified sender. Put the API key and sender email in `.env`. Never expose the API key in the frontend.

Start backend:
```bash
npm run dev
```
Production-style start:
```bash
npm start
```
API health: `http://localhost:3000/api/health`

Optional development seed:
```bash
npm run seed
```
This creates the Admin from `ADMIN_EMAIL`/`ADMIN_PASSWORD` and a clearly identified demo approved business with demo food. The demo business is intentionally pre-verified for development only; normal registration still uses real OTP through Brevo and admin approval.

## 2. Frontend setup
Open a second terminal:
```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```
Open `http://localhost:5173`.

Set `VITE_API_URL=http://localhost:3000/api` and `VITE_BACKEND_URL=http://localhost:3000` unless you use different ports.

## Authentication
Common users and businesses receive a random 6-digit OTP by SMTP. Only a SHA-256 hash of the OTP is stored. OTPs expire and are replaced when resent. Businesses become usable for food publishing only after email verification **and** Admin approval.

## Business approval
Business registration → real email OTP → email verified → Pending Admin Approval → Admin approves/rejects → approved business can publish food. FSSAI information is recorded and shown separately from email verification.

## Food workflow
Approved business → add food → ingredients/allergens/food type/quantity/deadline/pickup map → Draft or Active. Active food automatically becomes unavailable when the deadline passes. Requests cannot be created for expired or removed food.

## Request workflow
`Pending → Accepted → Ready for Pickup → Collected → Completed`
Alternative terminal paths: `Pending → Rejected` or `Pending → Cancelled`. Backend transition rules prevent arbitrary status changes.

## Maps
Leaflet renders interactive OpenStreetMap tiles without a Google API key. Business registration and food creation support map selection, marker movement and browser geolocation. Food/request details show pickup maps. If a location is missing, the UI displays a map-unavailable fallback instead of crashing.

## API overview
Authentication: `/api/auth/*`
Food: `/api/foods/*`
Requests: `/api/requests/*`
Reviews: `/api/reviews/*`
Notifications: `/api/notifications/*`
Reports: `/api/reports/*`
Profile: `/api/profile/*`
Admin: `/api/admin/*`

## Security
JWT is validated on protected API routes; role checks are server-side; passwords use bcrypt; OTPs are hashed; authentication/OTP endpoints are rate limited; Helmet and configured CORS are enabled; uploaded images are restricted by MIME type and 5 MB size; secrets live in environment variables.

## Important configuration limitation
MongoDB Atlas and Gmail SMTP are external services. They cannot be proven operational from this ZIP alone until you provide valid `.env` credentials and run the services locally. The code does not fake OTP delivery or database authentication.

## Verification checklist after extraction
1. `cd backend && npm install && npm run dev`
2. Configure MongoDB and Gmail SMTP in `.env`.
3. In another terminal: `cd frontend && npm install && npm run dev`.
4. Open the frontend.
5. Register a common user and verify the real OTP.
6. Register a business and verify the real OTP.
7. Run `npm run seed` if you want the development Admin/demo business.
8. Login as Admin and approve a normally registered business.
9. Login as that business and publish food.
10. Login as a common user, request food, and test the status workflow.

## No payment / no delivery
FoodShare is free surplus-food sharing. The code intentionally has no price, payment, checkout, cart, shipping, driver or delivery model/workflow.


## Food reservation behavior
When a business accepts a food request, that food is reserved and its listing is changed from `Active` to `Removed`, so it disappears from Browse for every user. Completed collections remain unavailable. Legacy active listings linked to accepted/ready/collected/completed requests are automatically synchronized to `Removed` when Browse, the business food list, or Admin statistics/food list is loaded. Rejected requests do not remove the food listing.
