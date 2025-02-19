// src/models/service.model.ts
import mongoose from "mongoose";
var ServiceSchema = new mongoose.Schema(
  {
    serviceName: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    userId: mongoose.Types.ObjectId
  },
  {
    timestamps: true
  }
);
var ServiceModel = mongoose.model("Service", ServiceSchema);
var service_model_default = ServiceModel;
export {
  service_model_default as default
};
//# sourceMappingURL=service.model.mjs.map