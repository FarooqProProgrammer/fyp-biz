// src/models/customer.model.ts
import mongoose from "mongoose";
var CustomerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
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
      type: mongoose.Schema.Types.ObjectId,
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
var CustomerModel = mongoose.model(
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
export {
  createCustomer,
  deleteCustomer,
  getAllCustomer,
  getSingleCustomer,
  updateCustomer
};
//# sourceMappingURL=customer.controller.mjs.map