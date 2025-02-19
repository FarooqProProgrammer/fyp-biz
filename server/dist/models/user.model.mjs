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
export {
  user_model_default as default
};
//# sourceMappingURL=user.model.mjs.map