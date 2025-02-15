import express,{Router} from "express"
import { createService, deleteService, getAllService, updateService } from "../controller/service.controller";


const serviceRouter: Router = express.Router();



serviceRouter.route("/service").post(createService).get(getAllService)
serviceRouter.route("/service/:id").put(updateService).delete(deleteService)


export default serviceRouter