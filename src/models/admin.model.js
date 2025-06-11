import mongoose from "mongoose";
import statusChangeLogSchema from "./schema/statusChangeLog.schema.js";
 
const adminSchema = mongoose.Schema({
  username: {
    type: String,
  },
  schoolName: {
    type: String,
  },
  affiliationNo: {
    type: String
  },
  fcmToken: {
    type: String
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
    lowercase: true,
  },
  status: {
    type: String,
    enum: ['unVerified', 'phoneVerified', 'verified'],
    default: 'unVerified'
  },
  password: {
    type: String,
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
  photo: {
    type: String
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
},
{
  timestamps:true
}
);

const adminModel = mongoose.model("admin", adminSchema);
export default adminModel;
