import { Request, Response } from "express";
import InvoiceModel from "../models/Invoice.model";
import * as TS from "timeseries-analysis";

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
        // Fetch invoices from MongoDB
        const invoices: Invoice[] = await InvoiceModel.find().lean();

        if (!invoices.length) {
            res.status(404).json({ success: false, message: "No invoices found" });
            return;
        }

        // Format sales data and sort by date (ascending)
        const salesData: SalesData[] = invoices
            .map((invoice: Invoice): SalesData => ({
                ds: new Date(invoice.invoiceDate).toISOString().slice(0, 10),
                y: invoice.invoiceAmount,
            }))
            .sort((a, b) => new Date(a.ds).getTime() - new Date(b.ds).getTime());

        // Convert sales data into a time series
        const t = new TS.main(
            salesData.map((point): [number, number] => [new Date(point.ds).getTime(), point.y])
        );

        // Apply moving average smoothing
        const smoothed: [number, number][] = t.ma({ period: 7 }).output();

        // Generate forecast for the next 7 days
        const lastDate: Date = new Date(salesData[salesData.length - 1].ds);
        const forecast: ForecastData[] = smoothed.slice(-7).map(([timestamp, value], index) => {
            const futureDate = new Date(lastDate);
            futureDate.setDate(lastDate.getDate() + index + 1);
            return {
                ds: futureDate.toISOString().slice(0, 10),
                yhat: value,
            };
        });

        // Send response with historical sales data and forecast
        res.status(200).json({ success: true, invoices: salesData, forecast });

    } catch (error: unknown) {
        console.error("Error fetching sales data:", error);
        res.status(500).json({ success: false, message: "Internal Server Error", error });
    }
};
