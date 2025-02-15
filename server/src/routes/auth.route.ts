import express, { Router } from "express"
import upload from "../lib/multer";
import { register } from "../controller/auth.controller";
const authRouter: Router  = express.Router();




authRouter.post("/register",upload.single("image"),register)



export default authRouter