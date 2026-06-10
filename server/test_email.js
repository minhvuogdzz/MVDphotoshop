import { sendEmail } from './utils/emailService.js';
import dotenv from 'dotenv';
dotenv.config();

console.log("Testing email with user:", process.env.EMAIL_USER);

sendEmail("Test Email from Backend", "<h1>Hello</h1><p>If you see this, email works.</p>")
  .then(success => {
    console.log("Email success:", success);
    process.exit(0);
  })
  .catch(err => {
    console.error("Email error:", err);
    process.exit(1);
  });
