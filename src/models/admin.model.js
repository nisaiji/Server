import mongoose from "mongoose";
// import addressSchema from "./Schemas/address.schema";

const adminSchema = mongoose.Schema({
  // admin: a unique username which represents a school, used for authentication and other stuff
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
  role:{
    type:String,
    default:"admin"
  },
  password: {
    type: String,
    required: true
    // select:false,
  },
  address: {
    type: String,
    required: true
  },
  sections: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "section"
    }
  ],
  teachers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "teacher"
    }
  ]
});

const adminModel = mongoose.model("admin", adminSchema);
export default adminModel;
