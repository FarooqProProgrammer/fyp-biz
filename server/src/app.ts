import express, { Express } from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRouter from "./routes/auth.route";
import connectDb from "./config/connection";
import path from "path";
import customerRouter from "./routes/customer.route";
import serviceRouter from "./routes/service.route";
import MongoStore from "connect-mongo";
import session from "express-session";
import invoiceRouter from "./routes/invoice.route";

const app: Express = express();

dotenv.config();
connectDb();

// Middlewares
app.use(express.json());
app.use(cors());

app.use(express.static("uploads/"));

app.use(
  session({
    secret: process.env.JWT_SECRET as string,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.DATABASE_URI }),
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }, // 1 day
  }),
);

// Route to serve files from the uploads folder
app.get("/uploads/:file", (req, res) => {
  const fileName = req.params.file;
  const filePath = path.join(__dirname, "uploads", fileName);

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

export default app;
