import "express-session";
import mongoose from "mongoose";

declare module "express-session" {
  interface SessionData {
    user?: {
      id: mongoose.Types.ObjectId;
      name: string;
      email: string;
      image?: string;
      token?: string;
    };
  }
}


// Extend Express Request interface to include `user`
declare module "express-serve-static-core" {
  interface Request {
    user?: { id: string };
  }
}
