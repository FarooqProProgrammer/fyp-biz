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
export {
  invoiceSchema
};
//# sourceMappingURL=invoiceValidation.mjs.map