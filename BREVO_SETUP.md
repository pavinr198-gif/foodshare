# FoodShare + Brevo OTP Setup

FoodShare uses Brevo's transactional email API for registration and password-reset OTPs. Nodemailer/Gmail SMTP is no longer required.

## 1. Create a Brevo account
Create or sign in to your Brevo account.

## 2. Create an API key
Open Brevo **Settings → SMTP & API → API Keys** and create an API key. Keep it secret.

## 3. Configure a sender
Add and verify the email address/domain you want FoodShare to send from.

## 4. Backend `.env`
```env
BREVO_API_KEY=xkeysib-your-api-key
BREVO_SENDER_EMAIL=your-verified-sender@example.com
BREVO_SENDER_NAME=FoodShare
OTP_EXPIRY_MINUTES=10
```

Also configure `MONGO_URI`, `JWT_SECRET`, `FRONTEND_URL`, `ADMIN_EMAIL` and `ADMIN_PASSWORD`.

## 5. Install and run
```bash
cd backend
npm install
npm run seed
npm run dev
```

In another terminal:
```bash
cd frontend
npm install
npm run dev
```

## Authentication flow

### Common user
Register → Brevo OTP → Verify → automatically receives JWT → User Dashboard.

### Business
Register → Brevo OTP → Verify → Pending Admin Approval → Admin approves → Business can login.

### Admin
Admin is never created through public registration. Run the seed command. Admin is created as verified + approved and can login directly without OTP.

## Admin CRUD

Admin can:
- Create, view, block/unblock and delete common users.
- Create, view, approve/reject, block/unblock and delete businesses/restaurants.
- View pending business registrations.
- View/remove food listings.
- View requests, reports and statistics.

All admin endpoints require a valid JWT and `role=admin` on the backend.
