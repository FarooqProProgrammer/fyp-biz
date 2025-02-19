"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/controller/auth.controller.ts
var auth_controller_exports = {};
__export(auth_controller_exports, {
  ResendOtp: () => ResendOtp,
  forgotPassword: () => forgotPassword,
  login: () => login,
  logout: () => logout,
  register: () => register,
  verifyOtp: () => verifyOtp
});
module.exports = __toCommonJS(auth_controller_exports);

// src/models/user.model.ts
var import_mongoose = __toESM(require("mongoose"));
var UserSchema = new import_mongoose.default.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true
    },
    image: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);
var UserModel = import_mongoose.default.model("user", UserSchema);
var user_model_default = UserModel;

// src/controller/auth.controller.ts
var import_jsonwebtoken = __toESM(require("jsonwebtoken"));
var import_bcryptjs = __toESM(require("bcryptjs"));
var import_dotenv = __toESM(require("dotenv"));

// src/models/otp.model.ts
var import_mongoose2 = __toESM(require("mongoose"));
var OtpSchema = new import_mongoose2.Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  expiresAt: { type: Date, required: true, index: { expires: "5m" } }
  // OTP expires in 5 minutes
});
var OtpModel = import_mongoose2.default.model("Otp", OtpSchema);
var otp_model_default = OtpModel;

// src/controller/auth.controller.ts
var import_nodemailer = __toESM(require("nodemailer"));
import_dotenv.default.config();
var register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    console.log(req.body);
    const image = req.file ? req.file.path : "";
    const salt = await import_bcryptjs.default.genSalt(10);
    const hashedPassword = await import_bcryptjs.default.hash(password, salt);
    const existingUser = await user_model_default.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: "User already exists" });
      return;
    }
    const newUser = new user_model_default({
      name,
      email,
      password: hashedPassword,
      image
    });
    await newUser.save();
    const otpCode = Math.floor(1e5 + Math.random() * 9e5).toString();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1e3);
    await otp_model_default.findByIdAndUpdate(
      { email },
      { otp: otpCode, expiresAt },
      { upsert: true }
    );
    await sendOtpEmail(email, otpCode);
    res.status(201).json({
      message: "User registered successfully. OTP sent to email.",
      user: newUser
    });
  } catch (error) {
    res.status(500).json({ message: "Error creating user", error });
  }
};
var login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(req.body);
    const user = await user_model_default.findOne({ email });
    if (!user) {
      res.status(400).json({ message: "Invalid email or password" });
      return;
    }
    const isMatch = await import_bcryptjs.default.compare(password, user.password);
    if (!isMatch) {
      res.status(400).json({ message: "Invalid email or password" });
      return;
    }
    const token = import_jsonwebtoken.default.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d"
    });
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1e3
    });
    req.session.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      image: user.image,
      token
    };
    const userObject = user.toObject();
    delete userObject.password;
    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        image: user.image,
        token
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error });
  }
};
var forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await user_model_default.findOne({ email });
    const otpCode = Math.floor(1e5 + Math.random() * 9e5).toString();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1e3);
    if (user) {
      await otp_model_default.findOneAndUpdate(
        { email },
        { otp: otpCode, expiresAt },
        { upsert: true }
      );
    } else {
      const otpRecord = new otp_model_default({ email, otp: otpCode, expiresAt });
      await otpRecord.save();
    }
    await sendOtpEmail(email, otpCode);
    res.status(200).json({
      message: "OTP sent to email for password reset."
    });
  } catch (error) {
    console.error("Error in forgotPassword:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
var sendOtpEmail = async (email, otpCode) => {
  try {
    const transporter = import_nodemailer.default.createTransport({
      host: "localhost",
      port: 1025,
      secure: false,
      auth: {
        user: "your-email@example.com",
        pass: "your-email-password"
      }
    });
    const mailOptions = {
      from: '"Your Company" <your-email@example.com>',
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP is: ${otpCode}. It expires in 60 minutes.`
    };
    await transporter.sendMail(mailOptions);
    console.log(`OTP sent to ${email}`);
  } catch (error) {
    console.error("Error sending OTP email:", error);
  }
};
var logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production"
    });
    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          res.status(500).json({ message: "Error logging out" });
          return;
        }
        res.status(200).json({ message: "Logout successful" });
      });
    } else {
      res.status(200).json({ message: "Logout successful" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error logging out", error });
  }
};
var verifyOtp = async (req, res) => {
  try {
    const { emailInput, otp } = req.body;
    console.log(req.body);
    const otpRecord = await otp_model_default.findOne({ email: emailInput, otp });
    console.log(otpRecord);
    if (!otpRecord) {
      res.status(400).json({ message: "Invalid OTP" });
      return;
    }
    if (/* @__PURE__ */ new Date() > otpRecord.expiresAt) {
      res.status(400).json({ message: "OTP has expired" });
      return;
    }
    await user_model_default.findOneAndUpdate(
      { email: emailInput },
      { isVerified: true }
    );
    await otp_model_default.deleteOne({ email: emailInput });
    res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ message: "Error verifying OTP", error });
  }
};
var ResendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      res.status(400).json({
        success: false,
        message: "Invalid email format"
      });
      return;
    }
    const user = await user_model_default.findOne({ email });
    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found"
      });
      return;
    }
    const otpCode = Math.floor(1e5 + Math.random() * 9e5).toString();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1e3);
    if (user) {
      await otp_model_default.findOneAndUpdate(
        { email },
        { otp: otpCode, expiresAt },
        { upsert: true }
      );
    } else {
      const otpRecord = new otp_model_default({ email, otp: otpCode, expiresAt });
      await otpRecord.save();
    }
    await sendOtpEmail(email, otpCode);
    res.status(200).json({
      success: true,
      message: "OTP has been sent to your email."
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "An error occurred while resending the OTP. Please try again."
    });
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ResendOtp,
  forgotPassword,
  login,
  logout,
  register,
  verifyOtp
});
//# sourceMappingURL=auth.controller.js.map