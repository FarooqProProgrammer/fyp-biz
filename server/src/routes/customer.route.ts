import express, { Router } from "express"
import { createCustomer, deleteCustomer, getAllCustomer, getSingleCustomer, updateCustomer } from "../controller/customer.controller";
import { authMiddleware } from "../middleware/auth-middleware";
import { protectRoute } from "../middleware/protect-route";
const customerRouter: Router  = express.Router();




customerRouter.route("/customer").post(protectRoute,createCustomer).get(protectRoute,getAllCustomer)
customerRouter.route("/customer/:id").delete(deleteCustomer).get(getSingleCustomer).put(updateCustomer)


export default customerRouter