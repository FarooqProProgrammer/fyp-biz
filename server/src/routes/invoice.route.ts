import express, { Router } from "express";
import { CreateInvoice, getAllInvoice, getAllSingleQuery } from "../controller/invoice.controller";
import { protectRoute } from "../middleware/protect-route";

const invoiceRouter: Router = express.Router();

invoiceRouter.route("/invoice").post(protectRoute, CreateInvoice).get(protectRoute,getAllInvoice);
invoiceRouter.route("/invoice/:id").get(getAllSingleQuery)

export default invoiceRouter;
