import { Request, Response } from "express";
import InvoiceModel from "../models/Invoice.model";

interface Invoice {
    invoiceDate: string;
    invoiceAmount: number;
}

interface SalesData {
    ds: string;
    y: number;
}

interface ForecastData {
    ds: string;
    yhat: number;
}

export const GenerateSales = async (req: Request, res: Response): Promise<void> => {
    try {
        

    } catch (error: unknown) {
        console.error("Error fetching sales data:", error);
        res.status(500).json({ success: false, message: "Internal Server Error", error });
    }
};
