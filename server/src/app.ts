import express, { Express } from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRouter from "./routes/auth.route";
import connectDb from "./config/connection";
import path from "path";
import customerRouter from "./routes/customer.route";
import serviceRouter from "./routes/service.route";



const app: Express = express();

dotenv.config();
connectDb()

// Middlewares
app.use(express.json());
app.use(cors());

app.use(express.static("uploads/"))

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
app.use(authRouter)
app.use(customerRouter)
app.use(serviceRouter)



export default app;