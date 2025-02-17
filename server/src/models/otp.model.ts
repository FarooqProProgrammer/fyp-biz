import mongoose, { Document, Schema } from "mongoose";

export interface IOtp extends Document {
  email: string;
  otp: string;
  expiresAt: Date;
}

const OtpSchema = new Schema<IOtp>({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  expiresAt: { type: Date, required: true, index: { expires: "5m" } }, // OTP expires in 5 minutes
});

const OtpModel = mongoose.model<IOtp>("Otp", OtpSchema);
export default OtpModel;
