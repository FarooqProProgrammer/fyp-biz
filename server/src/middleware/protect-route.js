import jwt from "jsonwebtoken";

// Use the secret key from environment variable or fallback to a default value
const SECRET_KEY = process.env.JWT_SECRET || "your-secret-key"; 

// Middleware function to protect routes
export const protectRoute = (req, res, next) => {
  const authHeader = req.headers.authorization || req.cookies.token;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ message: "Unauthorized access. No token provided." });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, SECRET_KEY);

    req.user = { id: decoded.id };

    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token." });
  }
};
