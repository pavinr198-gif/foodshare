import { BrevoClient } from '@getbrevo/brevo';

let client;

function getClient() {
  if (client) return client;
  if (!process.env.BREVO_API_KEY) throw new Error('BREVO_API_KEY is not configured');
  client = new BrevoClient({
    apiKey: process.env.BREVO_API_KEY,
    timeoutInSeconds: 10,
    maxRetries: 1
  });
  return client;
}

export async function sendOtpEmail(to, otp, purpose = 'verification', name = 'FoodShare User') {
  const isReset = purpose === 'reset';
  const subject = isReset ? 'FoodShare Password Reset OTP' : 'FoodShare Email Verification OTP';
  const intro = isReset ? 'Use this OTP to reset your FoodShare password.' : 'Use this OTP to verify your FoodShare account.';
  const minutes = Number(process.env.OTP_EXPIRY_MINUTES || 10);

  const result = await getClient().transactionalEmails.sendTransacEmail({
    sender: {
      name: process.env.BREVO_SENDER_NAME || 'FoodShare',
      email: process.env.BREVO_SENDER_EMAIL
    },
    to: [{ email: to, name }],
    subject,
    textContent: `${intro}\n\nYour OTP is ${otp}.\nThis OTP expires in ${minutes} minutes.\nDo not share this code with anyone.`,
    htmlContent: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:24px"><h2>FoodShare</h2><p>${intro}</p><div style="font-size:32px;font-weight:700;letter-spacing:8px;padding:18px 0">${otp}</div><p>This OTP expires in ${minutes} minutes.</p><p>Never share this code with anyone.</p></div>`
  });

  return result;
}


export async function sendComplaintEmail(to, name, subject, message) {
  return getClient().transactionalEmails.sendTransacEmail({
    sender: { name: process.env.BREVO_SENDER_NAME || 'FoodShare', email: process.env.BREVO_SENDER_EMAIL },
    to: [{ email: to, name: name || 'FoodShare User' }],
    subject,
    textContent: message,
    htmlContent: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px"><h2>FoodShare</h2><p>Dear ${name || 'User'},</p><p>${message.replace(/\n/g,'<br/>')}</p><p>Thank you for using FoodShare.</p></div>`
  });
}
