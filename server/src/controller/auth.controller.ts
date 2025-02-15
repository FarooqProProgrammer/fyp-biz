import { Request, Response } from "express";
import UserModel from "../models/user.model";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs"
import dotenv from "dotenv"


dotenv.config();


interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

export const register = async (req: MulterRequest, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;
    console.log(req.body)
    const image = req.file ? req.file.path : "";


    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);


    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: "User already exists" });
      return;
    }

    const newUser = new UserModel({ name, email, password:hashedPassword, image });
    await newUser.save();

    res.status(201).json({ message: "User created successfully", user: newUser });
  } catch (error) {
    res.status(500).json({ message: "Error creating user", error });
  }
};


export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    console.log(req.body)

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

      // Convert Mongoose document to plain object
      const userObject = user.toObject() as any;
      delete userObject.password; // Remove password field


    res.status(200).json({ message: "Login successful", token, user: userObject });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error });
  }
};