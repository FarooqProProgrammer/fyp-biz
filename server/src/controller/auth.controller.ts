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

    await OtpModel.create({
      email,
      otp: otpCode,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000), // Expires in 5 minutes
    });

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
      text: `Your OTP is: ${otpCode}. It expires in 30 minutes.`,
    };

    await transporter.sendMail(mailOptions);
    console.log(`OTP sent to ${email}`);
  } catch (error) {
    console.error("Error sending OTP email:", error);
  }
};
