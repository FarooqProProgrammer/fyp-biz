import mongoose, { Document, Schema, Model } from "mongoose";

export interface IInvoice extends Document {
  clientId?: string;
  invoiceNumber: string;
  invoiceDate: Date;
  invoiceAmount: number;
  status: "pending" | "paid" | "cancelled";
  items: {
    description: string;
    quantity: number;
    price: number;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const InvoiceSchema: Schema = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "customer",
    },
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
    },
    invoiceDate: {
      type: Date,
      required: true,
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
    items: [
      {
        description: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
      },
    ],
  },
  {
    timestamps: true,
  },
);

const InvoiceModel: Model<IInvoice> = mongoose.model<IInvoice>(
  "Invoice",
  InvoiceSchema,
);

export default InvoiceModel;
