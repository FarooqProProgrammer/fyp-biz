// src/models/Invoice.model.ts
import mongoose from "mongoose";
var InvoiceSchema = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer"
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true
    },
    Service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true
    },
    invoiceNumber: {
      type: String,
      required: true,
      unique: true
    },
    invoiceDate: {
      type: Date,
      required: true
    },
    invoiceAmount: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ["pending", "paid", "cancelled"],
      default: "pending"
    },
    items: [
      {
        description: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true }
      }
    ]
  },
  {
    timestamps: true
  }
);
var InvoiceModel = mongoose.model(
  "Invoice",
  InvoiceSchema
);
var Invoice_model_default = InvoiceModel;
export {
  Invoice_model_default as default
};
//# sourceMappingURL=Invoice.model.mjs.map