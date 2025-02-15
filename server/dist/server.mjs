// src/app.ts
import express4 from "express";
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
    const newUser = new user_model_default({ name, email, password: hashedPassword, image });
    await newUser.save();
    res.status(201).json({ message: "User created successfully", user: newUser });
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
    const userObject = user.toObject();
    delete userObject.password;
    res.status(200).json({ message: "Login successful", token, user: userObject });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error });
  }
};

// src/routes/auth.route.ts
var authRouter = express.Router();
authRouter.post("/register", multer_default.single("image"), register);
authRouter.post("/login", login);
var auth_route_default = authRouter;

// src/config/connection.ts
import mongoose2 from "mongoose";
import dotenv2 from "dotenv";
dotenv2.config();
var connectDb = async () => {
  try {
    if (!process.env.DATABASE_URI) {
      throw new Error("DATABASE_URI is not defined in environment variables.");
    }
    await mongoose2.connect(process.env.DATABASE_URI);
    console.log("MongoDB connected successfully!");
  } catch (error) {
    process.exit(1);
  }
};
var connection_default = connectDb;

// src/app.ts
import path2 from "path";

// src/routes/customer.route.ts
import express2 from "express";

// src/models/customer.model.ts
import mongoose3 from "mongoose";
var CustomerSchema = new mongoose3.Schema(
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
    phone: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: false
    }
  },
  {
    timestamps: true
  }
);
var CustomerModel = mongoose3.model("customer", CustomerSchema);
var customer_model_default = CustomerModel;

// src/controller/customer.controller.ts
var createCustomer = async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;
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
      address
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
    const customer = await customer_model_default.find();
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
    const { name, email, phone, address } = req.body;
    console.log(req.body);
    const existingCustomer = await customer_model_default.findById(id);
    if (!existingCustomer) {
      res.status(404).json({ message: "Customer not found." });
      return;
    }
    existingCustomer.name = name || existingCustomer.name;
    existingCustomer.email = email || existingCustomer.email;
    existingCustomer.phone = phone || existingCustomer.phone;
    existingCustomer.address = address || existingCustomer.address;
    await existingCustomer.save();
    res.status(200).json({
      message: "Customer updated successfully",
      customer: {
        id: existingCustomer._id,
        name: existingCustomer.name,
        email: existingCustomer.email,
        phone: existingCustomer.phone,
        address: existingCustomer.address
      }
    });
  } catch (error) {
    console.error("Error updating customer:", error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

// src/routes/customer.route.ts
var customerRouter = express2.Router();
customerRouter.route("/customer").post(createCustomer).get(getAllCustomer);
customerRouter.route("/customer/:id").delete(deleteCustomer).get(getSingleCustomer).put(updateCustomer);
var customer_route_default = customerRouter;

// src/routes/service.route.ts
import express3 from "express";

// src/models/service.model.ts
import mongoose4 from "mongoose";
var ServiceSchema = new mongoose4.Schema(
  {
    serviceName: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);
var ServiceModel = mongoose4.model("Service", ServiceSchema);
var service_model_default = ServiceModel;

// src/controller/service.controller.ts
var createService = async (req, res) => {
  try {
    const { serviceName } = req.body;
    const service = new service_model_default({ serviceName });
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
    const service = await service_model_default.find();
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
serviceRouter.route("/service").post(createService).get(getAllService);
serviceRouter.route("/service/:id").put(updateService).delete(deleteService);
var service_route_default = serviceRouter;

// src/app.ts
var app = express4();
dotenv3.config();
connection_default();
app.use(express4.json());
app.use(cors());
app.use(express4.static("uploads/"));
app.get("/uploads/:file", (req, res) => {
  const fileName = req.params.file;
  const filePath = path2.join(__dirname, "uploads", fileName);
  res.sendFile(filePath, (err) => {
    if (err) {
      res.status(404).json({ message: "File not found" });
    }
  });
});
app.use(auth_route_default);
app.use(customer_route_default);
app.use(service_route_default);
var app_default = app;

// src/server.ts
import figlet from "figlet";
var PORT = process.env.PORT || 5e3;
app_default.listen(PORT, async () => {
  await figlet("fyp project", function(err, data) {
    if (err) {
      console.log("Something went wrong...");
      console.dir(err);
      return;
    }
    console.log(data);
  });
  console.log(`\u{1F680} Server running on http://localhost:${PORT}`);
});
//# sourceMappingURL=server.mjs.map