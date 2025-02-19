// src/routes/auth.route.ts
import express from "express";

// src/lib/multer.ts
import multer from "multer";
import path from "path";
var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  }
});
var fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"));
  }
};
var upload = multer({ storage, fileFilter });
var multer_default = upload;

// src/models/user.model.ts
import mongoose from "mongoose";
var UserSchema = new mongoose.Schema(
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
var UserModel = mongoose.model("user", UserSchema);
var user_model_default = UserModel;

// src/controller/auth.controller.ts
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

// src/models/otp.model.ts
import mongoose2, { Schema } from "mongoose";
var OtpSchema = new Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  expiresAt: { type: Date, required: true, index: { expires: "5m" } }
  // OTP expires in 5 minutes
});
var OtpModel = mongoose2.model("Otp", OtpSchema);
var otp_model_default = OtpModel;

// src/controller/auth.controller.ts
import nodemailer from "nodemailer";
dotenv.config();
var register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    console.log(req.body);
    const image = req.file ? req.file.path : "";
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
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
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(400).json({ message: "Invalid email or password" });
      return;
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
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
    const transporter = nodemailer.createTransport({
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

// src/routes/auth.route.ts
var authRouter = express.Router();
authRouter.post("/register", multer_default.single("image"), register);
authRouter.post("/login", login);
authRouter.route("/logout").post(logout);
authRouter.route("/otp-verify").post(verifyOtp);
authRouter.route("/forgot-password").post(forgotPassword);
var auth_route_default = authRouter;
export {
  auth_route_default as default
};
//# sourceMappingURL=auth.route.mjs.map