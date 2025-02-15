import express, { Router } from "express"
import { createCustomer, deleteCustomer, getAllCustomer, getSingleCustomer, updateCustomer } from "../controller/customer.controller";
const customerRouter: Router  = express.Router();




customerRouter.route("/customer").post(createCustomer).get(getAllCustomer)
customerRouter.route("/customer/:id").delete(deleteCustomer).get(getSingleCustomer).put(updateCustomer)


export default customerRouter