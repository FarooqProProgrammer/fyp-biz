"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/routes/service.route.ts
var service_route_exports = {};
__export(service_route_exports, {
  default: () => service_route_default
});
module.exports = __toCommonJS(service_route_exports);
var import_express = __toESM(require("express"));

// src/models/service.model.ts
var import_mongoose = __toESM(require("mongoose"));
var ServiceSchema = new import_mongoose.default.Schema(
  {
    serviceName: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    userId: import_mongoose.default.Types.ObjectId
  },
  {
    timestamps: true
  }
);
var ServiceModel = import_mongoose.default.model("Service", ServiceSchema);
var service_model_default = ServiceModel;

// src/controller/service.controller.ts
var createService = async (req, res) => {
  try {
    const { serviceName, description } = req.body;
    const userId = req.user?.id;
    const service = new service_model_default({ serviceName, description, userId });
    await service.save();
    res.status(200).json({ message: true, serviceName });
  } catch (error) {
    res.status(200).json({ message: false, error });
  }
};
var updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const { serviceName } = req.body;
    const updatedService = await service_model_default.findByIdAndUpdate(
      id,
      { serviceName },
      { new: true, runValidators: true }
    );
    if (!updatedService) {
      res.status(404).json({ message: false, error: "Service not found" });
      return;
    }
    res.status(200).json({ message: true, service: updatedService });
  } catch (error) {
    res.status(500).json({ message: false, error });
  }
};
var getAllService = async (req, res) => {
  try {
    const userId = req.user?.id;
    console.log(userId);
    const service = await service_model_default.find({ userId });
    res.status(200).json({ message: true, service });
  } catch (error) {
    res.status(200).json({ message: true, error });
  }
};
var deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await service_model_default.findById(id);
    if (!service) {
      res.status(404).json({ message: false, error: "Service not found" });
      return;
    }
    await service.deleteOne();
    res.status(200).json({ message: true, id });
  } catch (error) {
    res.status(500).json({ message: false, error });
  }
};

// src/middleware/protect-route.ts
var import_jsonwebtoken = __toESM(require("jsonwebtoken"));
var SECRET_KEY = process.env.JWT_SECRET || "your-secret-key";
var protectRoute = (req, res, next) => {
  const authHeader = req.headers.authorization || req.cookies.token;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ message: "Unauthorized access. No token provided." });
    return;
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = import_jsonwebtoken.default.verify(token, SECRET_KEY);
    req.user = { id: decoded.id };
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token." });
  }
};

// src/routes/service.route.ts
var serviceRouter = import_express.default.Router();
serviceRouter.route("/service").post(protectRoute, createService).get(protectRoute, getAllService);
serviceRouter.route("/service/:id").put(updateService).delete(deleteService);
var service_route_default = serviceRouter;
//# sourceMappingURL=service.route.js.map