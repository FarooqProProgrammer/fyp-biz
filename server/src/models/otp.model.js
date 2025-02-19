import mongoose from "mongoose";

const OtpSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  expiresAt: { type: Date, required: true, index: { expires: "5m" } }, // OTP expires in 5 minutes
});

const OtpModel = mongoose.model("Otp", OtpSchema);

export default OtpModel;
