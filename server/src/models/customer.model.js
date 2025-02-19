import mongoose from "mongoose";


// Define the Customer schema
const CustomerSchema= new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Ensure this references the correct model name
      required: true, // Assuming clientId should be required
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: false,
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service", // Ensure this references the correct model name
      required: true,
    },
  },
  {
    timestamps: true, // Mongoose will automatically manage createdAt and updatedAt
  },
);

// Create and export the Customer model
const CustomerModel= mongoose.model(
  "Customer", // Ensure the model name is capitalized
  CustomerSchema,
);

export default CustomerModel;
