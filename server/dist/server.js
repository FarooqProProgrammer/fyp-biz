"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
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

// src/app.ts
var import_express6 = __toESM(require("express"));
var import_cors = __toESM(require("cors"));
var import_dotenv3 = __toESM(require("dotenv"));

// src/routes/auth.route.ts
var import_express = __toESM(require("express"));

// src/lib/multer.ts
var import_multer = __toESM(require("multer"));
var import_path = __toESM(require("path"));
var storage = import_multer.default.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + import_path.default.extname(file.originalname));
  }
});
var fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"));
  }
};
var upload = (0, import_multer.default)({ storage, fileFilter });
var multer_default = upload;

// src/models/user.model.ts
var import_mongoose = __toESM(require("mongoose"));
var UserSchema = new import_mongoose.default.Schema(
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
var UserModel = import_mongoose.default.model("user", UserSchema);
var user_model_default = UserModel;

// src/controller/auth.controller.ts
var import_jsonwebtoken = __toESM(require("jsonwebtoken"));
var import_bcryptjs = __toESM(require("bcryptjs"));
var import_dotenv = __toESM(require("dotenv"));

// src/models/otp.model.ts
var import_mongoose2 = __toESM(require("mongoose"));
var OtpSchema = new import_mongoose2.Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  expiresAt: { type: Date, required: true, index: { expires: "5m" } }
  // OTP expires in 5 minutes
});
var OtpModel = import_mongoose2.default.model("Otp", OtpSchema);
var otp_model_default = OtpModel;

