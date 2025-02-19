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

// src/validations/invoiceValidation.ts
import Joi from "joi";
var invoiceSchema = Joi.object({
  clientId: Joi.string().optional(),
  invoiceNumber: Joi.string().required(),
  invoiceDate: Joi.date().required(),
  Service: Joi.string().required(),
  invoiceAmount: Joi.number().required(),
  status: Joi.string().valid("pending", "paid", "cancelled").default("pending"),
  items: Joi.array().items(
    Joi.object({
      description: Joi.string().required(),
      quantity: Joi.number().integer().min(1).required(),
      price: Joi.number().positive().required()
    })
  ).min(1).required()
});

// src/controller/invoice.controller.ts
import nodemailer from "nodemailer";

// src/models/customer.model.ts
import mongoose2 from "mongoose";
var CustomerSchema = new mongoose2.Schema(
  {
    name: {
      type: String,
      required: true
    },
    userId: {
      type: mongoose2.Schema.Types.ObjectId,
      ref: "User",
      // Ensure this references the correct model name
      required: true
      // Assuming clientId should be required
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    phone: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: false
    },
    service: {
      type: mongoose2.Schema.Types.ObjectId,
      ref: "Service",
      // Ensure this references the correct model name
      required: true
    }
  },
  {
    timestamps: true
    // Mongoose will automatically manage createdAt and updatedAt
  }
);
var CustomerModel = mongoose2.model(
  "Customer",
  // Ensure the model name is capitalized
  CustomerSchema
);
var customer_model_default = CustomerModel;

// src/controller/invoice.controller.ts
import path from "path";
import fs from "fs";
var CreateInvoice = async (req, res) => {
  try {
    console.log(req.body);
    const userId = req.user?.id;
    const { error, value } = invoiceSchema.validate(req.body, {
      abortEarly: false
    });
    if (error) {
      res.status(400).json({
        success: false,
        message: "Validation Error",
        errors: error.details.map((err) => err.message)
      });
      return;
    }
    const payload = {
      ...req.body,
      userId
    };
    const newInvoice = new Invoice_model_default(payload);
    console.log(newInvoice);
    await newInvoice.save();
    if (newInvoice?.clientId) {
      await sendInvoiceEmail(newInvoice, newInvoice.clientId.toString());
    } else {
      console.error("Client ID is undefined.");
    }
    res.status(201).json({ success: true, invoice: newInvoice });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error", error });
  }
};
var getAllInvoice = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }
    const userId = req.user.id;
    console.log("Fetching invoices for user:", userId);
    const invoices = await Invoice_model_default.find({ userId }).populate("clientId").populate("userId");
    console.log("Invoices fetched:", invoices.length);
    res.status(200).json({ success: true, invoices });
  } catch (error) {
    console.error("Error fetching invoices:", error);
    res.status(500).json({ success: false, message: "Internal Server Error", error });
  }
};
var getAllSingleQuery = async (req, res) => {
  try {
    const { id } = req.params;
    const invoices = await Invoice_model_default.findById(id).populate("clientId");
    res.status(200).json({ success: true, invoices });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error", error });
  }
};
var deletInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await Invoice_model_default.findById(id);
    if (!customer) {
      res.status(404).json({ success: false, message: "Invoice not found" });
      return;
    }
    await Invoice_model_default.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Invoice deleted successfully" });
  } catch (error) {
    console.error("Error deleting customer:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
var sendInvoiceEmail = async (newInvoice, clientId) => {
  try {
    const populatedInvoice = await customer_model_default.findById(clientId);
    console.log("Populated Invoice:", populatedInvoice);
    if (!populatedInvoice) {
      console.error("Client details not found for clientId:", clientId);
      return;
    }
    const clientEmail = populatedInvoice?.email;
    if (!clientEmail) {
      console.error("Client email not found.");
      return;
    }
    const templateData = {
      ...newInvoice,
      customer: populatedInvoice
    };
    const templatePath = path.join(__dirname, "../views", "email.html");
    let emailHtml = fs.readFileSync(templatePath, "utf8");
    emailHtml = emailHtml.replace(
      /{{customer_email}}/g,
      populatedInvoice?.email
    );
    const transporter = nodemailer.createTransport({
      host: "localhost",
      port: 1025,
      secure: false,
      auth: {
        user: "your-email@example.com",
        pass: "your-email-password"
      }
    });
    const mailOptions = {
      from: '"Your Company" <your-email@example.com>',
      to: clientEmail,
      subject: `Invoice #${newInvoice.invoiceNumber}`,
      html: emailHtml
    };
    const info = await transporter.sendMail(mailOptions);
    console.log("Invoice email sent:", info.messageId);
  } catch (error) {
    console.error("Error sending invoice email:", error);
  }
};
export {
  CreateInvoice,
  deletInvoice,
  getAllInvoice,
  getAllSingleQuery
};
//# sourceMappingURL=invoice.controller.mjs.map