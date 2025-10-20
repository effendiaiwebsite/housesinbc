/**
 * Twilio SMS Service
 *
 * Handles OTP code generation and SMS sending via Twilio API.
 */

import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

let twilioClient: ReturnType<typeof twilio> | null = null;

// Initialize Twilio client only if credentials are provided
if (accountSid && authToken && twilioPhoneNumber) {
  twilioClient = twilio(accountSid, authToken);
}

/**
 * Generate a 6-digit OTP code
 */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Send OTP via SMS using Twilio
 * @param phoneNumber - Phone number to send OTP to (E.164 format)
 * @param code - 6-digit OTP code
 */
export async function sendOTP(phoneNumber: string, code: string): Promise<boolean> {
  if (!twilioClient || !twilioPhoneNumber) {
    console.warn('Twilio not configured. OTP code:', code);
    // In development, just log the code
    if (process.env.NODE_ENV === 'development') {
      console.log(`\n🔐 OTP Code for ${phoneNumber}: ${code}\n`);
      return true;
    }
    throw new Error('Twilio SMS service not configured');
  }

  try {
    const message = await twilioClient.messages.create({
      body: `Your verification code is: ${code}. Valid for 10 minutes.`,
      from: twilioPhoneNumber,
      to: phoneNumber,
    });

    console.log(`SMS sent successfully: ${message.sid}`);
    return true;
  } catch (error) {
    console.error('Error sending SMS:', error);

    // In development, still allow login by logging the code
    if (process.env.NODE_ENV === 'development') {
      console.log(`\n🔐 OTP Code for ${phoneNumber}: ${code}\n`);
      return true;
    }

    return false;
  }
}

/**
 * Validate phone number format (basic E.164 validation)
 */
export function isValidPhoneNumber(phoneNumber: string): boolean {
  // E.164 format: +[country code][number]
  const e164Regex = /^\+[1-9]\d{1,14}$/;
  return e164Regex.test(phoneNumber);
}
