import express,{Router} from "express"
import { createService } from "../controller/service.controller";


const serviceRouter: Router = express.Router();



serviceRouter.route("/service").post(createService)


export default serviceRouter