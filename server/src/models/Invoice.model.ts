import mongoose, { Document, Schema, Model } from "mongoose";

export interface IInvoice extends Document {
  clientId?: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  Service?: mongoose.Types.ObjectId;
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
      ref: "Customer",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user", 
      required: true,
    },
    Service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service", 
      required: true,
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
      type: String,
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
