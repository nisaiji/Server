import mongoose from "mongoose";

const superAdminSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      unique: true
    },
    password: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true,
    versionKey: false,
    collection: "super_admins"
  }
);

const superAdminModel = mongoose.model("superAdmin", superAdminSchema);
export default superAdminModel;
