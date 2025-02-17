import express,{Router} from "express"
import { createService, deleteService, getAllService, updateService } from "../controller/service.controller";
import { protectRoute } from "../middleware/protect-route";


const serviceRouter: Router = express.Router();



serviceRouter.route("/service").post(protectRoute, createService).get(getAllService)
serviceRouter.route("/service/:id").put(updateService).delete(deleteService)


export default serviceRouter