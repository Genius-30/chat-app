import twilio from "twilio";

// Twilio setup
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER; // Your Twilio phone number

export const sendOtp = async (phoneNumber, otp) => {
  try {
    // Send OTP via SMS using Twilio
    const message = await client.messages.create({
      body: `Your verification code is: ${otp}`,
      from: TWILIO_PHONE_NUMBER,
      to: phoneNumber,
    });

    console.log(`OTP sent to ${phoneNumber}: ${message.sid}`);
  } catch (error) {
    console.error("Error sending OTP:", error);
    throw new Error("Failed to send OTP");
  }
};
