import { Request, Response } from "express";
import UserModel from "../models/user.model";

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

export const register = async (req: MulterRequest, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;
    console.log(req.body)
    const image = req.file ? req.file.path : "";

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: "User already exists" });
      return;
    }

    const newUser = new UserModel({ name, email, password, image });
    await newUser.save();

    res.status(201).json({ message: "User created successfully", user: newUser });
  } catch (error) {
    res.status(500).json({ message: "Error creating user", error });
  }
};
