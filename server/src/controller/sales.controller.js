// @ts-nocheck

import InvoiceModel from "../models/Invoice.model"; 
import ARIMA from "arima";
import nodemailer from "nodemailer";

export const GenerateSales = async (req, res) => {
  try {
    // Fetch all invoices (adjust the query/fields as needed)
    const invoices = await InvoiceModel.find(
      {},
      { _id: 0, invoiceDate: 1, invoiceAmount: 1 }
    );

    if (!invoices || invoices.length === 0) {
      res.status(404).json({ success: false, message: "No invoice data found" });
      return;
    }

    // Map invoices to sales data
    const salesData = invoices.map((invoice) => ({
      ds: invoice.invoiceDate,
      y: invoice.invoiceAmount,
    }));

    // Sort sales data by date (ascending)
    salesData.sort((a, b) => new Date(a.ds).getTime() - new Date(b.ds).getTime());

    // Create a time series array for forecasting
    const ts = salesData.map((data) => data.y);
    if (ts.length < 3) {
      res.status(400).json({ success: false, message: "Not enough sales data for forecasting" });
      return;
    }

    // Train ARIMA model using (p=1, d=1, q=1) parameters
    const arima = new ARIMA({ p: 1, d: 1, q: 1, verbose: false }).train(ts);
    // Forecast the next 7 data points
    const forecast = arima.forecast(7);

    // Compute forecast dates starting from the day after the last invoice date
    const lastDate = new Date(salesData[salesData.length - 1].ds);
    const forecastData = [];
    for (let i = 0; i < forecast.length; i++) {
      const forecastDate = new Date(lastDate);
      forecastDate.setDate(forecastDate.getDate() + i + 1);
      forecastData.push({
        ds: forecastDate.toISOString().split("T")[0],
        yhat: forecast[i],
      });
    }

    // Prepare response payload
    const responsePayload = {
      success: true,
      salesData,
      forecastData,
    };

    // Check if an email parameter is provided in the query string
    const email = req.query.email;
    let email_status = null;
    if (email) {
      try {
        const transporter = nodemailer.createTransport({
          host: "localhost",
          port: 1025,
          secure: false,
        });
        const mailOptions = {
          from: "no-reply@example.com",
          to: email,
          subject: "Sales Forecast Report",
          text: JSON.stringify(responsePayload, null, 2),
        };
        await transporter.sendMail(mailOptions);
        email_status = `Email sent successfully to ${email}`;
      } catch (err) {
        email_status = `Email sending failed: ${err.toString()}`;
      }
    }
    responsePayload["email_status"] = email_status;

    res.status(200).json(responsePayload);
  } catch (error) {
    console.error("Error fetching sales data:", error);
    res.status(500).json({ success: false, message: "Internal Server Error", error });
  }
};
