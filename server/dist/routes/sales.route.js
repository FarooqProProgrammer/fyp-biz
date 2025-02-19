"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/routes/sales.route.ts
var sales_route_exports = {};
__export(sales_route_exports, {
  default: () => sales_route_default
});
module.exports = __toCommonJS(sales_route_exports);
var import_express = __toESM(require("express"));

// src/models/Invoice.model.ts
var import_mongoose = __toESM(require("mongoose"));
var InvoiceSchema = new import_mongoose.default.Schema(
  {
    clientId: {
      type: import_mongoose.default.Schema.Types.ObjectId,
      ref: "Customer"
    },
    userId: {
      type: import_mongoose.default.Schema.Types.ObjectId,
      ref: "user",
      required: true
    },
    Service: {
      type: import_mongoose.default.Schema.Types.ObjectId,
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
var InvoiceModel = import_mongoose.default.model(
  "Invoice",
  InvoiceSchema
);
var Invoice_model_default = InvoiceModel;

// src/controller/sales.controller.js
var import_arima = __toESM(require("arima"));
var import_nodemailer = __toESM(require("nodemailer"));
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
    const arima = new import_arima.default({ p: 1, d: 1, q: 1, verbose: false }).train(ts);
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
        const transporter = import_nodemailer.default.createTransport({
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
var SalesRouter = import_express.default.Router();
SalesRouter.route("/sales").get(GenerateSales);
var sales_route_default = SalesRouter;
//# sourceMappingURL=sales.route.js.map