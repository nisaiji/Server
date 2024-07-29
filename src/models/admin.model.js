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
  principal:{
    type: String,
  },
  schoolBoard:{
    type: String,
  },
  schoolNumber:{
    type:String
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
  city:{
    type:String
  },
  state:{
    type:String
  },
  website:{
    type:String
  },
  facebook:{
    type:String
  },
  instagram:{
    type:String
  },
  linkedin:{
    type:String
  },
  twitter:{
    type:String
  },
  whatsapp:{
    type:String
  },
  youtube:{
    type:String
  }
});

const adminModel = mongoose.model("admin", adminSchema);
export default adminModel;
