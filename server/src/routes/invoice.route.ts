import express, { Router } from "express";
import { CreateInvoice } from "../controller/invoice.controller";
import { protectRoute } from "../middleware/protect-route";

const invoiceRouter: Router = express.Router();

invoiceRouter.route("/invoice").post(protectRoute, CreateInvoice);

export default invoiceRouter;
