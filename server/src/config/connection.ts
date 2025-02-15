import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDb = async () => {
  try {
    if (!process.env.DATABASE_URI) {
      throw new Error("DATABASE_URI is not defined in environment variables.");
    }

    await mongoose.connect(process.env.DATABASE_URI);

    console.log("MongoDB connected successfully!");
  } catch (error) {
    process.exit(1); // Exit process with failure
  }
};

export default connectDb;
