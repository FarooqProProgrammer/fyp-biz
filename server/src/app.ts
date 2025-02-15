import express, { Express } from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRouter from "./routes/auth.route";
import connectDb from "./config/connection";

const app: Express = express();

dotenv.config();
connectDb()

// Middlewares
app.use(express.json());
app.use(cors());

app.use(express.static("uploads/"))


// All Routes
app.use(authRouter)



export default app;