import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key"; 

export const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const token = req.cookies.token; 

        if (!token) {
             res.status(401).json({ message: "Unauthorized: No token provided" });
             return
        }

        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

        // Attach user ID to request object
        (req as any).user = decoded.userId;

        next(); // Proceed to the next middleware
    } catch (error) {
        console.error("Auth Middleware Error:", error);
      res.status(403).json({ message: "Invalid or expired token" });
      return
    }
};
