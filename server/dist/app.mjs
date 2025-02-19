// src/app.ts
import express6 from "express";
import cors from "cors";
import dotenv3 from "dotenv";

// src/routes/auth.route.ts
import express from "express";

// src/lib/multer.ts
import multer from "multer";
import path from "path";
var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  }
});
var fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"));
  }
};
var upload = multer({ storage, fileFilter });
var multer_default = upload;

// src/models/user.model.ts
import mongoose from "mongoose";
var UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true
    },
    image: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);
var UserModel = mongoose.model("user", UserSchema);
var user_model_default = UserModel;

// src/controller/auth.controller.ts
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

// src/models/otp.model.ts
import mongoose2, { Schema } from "mongoose";
var OtpSchema = new Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  expiresAt: { type: Date, required: true, index: { expires: "5m" } }
  // OTP expires in 5 minutes
});
var OtpModel = mongoose2.model("Otp", OtpSchema);
var otp_model_default = OtpModel;

// src/controller/auth.controller.ts
import nodemailer from "nodemailer";
dotenv.config();
var register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    console.log(req.body);
    const image = req.file ? req.file.path : "";
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const existingUser = await user_model_default.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: "User already exists" });
      return;
    }
    const newUser = new user_model_default({
      name,
      email,
      password: hashedPassword,
      image
    });
    await newUser.save();
    const otpCode = Math.floor(1e5 + Math.random() * 9e5).toString();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1e3);
    await otp_model_default.findByIdAndUpdate(
      { email },
      { otp: otpCode, expiresAt },
      { upsert: true }
    );
    await sendOtpEmail(email, otpCode);
    res.status(201).json({
      message: "User registered successfully. OTP sent to email.",
      user: newUser
    });
  } catch (error) {
    res.status(500).json({ message: "Error creating user", error });
  }
};
var login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(req.body);
    const user = await user_model_default.findOne({ email });
    if (!user) {
      res.status(400).json({ message: "Invalid email or password" });
      return;
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(400).json({ message: "Invalid email or password" });
      return;
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d"
    });
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1e3
    });
    req.session.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      image: user.image,
      token
    };
    const userObject = user.toObject();
    delete userObject.password;
    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        image: user.image,
        token
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error });
  }
};
var forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await user_model_default.findOne({ email });
    const otpCode = Math.floor(1e5 + Math.random() * 9e5).toString();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1e3);
    if (user) {
      await otp_model_default.findOneAndUpdate(
        { email },
        { otp: otpCode, expiresAt },
        { upsert: true }
      );
    } else {
      const otpRecord = new otp_model_default({ email, otp: otpCode, expiresAt });
      await otpRecord.save();
    }
    await sendOtpEmail(email, otpCode);
    res.status(200).json({
      message: "OTP sent to email for password reset."
    });
  } catch (error) {
    console.error("Error in forgotPassword:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
var sendOtpEmail = async (email, otpCode) => {
  try {
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
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP is: ${otpCode}. It expires in 60 minutes.`
    };
    await transporter.sendMail(mailOptions);
    console.log(`OTP sent to ${email}`);
  } catch (error) {
    console.error("Error sending OTP email:", error);
  }
};
var logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production"
    });
    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          res.status(500).json({ message: "Error logging out" });
          return;
        }
        res.status(200).json({ message: "Logout successful" });
      });
    } else {
      res.status(200).json({ message: "Logout successful" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error logging out", error });
  }
};
var verifyOtp = async (req, res) => {
  try {
    const { emailInput, otp } = req.body;
    console.log(req.body);
    const otpRecord = await otp_model_default.findOne({ email: emailInput, otp });
    console.log(otpRecord);
    if (!otpRecord) {
      res.status(400).json({ message: "Invalid OTP" });
      return;
    }
    if (/* @__PURE__ */ new Date() > otpRecord.expiresAt) {
      res.status(400).json({ message: "OTP has expired" });
      return;
    }
    await user_model_default.findOneAndUpdate(
      { email: emailInput },
      { isVerified: true }
    );
    await otp_model_default.deleteOne({ email: emailInput });
    res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ message: "Error verifying OTP", error });
  }
};

// src/routes/auth.route.ts
var authRouter = express.Router();
authRouter.post("/register", multer_default.single("image"), register);
authRouter.post("/login", login);
authRouter.route("/logout").post(logout);
authRouter.route("/otp-verify").post(verifyOtp);
authRouter.route("/forgot-password").post(forgotPassword);
var auth_route_default = authRouter;

// src/config/connection.ts
import mongoose3 from "mongoose";
import dotenv2 from "dotenv";
dotenv2.config();
var connectDb = async () => {
  try {
    if (!process.env.DATABASE_URI) {
      throw new Error("DATABASE_URI is not defined in environment variables.");
    }
    await mongoose3.connect(process.env.DATABASE_URI);
    console.log("MongoDB connected successfully!");
  } catch (error) {
    process.exit(1);
  }
};
var connection_default = connectDb;

// src/app.ts
import path3 from "path";

// src/routes/customer.route.ts
import express2 from "express";

// src/models/customer.model.ts
import mongoose4 from "mongoose";
var CustomerSchema = new mongoose4.Schema(
  {
    name: {
      type: String,
      required: true
    },
    userId: {
      type: mongoose4.Schema.Types.ObjectId,
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
      type: mongoose4.Schema.Types.ObjectId,
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
var CustomerModel = mongoose4.model(
  "Customer",
  // Ensure the model name is capitalized
  CustomerSchema
);
var customer_model_default = CustomerModel;

// src/controller/customer.controller.ts
var createCustomer = async (req, res) => {
  try {
    const { name, email, phone, address, service } = req.body;
    const userId = req.user?.id;
    console.log(req.body);
    const existingCustomer = await customer_model_default.findOne({ email });
    if (existingCustomer) {
      res.status(400).json({ message: "Customer with this email already exists." });
      return;
    }
    const newCustomer = new customer_model_default({
      name,
      email,
      phone,
      address,
      service,
      userId
    });
    await newCustomer.save();
    res.status(201).json({
      message: "Customer created successfully",
      customer: {
        id: newCustomer._id,
        name: newCustomer.name,
        email: newCustomer.email,
        phone: newCustomer.phone,
        address: newCustomer.address
      }
    });
  } catch (error) {
    console.error("Error creating customer:", error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
};
var getAllCustomer = async (req, res) => {
  try {
    const userId = req.user?.id;
    const customer = await customer_model_default.find({ userId }).populate("service");
    console.log(customer);
    res.status(201).send(customer);
  } catch (error) {
    res.status(500).send(error);
  }
};
var deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await customer_model_default.findById(id);
    if (!customer) {
      res.status(404).json({ success: false, message: "Customer not found" });
      return;
    }
    await customer_model_default.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Customer deleted successfully" });
  } catch (error) {
    console.error("Error deleting customer:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
var getSingleCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await customer_model_default.findById(id);
    res.status(200).json({ success: true, data: customer });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
var updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, address, service } = req.body;
    console.log(req.body);
    const updatedCustomer = await customer_model_default.findByIdAndUpdate(
      id,
      { $set: { name, email, phone, address, service } },
      { new: true, runValidators: true }
    );
    if (!updatedCustomer) {
      res.status(404).json({ message: "Customer not found." });
      return;
    }
    res.status(200).json({
      message: "Customer updated successfully",
      customer: updatedCustomer
    });
  } catch (error) {
    console.error("Error updating customer:", error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

// src/middleware/protect-route.ts
import jwt2 from "jsonwebtoken";
var SECRET_KEY = process.env.JWT_SECRET || "your-secret-key";
var protectRoute = (req, res, next) => {
  const authHeader = req.headers.authorization || req.cookies.token;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ message: "Unauthorized access. No token provided." });
    return;
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt2.verify(token, SECRET_KEY);
    req.user = { id: decoded.id };
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token." });
  }
};

// src/routes/customer.route.ts
var customerRouter = express2.Router();
customerRouter.route("/customer").post(protectRoute, createCustomer).get(protectRoute, getAllCustomer);
customerRouter.route("/customer/:id").delete(deleteCustomer).get(getSingleCustomer).put(updateCustomer);
var customer_route_default = customerRouter;

// src/routes/service.route.ts
import express3 from "express";

// src/models/service.model.ts
import mongoose5 from "mongoose";
var ServiceSchema = new mongoose5.Schema(
  {
    serviceName: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    userId: mongoose5.Types.ObjectId
  },
  {
    timestamps: true
  }
);
var ServiceModel = mongoose5.model("Service", ServiceSchema);
var service_model_default = ServiceModel;

// src/controller/service.controller.ts
var createService = async (req, res) => {
  try {
    const { serviceName, description } = req.body;
    const userId = req.user?.id;
    const service = new service_model_default({ serviceName, description, userId });
    await service.save();
    res.status(200).json({ message: true, serviceName });
  } catch (error) {
    res.status(200).json({ message: false, error });
  }
};
var updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const { serviceName } = req.body;
    const updatedService = await service_model_default.findByIdAndUpdate(
      id,
      { serviceName },
      { new: true, runValidators: true }
    );
    if (!updatedService) {
      res.status(404).json({ message: false, error: "Service not found" });
      return;
    }
    res.status(200).json({ message: true, service: updatedService });
  } catch (error) {
    res.status(500).json({ message: false, error });
  }
};
var getAllService = async (req, res) => {
  try {
    const userId = req.user?.id;
    console.log(userId);
    const service = await service_model_default.find({ userId });
    res.status(200).json({ message: true, service });
  } catch (error) {
    res.status(200).json({ message: true, error });
  }
};
var deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await service_model_default.findById(id);
    if (!service) {
      res.status(404).json({ message: false, error: "Service not found" });
      return;
    }
    await service.deleteOne();
    res.status(200).json({ message: true, id });
  } catch (error) {
    res.status(500).json({ message: false, error });
  }
};

// src/routes/service.route.ts
var serviceRouter = express3.Router();
serviceRouter.route("/service").post(protectRoute, createService).get(protectRoute, getAllService);
serviceRouter.route("/service/:id").put(updateService).delete(deleteService);
var service_route_default = serviceRouter;

// src/app.ts
import MongoStore from "connect-mongo";
import session from "express-session";

// src/routes/invoice.route.ts
import express4 from "express";

// src/models/Invoice.model.ts
import mongoose6 from "mongoose";
var InvoiceSchema = new mongoose6.Schema(
  {
    clientId: {
      type: mongoose6.Schema.Types.ObjectId,
      ref: "Customer"
    },
    userId: {
      type: mongoose6.Schema.Types.ObjectId,
      ref: "user",
      required: true
    },
    Service: {
      type: mongoose6.Schema.Types.ObjectId,
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
var InvoiceModel = mongoose6.model(
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
import nodemailer2 from "nodemailer";
import path2 from "path";
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
    const templatePath = path2.join(__dirname, "../views", "email.html");
    let emailHtml = fs.readFileSync(templatePath, "utf8");
    emailHtml = emailHtml.replace(
      /{{customer_email}}/g,
      populatedInvoice?.email
    );
    const transporter = nodemailer2.createTransport({
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

// src/routes/invoice.route.ts
var invoiceRouter = express4.Router();
invoiceRouter.route("/invoice").post(protectRoute, CreateInvoice).get(protectRoute, getAllInvoice);
invoiceRouter.route("/invoice/:id").get(getAllSingleQuery).delete(protectRoute, deletInvoice);
var invoice_route_default = invoiceRouter;

// src/routes/sales.route.ts
import express5 from "express";

// src/controller/sales.controller.js
import ARIMA from "arima";
import nodemailer3 from "nodemailer";
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
        const transporter = nodemailer3.createTransport({
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
var SalesRouter = express5.Router();
SalesRouter.route("/sales").get(GenerateSales);
var sales_route_default = SalesRouter;

// src/app.ts
var app = express6();
dotenv3.config();
connection_default();
app.use(express6.json());
app.use(cors());
app.set("view engine", "ejs");
app.set("views", path3.join(__dirname, "views"));
app.use(express6.static("uploads/"));
app.use(
  session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.DATABASE_URI }),
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1e3 }
    // 1 day
  })
);
app.get("/uploads/:file", (req, res) => {
  const fileName = req.params.file;
  const filePath = path3.join(__dirname, "uploads", fileName);
  res.sendFile(filePath, (err) => {
    if (err) {
      res.status(404).json({ message: "File not found" });
    }
  });
});
app.use(auth_route_default);
app.use(customer_route_default);
app.use(service_route_default);
app.use(invoice_route_default);
app.use(sales_route_default);
var app_default = app;
export {
  app_default as default
};
//# sourceMappingURL=app.mjs.map