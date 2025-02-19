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

// src/routes/customer.route.ts
var customer_route_exports = {};
__export(customer_route_exports, {
  default: () => customer_route_default
});
module.exports = __toCommonJS(customer_route_exports);
var import_express = __toESM(require("express"));

// src/models/customer.model.ts
var import_mongoose = __toESM(require("mongoose"));
var CustomerSchema = new import_mongoose.default.Schema(
  {
    name: {
      type: String,
      required: true
    },
    userId: {
      type: import_mongoose.default.Schema.Types.ObjectId,
      ref: "User",
      // Ensure this references the correct model name
      required: true
      // Assuming clientId should be required
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    phone: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: false
    },
    service: {
      type: import_mongoose.default.Schema.Types.ObjectId,
      ref: "Service",
      // Ensure this references the correct model name
      required: true
    }
  },
  {
    timestamps: true
    // Mongoose will automatically manage createdAt and updatedAt
  }
);
var CustomerModel = import_mongoose.default.model(
  "Customer",
  // Ensure the model name is capitalized
  CustomerSchema
);
var customer_model_default = CustomerModel;

// src/controller/customer.controller.ts
var createCustomer = async (req, res) => {
  try {
    const { name, email, phone, address, service } = req.body;
    const userId = req.user?.id;
    console.log(req.body);
    const existingCustomer = await customer_model_default.findOne({ email });
    if (existingCustomer) {
      res.status(400).json({ message: "Customer with this email already exists." });
      return;
    }
    const newCustomer = new customer_model_default({
      name,
      email,
      phone,
      address,
      service,
      userId
    });
    await newCustomer.save();
    res.status(201).json({
      message: "Customer created successfully",
      customer: {
        id: newCustomer._id,
        name: newCustomer.name,
        email: newCustomer.email,
        phone: newCustomer.phone,
        address: newCustomer.address
      }
    });
  } catch (error) {
    console.error("Error creating customer:", error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
};
var getAllCustomer = async (req, res) => {
  try {
    const userId = req.user?.id;
    const customer = await customer_model_default.find({ userId }).populate("service");
    console.log(customer);
    res.status(201).send(customer);
  } catch (error) {
    res.status(500).send(error);
  }
};
var deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await customer_model_default.findById(id);
    if (!customer) {
      res.status(404).json({ success: false, message: "Customer not found" });
      return;
    }
    await customer_model_default.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Customer deleted successfully" });
  } catch (error) {
    console.error("Error deleting customer:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
var getSingleCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await customer_model_default.findById(id);
    res.status(200).json({ success: true, data: customer });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
var updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, address, service } = req.body;
    console.log(req.body);
    const updatedCustomer = await customer_model_default.findByIdAndUpdate(
      id,
      { $set: { name, email, phone, address, service } },
      { new: true, runValidators: true }
    );
    if (!updatedCustomer) {
      res.status(404).json({ message: "Customer not found." });
      return;
    }
    res.status(200).json({
      message: "Customer updated successfully",
      customer: updatedCustomer
    });
  } catch (error) {
    console.error("Error updating customer:", error);
    res.status(500).json({ message: "Internal Server Error", error });
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

// src/routes/customer.route.ts
var customerRouter = import_express.default.Router();
customerRouter.route("/customer").post(protectRoute, createCustomer).get(protectRoute, getAllCustomer);
customerRouter.route("/customer/:id").delete(deleteCustomer).get(getSingleCustomer).put(updateCustomer);
var customer_route_default = customerRouter;
//# sourceMappingURL=customer.route.js.map