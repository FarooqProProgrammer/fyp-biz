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

// src/routes/invoice.route.ts
var invoice_route_exports = {};
__export(invoice_route_exports, {
  default: () => invoice_route_default
});
module.exports = __toCommonJS(invoice_route_exports);
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

// src/validations/invoiceValidation.ts
var import_joi = __toESM(require("joi"));
var invoiceSchema = import_joi.default.object({
  clientId: import_joi.default.string().optional(),
  invoiceNumber: import_joi.default.string().required(),
  invoiceDate: import_joi.default.date().required(),
  Service: import_joi.default.string().required(),
  invoiceAmount: import_joi.default.number().required(),
  status: import_joi.default.string().valid("pending", "paid", "cancelled").default("pending"),
  items: import_joi.default.array().items(
    import_joi.default.object({
      description: import_joi.default.string().required(),
      quantity: import_joi.default.number().integer().min(1).required(),
      price: import_joi.default.number().positive().required()
    })
  ).min(1).required()
});

// src/controller/invoice.controller.ts
var import_nodemailer = __toESM(require("nodemailer"));

// src/models/customer.model.ts
var import_mongoose2 = __toESM(require("mongoose"));
var CustomerSchema = new import_mongoose2.default.Schema(
  {
    name: {
      type: String,
      required: true
    },
    userId: {
      type: import_mongoose2.default.Schema.Types.ObjectId,
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
      type: import_mongoose2.default.Schema.Types.ObjectId,
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
var CustomerModel = import_mongoose2.default.model(
  "Customer",
  // Ensure the model name is capitalized
  CustomerSchema
);
var customer_model_default = CustomerModel;

// src/controller/invoice.controller.ts
var import_path = __toESM(require("path"));
var import_fs = __toESM(require("fs"));
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
    const templatePath = import_path.default.join(__dirname, "../views", "email.html");
    let emailHtml = import_fs.default.readFileSync(templatePath, "utf8");
    emailHtml = emailHtml.replace(
      /{{customer_email}}/g,
      populatedInvoice?.email
    );
    const transporter = import_nodemailer.default.createTransport({
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

// src/middleware/protect-route.ts
var import_jsonwebtoken = __toESM(require("jsonwebtoken"));
var SECRET_KEY = process.env.JWT_SECRET || "your-secret-key";
var protectRoute = (req, res, next) => {
  const authHeader = req.headers.authorization || req.cookies.token;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ message: "Unauthorized access. No token provided." });
    return;
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = import_jsonwebtoken.default.verify(token, SECRET_KEY);
    req.user = { id: decoded.id };
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token." });
  }
};

// src/routes/invoice.route.ts
var invoiceRouter = import_express.default.Router();
invoiceRouter.route("/invoice").post(protectRoute, CreateInvoice).get(protectRoute, getAllInvoice);
invoiceRouter.route("/invoice/:id").get(getAllSingleQuery).delete(protectRoute, deletInvoice);
var invoice_route_default = invoiceRouter;
//# sourceMappingURL=invoice.route.js.map