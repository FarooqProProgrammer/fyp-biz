import { Request, Response } from "express";
import InvoiceModel from "../models/Invoice.model";
import { invoiceSchema } from "../validations/invoiceValidation";
import nodemailer from "nodemailer";
import CustomerModel from "../models/customer.model";
import path from "path";
import fs from "fs";

export const CreateInvoice = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    console.log(req.body);
    const userId = req.user?.id;

    const { error, value } = invoiceSchema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      res.status(400).json({
        success: false,
        message: "Validation Error",
        errors: error.details.map((err) => err.message),
      });
      return;
    }

    const payload = {
      ...req.body,
      userId,
    };

    const newInvoice = new InvoiceModel(payload);
    console.log(newInvoice);
    await newInvoice.save();

    if (newInvoice?.clientId) {
      await sendInvoiceEmail(newInvoice, newInvoice.clientId.toString());
    } else {
      console.error("Client ID is undefined.");
    }

    res.status(201).json({ success: true, invoice: newInvoice });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Internal Server Error", error });
  }
};

export const getAllInvoice = async (req: Request, res: Response): Promise<void> => {
  try {
  
    if (!req.user || !req.user.id) {
       res.status(401).json({ success: false, message: "Unauthorized" });
       return
    }

    const userId = req.user.id;
    console.log("Fetching invoices for user:", userId);

    const invoices = await InvoiceModel.find({ userId })
      .populate("clientId") 
      .populate("userId");

    console.log("Invoices fetched:", invoices.length);
    
    res.status(200).json({ success: true, invoices });
  } catch (error) {
    console.error("Error fetching invoices:", error);
    res.status(500).json({ success: false, message: "Internal Server Error", error });
  }
};


export const getAllSingleQuery = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;

    const invoices = await InvoiceModel.findById(id).populate("clientId");

    res.status(200).json({ success: true, invoices });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Internal Server Error", error });
  }
};

export const deletInvoice = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if the customer exists
    const customer = await InvoiceModel.findById(id);
    if (!customer) {
      res.status(404).json({ success: false, message: "Invoice not found" });
      return;
    }

    // Delete the customer
    await InvoiceModel.findByIdAndDelete(id);

    res
      .status(200)
      .json({ success: true, message: "Invoice deleted successfully" });
  } catch (error) {
    console.error("Error deleting customer:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const sendInvoiceEmail = async (newInvoice: any, clientId: string) => {
  try {
    // Fetch client details using clientId, not invoiceId
    const populatedInvoice = await CustomerModel.findById(clientId);

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
      customer: populatedInvoice,
    };

    const templatePath = path.join(__dirname, "../views", "email.html");
    let emailHtml = fs.readFileSync(templatePath, "utf8");
    emailHtml = emailHtml.replace(
      /{{customer_email}}/g,
      populatedInvoice?.email,
    );

    const transporter = nodemailer.createTransport({
      host: "localhost",
      port: 1025,
      secure: false,
      auth: {
        user: "your-email@example.com",
        pass: "your-email-password",
      },
    });

    const mailOptions = {
      from: '"Your Company" <your-email@example.com>',
      to: clientEmail,
      subject: `Invoice #${newInvoice.invoiceNumber}`,
      html: emailHtml,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Invoice email sent:", info.messageId);
  } catch (error) {
    console.error("Error sending invoice email:", error);
  }
};
