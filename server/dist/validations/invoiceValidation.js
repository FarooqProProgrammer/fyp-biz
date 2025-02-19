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

// src/validations/invoiceValidation.ts
var invoiceValidation_exports = {};
__export(invoiceValidation_exports, {
  invoiceSchema: () => invoiceSchema
});
module.exports = __toCommonJS(invoiceValidation_exports);
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  invoiceSchema
});
//# sourceMappingURL=invoiceValidation.js.map