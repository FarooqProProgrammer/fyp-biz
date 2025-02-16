import { Request,Response } from "express"
import InvoiceModel from "../models/Invoice.model";


export const CreateInvoice = async (req: Request, res: Response): Promise<void> => {
    try {
        const newInvoice = new InvoiceModel(req.body);

        await newInvoice.save();
        res.status(201).json({ success: true, invoice: newInvoice });

    } catch (error) {
        res.status(500).json({ success: false, message: error });
    }
}