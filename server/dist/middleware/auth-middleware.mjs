// src/middleware/auth-middleware.ts
import jwt from "jsonwebtoken";
var JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";
var authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      res.status(401).json({ message: "Unauthorized: No token provided" });
      return;
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded.userId;
    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    res.status(403).json({ message: "Invalid or expired token" });
    return;
  }
};
export {
  authMiddleware
};
//# sourceMappingURL=auth-middleware.mjs.map