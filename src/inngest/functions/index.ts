import { sendOTPEmail } from './send-otp-email';
import { sendWelcomeEmail } from './send-welcome-email';

const functions = [sendWelcomeEmail, sendOTPEmail];

export default functions;
