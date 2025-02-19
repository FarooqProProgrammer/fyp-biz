// src/routes/service.route.ts
import express from "express";

// src/models/service.model.ts
import mongoose from "mongoose";
var ServiceSchema = new mongoose.Schema(
  {
    serviceName: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    userId: mongoose.Types.ObjectId
  },
  {
    timestamps: true
  }
);
var ServiceModel = mongoose.model("Service", ServiceSchema);
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
import jwt from "jsonwebtoken";
var SECRET_KEY = process.env.JWT_SECRET || "your-secret-key";
var protectRoute = (req, res, next) => {
  const authHeader = req.headers.authorization || req.cookies.token;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ message: "Unauthorized access. No token provided." });
    return;
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = { id: decoded.id };
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token." });
  }
};

// src/routes/service.route.ts
var serviceRouter = express.Router();
serviceRouter.route("/service").post(protectRoute, createService).get(protectRoute, getAllService);
serviceRouter.route("/service/:id").put(updateService).delete(deleteService);
var service_route_default = serviceRouter;
export {
  service_route_default as default
};
//# sourceMappingURL=service.route.mjs.map