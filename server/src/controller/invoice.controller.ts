import { Request, Response } from "express";
import InvoiceModel from "../models/Invoice.model";
import { invoiceSchema } from "../validations/invoiceValidation";
import nodemailer from "nodemailer";
import CustomerModel from "../models/customer.model";
import path from "path";
import fs from "fs"


export const CreateInvoice = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    console.log(req.body);

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

    const newInvoice = new InvoiceModel(req.body);
    console.log(newInvoice)
    await newInvoice.save();

    // Send invoice email to the customer
    await sendInvoiceEmail(newInvoice,newInvoice?.clientId?.toString());

    res.status(201).json({ success: true, invoice: newInvoice });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Internal Server Error", error });
  }
};



export const getAllInvoice = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const invoices = await InvoiceModel.find().populate("clientId");
    console.log(invoices)
    res.status(200).json({ success: true, invoices });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Internal Server Error", error });
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


export const deletInvoice = async (req: Request, res: Response): Promise<void> => {
  try {
      const { id } = req.params;

      // Check if the customer exists
      const customer = await InvoiceModel.findById(id);
      if (!customer) {
         res.status(404).json({ success: false, message: 'Invoice not found' });
         return 
      }

      // Delete the customer
      await InvoiceModel.findByIdAndDelete(id);

      res.status(200).json({ success: true, message: 'Invoice deleted successfully' });
  } catch (error) {
      console.error('Error deleting customer:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
  }
};




const sendInvoiceEmail = async (newInvoice: any, invoice: any) => {
  try {
    // Populate client details
    const populatedInvoice = await CustomerModel.findById(invoice);
    console.log(populatedInvoice);

    if (!populatedInvoice) {
      console.error("Client details not found for invoice:", invoice._id);
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

    const templatePath = path.join(__dirname, "../views", "email.html")
    

    let emailHtml = fs.readFileSync(templatePath, "utf8");
    emailHtml = emailHtml.replace(/{{customer_email}}/g, populatedInvoice?.email);


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