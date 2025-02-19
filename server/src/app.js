import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRouter from "./routes/auth.route.js";
import connectDb from "./config/connection.js";
import path from "path";
import customerRouter from "./routes/customer.route.js";
import serviceRouter from "./routes/service.route.js";
import MongoStore from "connect-mongo";
import session from "express-session";
import invoiceRouter from "./routes/invoice.route.js";
import SalesRouter from "./routes/sales.route.js";

dotenv.config();
connectDb();

const app = express();

// Middlewares
app.use(express.json());
app.use(cors());
app.set("view engine", "ejs");
app.set("views", path.join(process.cwd(), "views"));

app.use(express.static("uploads/"));

app.use(
  session({
    secret: process.env.JWT_SECRET ?? 'secret',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.DATABASE_URI }),
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }, // 1 day
  })
);

// Route to serve files from the uploads folder
app.get("/uploads/:file", (req, res) => {
  const fileName = req.params.file;
  const filePath = path.join(process.cwd(), "uploads", fileName);

  res.sendFile(filePath, (err) => {
    if (err) {
      res.status(404).json({ message: "File not found" });
    }
  });
});

// All Routes
app.use(authRouter);
app.use(customerRouter);
app.use(serviceRouter);
app.use(invoiceRouter);
app.use(SalesRouter);

export default app;
