import express from "express";
// @ts-ignore
import { GenerateSales } from "../controller/sales.controller.js";

const SalesRouter = express.Router();


SalesRouter.route("/sales").get(GenerateSales)



export default SalesRouter;

