import express from "express";
import { GenerateSales } from "../controller/sales.controller";


const SalesRouter = express.Router();


SalesRouter.route("/sales").get(GenerateSales)



export default SalesRouter;

