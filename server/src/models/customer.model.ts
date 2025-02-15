import mongoose, { Document, Schema, Model } from "mongoose";

// Define Customer Interface
export interface ICustomer extends Document {
    name: string;
    email: string;
    phone: string;
    address?: string; // Optional field
    createdAt: Date;
    updatedAt: Date;
}

// Define Customer Schema
const CustomerSchema: Schema<ICustomer> = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        phone: {
            type: String,
            required: true,
          
        },
        address: {
            type: String,
            required: false,
        },
    },
    {
        timestamps: true
    }
);

// Create Customer Model with Type Support
const CustomerModel: Model<ICustomer> = mongoose.model<ICustomer>("customer", CustomerSchema);

export default CustomerModel;
