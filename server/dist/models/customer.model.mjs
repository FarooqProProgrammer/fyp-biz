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
export {
  customer_model_default as default
};
//# sourceMappingURL=customer.model.mjs.map