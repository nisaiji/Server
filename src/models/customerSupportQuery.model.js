import mongoose from "mongoose";

const customerSupportQuerySchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  schoolName: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  city: {
    type: String
  },
  email: {
    type: String
  },
  phone: {
    type: String,
    lowercase: true,
    required: true
  },
  teacherCount: {
    type: Number
  },
  source: {
    type: String
  },
  message: {
    type: String
  }
},
{
  timestamps: true
});

const customerSupportQueryModel = mongoose.model(
  "customerSupportQuery",
  customerSupportQuerySchema
);
export default customerSupportQueryModel;
