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

// src/models/Invoice.model.ts
var Invoice_model_exports = {};
__export(Invoice_model_exports, {
  default: () => Invoice_model_default
});
module.exports = __toCommonJS(Invoice_model_exports);
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
//# sourceMappingURL=Invoice.model.js.map