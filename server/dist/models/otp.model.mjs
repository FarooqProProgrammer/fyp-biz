// src/models/otp.model.ts
import mongoose, { Schema } from "mongoose";
var OtpSchema = new Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  expiresAt: { type: Date, required: true, index: { expires: "5m" } }
  // OTP expires in 5 minutes
});
var OtpModel = mongoose.model("Otp", OtpSchema);
var otp_model_default = OtpModel;
export {
  otp_model_default as default
};
//# sourceMappingURL=otp.model.mjs.map