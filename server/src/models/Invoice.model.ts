import mongoose, { Document, Schema, Model } from "mongoose";

export interface IInvoice extends Document {
  customerId: mongoose.Schema.Types.ObjectId;
  invoiceAmount: number;
  invoiceNumber: string;
  status: "pending" | "paid" | "cancelled";
  dueDate: Date;
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const InvoiceSchema: Schema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
    },
    invoiceAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "paid", "cancelled"],
      default: "pending",
    },
    dueDate: {
      type: Date,
      required: true,
    },
    items: [
      {
        description: { type: String, required: true },
        quantity: { type: Number, required: true },
        unitPrice: { type: Number, required: true },
        total: { type: Number, required: true },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const InvoiceModel: Model<IInvoice> = mongoose.model<IInvoice>(
  "Invoice",
  InvoiceSchema
);

export default InvoiceModel;
