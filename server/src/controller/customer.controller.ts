import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import CustomerModel from "../models/customer.model";


export const createCustomer = async (req: Request, res: Response): Promise<void> => {

    try {
        const { name, email, phone, address,service } = req.body;

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
            service
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
        const customer = await CustomerModel.find().populate("service");
        res.status(201).send(customer)
    } catch (error) {
        res.status(500).send(error)
    }
}


export const deleteCustomer = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        // Check if the customer exists
        const customer = await CustomerModel.findById(id);
        if (!customer) {
           res.status(404).json({ success: false, message: 'Customer not found' });
           return 
        }

        // Delete the customer
        await CustomerModel.findByIdAndDelete(id);

        res.status(200).json({ success: true, message: 'Customer deleted successfully' });
    } catch (error) {
        console.error('Error deleting customer:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};


export const getSingleCustomer = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const customer = await CustomerModel.findById(id);
       
        res.status(200).json({ success: true, data: customer });


        
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error' });

    }
}


export const updateCustomer = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { name, email, phone, address,service } = req.body;

        console.log(req.body);

        // Check if customer exists
        const existingCustomer = await CustomerModel.findById(id);
        if (!existingCustomer) {
            res.status(404).json({ message: "Customer not found." });
            return;
        }

        // Update customer details
        existingCustomer.name = name || existingCustomer.name;
        existingCustomer.email = email || existingCustomer.email;
        existingCustomer.phone = phone || existingCustomer.phone;
        existingCustomer.address = address || existingCustomer.address;
        existingCustomer.service = service || existingCustomer.service;

        await existingCustomer.save();

        res.status(200).json({
            message: "Customer updated successfully",
            customer: {
                id: existingCustomer._id,
                name: existingCustomer.name,
                email: existingCustomer.email,
                phone: existingCustomer.phone,
                address: existingCustomer.address,
                service: existingCustomer.service,
            },
        });
    } catch (error) {
        console.error("Error updating customer:", error);
        res.status(500).json({ message: "Internal Server Error", error });
    }
};