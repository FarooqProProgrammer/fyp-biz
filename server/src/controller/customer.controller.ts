import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import CustomerModel from "../models/customer.model";


export const createCustomer = async (req: Request, res: Response): Promise<void> => {

    try {
        const { name, email, phone, address } = req.body;

        console.log(req.body)

        // Check if customer already exists
        const existingCustomer = await CustomerModel.findOne({ email });
        if (existingCustomer) {
            res.status(400).json({ message: "Customer with this email already exists." });
            return;
        }

        // Hash the password

        // Create new customer
        const newCustomer = new CustomerModel({
            name,
            email,
            phone,
            address,

        });

        // Save customer to the database
        await newCustomer.save();

        res.status(201).json({
            message: "Customer created successfully",
            customer: {
                id: newCustomer._id,
                name: newCustomer.name,
                email: newCustomer.email,
                phone: newCustomer.phone,
                address: newCustomer.address,
            },
        });
    } catch (error) {
        console.error("Error creating customer:", error);
        res.status(500).json({ message: "Internal Server Error", error });
    }
};

export const getAllCustomer = async (req: Request, res: Response): Promise<void> => {
    try {
        const customer = await CustomerModel.find();
        res.status(201).send(customer)
    } catch (error) {
        res.status(500).send(error)
    }
}
