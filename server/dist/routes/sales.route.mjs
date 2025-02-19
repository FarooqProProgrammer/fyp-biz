// src/routes/sales.route.ts
import express from "express";

// src/models/Invoice.model.ts
import mongoose from "mongoose";
var InvoiceSchema = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer"
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true
    },
    Service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true
    },
    invoiceNumber: {
      type: String,
      required: true,
      unique: true
    },
    invoiceDate: {
      type: Date,
      required: true
    },
    invoiceAmount: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ["pending", "paid", "cancelled"],
      default: "pending"
    },
    items: [
      {
        description: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true }
      }
    ]
  },
  {
    timestamps: true
  }
);
var InvoiceModel = mongoose.model(
  "Invoice",
  InvoiceSchema
);
var Invoice_model_default = InvoiceModel;

// src/controller/sales.controller.js
import ARIMA from "arima";
import nodemailer from "nodemailer";
var GenerateSales = async (req, res) => {
  try {
    const invoices = await Invoice_model_default.find(
      {},
      { _id: 0, invoiceDate: 1, invoiceAmount: 1 }
    );
    if (!invoices || invoices.length === 0) {
      res.status(404).json({ success: false, message: "No invoice data found" });
      return;
    }
    const salesData = invoices.map((invoice) => ({
      ds: invoice.invoiceDate,
      y: invoice.invoiceAmount
    }));
    salesData.sort((a, b) => new Date(a.ds).getTime() - new Date(b.ds).getTime());
    const ts = salesData.map((data) => data.y);
    if (ts.length < 3) {
      res.status(400).json({ success: false, message: "Not enough sales data for forecasting" });
      return;
    }
    const arima = new ARIMA({ p: 1, d: 1, q: 1, verbose: false }).train(ts);
    const forecast = arima.forecast(7);
    const lastDate = new Date(salesData[salesData.length - 1].ds);
    const forecastData = [];
    for (let i = 0; i < forecast.length; i++) {
      const forecastDate = new Date(lastDate);
      forecastDate.setDate(forecastDate.getDate() + i + 1);
      forecastData.push({
        ds: forecastDate.toISOString().split("T")[0],
        yhat: forecast[i]
      });
    }
    const responsePayload = {
      success: true,
      salesData,
      forecastData
    };
    const email = req.query.email;
    let email_status = null;
    if (email) {
      try {
        const transporter = nodemailer.createTransport({
          host: "localhost",
          port: 1025,
          secure: false
        });
        const mailOptions = {
          from: "no-reply@example.com",
          to: email,
          subject: "Sales Forecast Report",
          text: JSON.stringify(responsePayload, null, 2)
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

// src/routes/sales.route.ts
var SalesRouter = express.Router();
SalesRouter.route("/sales").get(GenerateSales);
var sales_route_default = SalesRouter;
export {
  sales_route_default as default
};
//# sourceMappingURL=sales.route.mjs.map