// src/controller/auth.controller.ts
var import_nodemailer = __toESM(require("nodemailer"));
import_dotenv.default.config();
var register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    console.log(req.body);
    const image = req.file ? req.file.path : "";
    const salt = await import_bcryptjs.default.genSalt(10);
    const hashedPassword = await import_bcryptjs.default.hash(password, salt);
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
    const isMatch = await import_bcryptjs.default.compare(password, user.password);
    if (!isMatch) {
      res.status(400).json({ message: "Invalid email or password" });
      return;
    }
    const token = import_jsonwebtoken.default.sign({ id: user._id }, process.env.JWT_SECRET, {
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
var authRouter = import_express.default.Router();
authRouter.post("/register", multer_default.single("image"), register);
authRouter.post("/login", login);
authRouter.route("/logout").post(logout);
authRouter.route("/otp-verify").post(verifyOtp);
authRouter.route("/forgot-password").post(forgotPassword);
var auth_route_default = authRouter;

// src/config/connection.ts
var import_mongoose3 = __toESM(require("mongoose"));
var import_dotenv2 = __toESM(require("dotenv"));
import_dotenv2.default.config();
var connectDb = async () => {
  try {
    if (!process.env.DATABASE_URI) {
      throw new Error("DATABASE_URI is not defined in environment variables.");
    }
    await import_mongoose3.default.connect(process.env.DATABASE_URI);
    console.log("MongoDB connected successfully!");
  } catch (error) {
    process.exit(1);
  }
};
var connection_default = connectDb;

// src/app.ts
var import_path3 = __toESM(require("path"));

// src/routes/customer.route.ts
var import_express2 = __toESM(require("express"));

// src/models/customer.model.ts
var import_mongoose4 = __toESM(require("mongoose"));
var CustomerSchema = new import_mongoose4.default.Schema(
  {
    name: {
      type: String,
      required: true
    },
    userId: {
      type: import_mongoose4.default.Schema.Types.ObjectId,
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
      type: import_mongoose4.default.Schema.Types.ObjectId,
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
var CustomerModel = import_mongoose4.default.model(
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
var import_jsonwebtoken2 = __toESM(require("jsonwebtoken"));
var SECRET_KEY = process.env.JWT_SECRET || "your-secret-key";
var protectRoute = (req, res, next) => {
  const authHeader = req.headers.authorization || req.cookies.token;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ message: "Unauthorized access. No token provided." });
    return;
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = import_jsonwebtoken2.default.verify(token, SECRET_KEY);
    req.user = { id: decoded.id };
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token." });
  }
};

// src/routes/customer.route.ts
var customerRouter = import_express2.default.Router();
customerRouter.route("/customer").post(protectRoute, createCustomer).get(protectRoute, getAllCustomer);
customerRouter.route("/customer/:id").delete(deleteCustomer).get(getSingleCustomer).put(updateCustomer);
var customer_route_default = customerRouter;

// src/routes/service.route.ts
var import_express3 = __toESM(require("express"));

// src/models/service.model.ts
var import_mongoose5 = __toESM(require("mongoose"));
var ServiceSchema = new import_mongoose5.default.Schema(
  {
    serviceName: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    userId: import_mongoose5.default.Types.ObjectId
  },
  {
    timestamps: true
  }
);
var ServiceModel = import_mongoose5.default.model("Service", ServiceSchema);
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
var serviceRouter = import_express3.default.Router();
serviceRouter.route("/service").post(protectRoute, createService).get(protectRoute, getAllService);
serviceRouter.route("/service/:id").put(updateService).delete(deleteService);
var service_route_default = serviceRouter;

// src/app.ts
var import_connect_mongo = __toESM(require("connect-mongo"));
var import_express_session = __toESM(require("express-session"));

// src/routes/invoice.route.ts
var import_express4 = __toESM(require("express"));

// src/models/Invoice.model.ts
var import_mongoose6 = __toESM(require("mongoose"));
var InvoiceSchema = new import_mongoose6.default.Schema(
  {
    clientId: {
      type: import_mongoose6.default.Schema.Types.ObjectId,
      ref: "Customer"
    },
    userId: {
      type: import_mongoose6.default.Schema.Types.ObjectId,
      ref: "user",
      required: true
    },
    Service: {
      type: import_mongoose6.default.Schema.Types.ObjectId,
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
var InvoiceModel = import_mongoose6.default.model(
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
var import_nodemailer2 = __toESM(require("nodemailer"));
var import_path2 = __toESM(require("path"));
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
    const templatePath = import_path2.default.join(__dirname, "../views", "email.html");
    let emailHtml = import_fs.default.readFileSync(templatePath, "utf8");
    emailHtml = emailHtml.replace(
      /{{customer_email}}/g,
      populatedInvoice?.email
    );
    const transporter = import_nodemailer2.default.createTransport({
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
var invoiceRouter = import_express4.default.Router();
invoiceRouter.route("/invoice").post(protectRoute, CreateInvoice).get(protectRoute, getAllInvoice);
invoiceRouter.route("/invoice/:id").get(getAllSingleQuery).delete(protectRoute, deletInvoice);
var invoice_route_default = invoiceRouter;

// src/routes/sales.route.ts
var import_express5 = __toESM(require("express"));

// src/controller/sales.controller.js
var import_arima = __toESM(require("arima"));
var import_nodemailer3 = __toESM(require("nodemailer"));
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
        const transporter = import_nodemailer3.default.createTransport({
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
var SalesRouter = import_express5.default.Router();
SalesRouter.route("/sales").get(GenerateSales);
var sales_route_default = SalesRouter;

// src/app.ts
var app = (0, import_express6.default)();
import_dotenv3.default.config();
connection_default();
app.use(import_express6.default.json());
app.use((0, import_cors.default)());
app.set("view engine", "ejs");
app.set("views", import_path3.default.join(__dirname, "views"));
app.use(import_express6.default.static("uploads/"));
app.use(
  (0, import_express_session.default)({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
    store: import_connect_mongo.default.create({ mongoUrl: process.env.DATABASE_URI }),
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1e3 }
    // 1 day
  })
);
app.get("/uploads/:file", (req, res) => {
  const fileName = req.params.file;
  const filePath = import_path3.default.join(__dirname, "uploads", fileName);
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

// src/server.ts
var import_figlet = __toESM(require("figlet"));
var PORT = process.env.PORT || 5e3;
app_default.listen(PORT, async () => {
  await (0, import_figlet.default)("fyp project", function(err, data) {
    if (err) {
      console.log("Something went wrong...");
      console.dir(err);
      return;
    }
    console.log(data);
  });
  console.log(`\u{1F680} Server running on http://localhost:${PORT}`);
});
//# sourceMappingURL=server.js.map