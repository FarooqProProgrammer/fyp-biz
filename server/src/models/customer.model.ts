import mongoose, { Document, Schema, Model } from "mongoose";

export interface ICustomer extends Document {
  name: string;
  email: string;
  phone: string;
  address?: string; 
  service: mongoose.Types.ObjectId; 
  createdAt: Date;
  updatedAt: Date;
}


const CustomerSchema: Schema<ICustomer> = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
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
      ref: "Service",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const CustomerModel: Model<ICustomer> = mongoose.model<ICustomer>(
  "customer",
  CustomerSchema,
);

export default CustomerModel;
