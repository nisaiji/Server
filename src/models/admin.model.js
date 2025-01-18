import mongoose from "mongoose";
import statusChangeLogSchema from "./schema/statusChangeLog.schema.js";
 
const adminSchema = mongoose.Schema({
  username: {
    type: String,
    unique: true,
  },
  schoolName: {
    type: String,
    required: true
  },
  affiliationNo: {
    type: String,
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
  isActive:{
    type:Boolean,
    default: false
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
  },
  city:{
    type:String
  },
  district:{
    type:String
  },
  state:{
    type:String
  },
  country:{
    type:String
  },
  pincode:{
    type:String
  },
  statusChangeCount: {
    type: Number,
    default: 0
  },
  statusChangeLog: [statusChangeLogSchema],

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
