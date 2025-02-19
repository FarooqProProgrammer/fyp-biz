import express, { Router } from "express"
import upload from "../lib/multer";
import { forgotPassword, login, logout, register, verifyOtp } from "../controller/auth.controller";
const authRouter  = express.Router();




authRouter.post("/register",upload.single("image"),register)
authRouter.post("/login",login)
authRouter.route('/logout').post(logout)
authRouter.route('/otp-verify').post(verifyOtp)
authRouter.route('/forgot-password').post(forgotPassword)


export default authRouter