import express, { Router } from "express"
import { createCustomer, getAllCustomer } from "../controller/customer.controller";
const customerRouter: Router  = express.Router();




customerRouter.route("/customer").post(createCustomer).get(getAllCustomer)



export default customerRouter