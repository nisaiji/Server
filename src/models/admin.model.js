import mongoose from "mongoose";

const adminSchema = mongoose.Schema({
  adminName: {
    type: String,
    unique: true,
    required: true
  },
  schoolName: {
    type: String,
    required: true
  },
  affiliationNo: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
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
  },
  address: {
    type: String,
    required: true
  },
});

const adminModel = mongoose.model("admin", adminSchema);
export default adminModel;
