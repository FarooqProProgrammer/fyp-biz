import { Request, Response } from "express";
import UserModel from "../models/user.model";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import OtpModel from "../models/otp.model";
import nodemailer from "nodemailer";

dotenv.config();

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

export const register = async (
  req: MulterRequest,
  res: Response,
): Promise<void> => {
  try {
    const { name, email, password } = req.body;
    console.log(req.body);
    const image = req.file ? req.file.path : "";

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: "User already exists" });
      return;
    }

    const newUser = new UserModel({
      name,
      email,
      password: hashedPassword,
      image,
    });
    await newUser.save();

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await OtpModel.findByIdAndUpdate(
      { email },
      { otp: otpCode, expiresAt },
      { upsert: true },
    );

    await sendOtpEmail(email, otpCode);

    res.status(201).json({
      message: "User registered successfully. OTP sent to email.",
      user: newUser,
    });
  } catch (error) {
    res.status(500).json({ message: "Error creating user", error });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    console.log(req.body);

    // Check if user exists
    const user = await UserModel.findOne({ email });
    if (!user) {
      res.status(400).json({ message: "Invalid email or password" });
      return;
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(400).json({ message: "Invalid email or password" });
      return;
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, {
      expiresIn: "1d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000,
    });

    req.session.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      image: user.image,
      token: token,
    };

    // Convert Mongoose document to plain object
    const userObject = user.toObject() as any;
    delete userObject.password; // Remove password field

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        image: user.image,
        token: token,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error });
  }
};

export const forgotPassword = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { email } = req.body;

    const user = await UserModel.findOne({ email });

    // Generate OTP code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Set OTP expiration time (1 hour from now)
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    if (user) {
      // If user exists, update OTP in OtpModel
      await OtpModel.findOneAndUpdate(
        { email },
        { otp: otpCode, expiresAt },
        { upsert: true },
      );
    } else {
      // If no user exists, create a new OTP record
      const otpRecord = new OtpModel({ email, otp: otpCode, expiresAt });
      await otpRecord.save();
    }

    // Send OTP email
    await sendOtpEmail(email, otpCode);

    // Respond with a success message
    res.status(200).json({
      message: "OTP sent to email for password reset.",
    });
  } catch (error) {
    console.error("Error in forgotPassword:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const sendOtpEmail = async (email: string, otpCode: string) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "localhost",
      port: 1025,
      secure: false,
      auth: {
        user: "your-email@example.com",
        pass: "your-email-password",
      },
    });

    const mailOptions = {
      from: '"Your Company" <your-email@example.com>',
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP is: ${otpCode}. It expires in 60 minutes.`,
    };

    await transporter.sendMail(mailOptions);
    console.log(`OTP sent to ${email}`);
  } catch (error) {
    console.error("Error sending OTP email:", error);
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
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

export const verifyOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { emailInput, otp } = req.body;

    console.log(req.body);

    const otpRecord = await OtpModel.findOne({ email: emailInput, otp });

    console.log(otpRecord);

    if (!otpRecord) {
      res.status(400).json({ message: "Invalid OTP" });
      return;
    }

    if (new Date() > otpRecord.expiresAt) {
      res.status(400).json({ message: "OTP has expired" });
      return;
    }

    await UserModel.findOneAndUpdate(
      { email: emailInput },
      { isVerified: true },
    );

    await OtpModel.deleteOne({ email: emailInput });

    res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ message: "Error verifying OTP", error });
  }
};

export const ResendOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    // Validate email format
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
      return;
    }

    // Check if user exists
    const user = await UserModel.findOne({ email });

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // OTP expiration time (1 hour)

    // Update or create OTP record
    if (user) {
      // If user exists, update OTP in the OTP model
      await OtpModel.findOneAndUpdate(
        { email },
        { otp: otpCode, expiresAt },
        { upsert: true },
      );
    } else {
      // If user doesn't exist in OTP model, create new OTP record
      const otpRecord = new OtpModel({ email, otp: otpCode, expiresAt });
      await otpRecord.save();
    }

    // Send OTP to the user's email
    await sendOtpEmail(email, otpCode);

    // Respond with success
    res.status(200).json({
      success: true,
      message: "OTP has been sent to your email.",
    });
  } catch (error) {
    // Catch and handle errors
    console.error(error);

    res.status(500).json({
      success: false,
      message: "An error occurred while resending the OTP. Please try again.",
    });
  }
};
