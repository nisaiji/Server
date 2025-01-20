import mongoose from "mongoose";
const teacherSchema = mongoose.Schema({
  username: {
    type: String
  },
  firstname: {
    type: String,
    required: true
  },
  lastname: {
    type: String,
    required: true
  },
  isLoginAlready:{
    type:Boolean,
    default:false
  },
  deviceId: {
    type: String
  },
  dob: {
    type: String
  },
  bloodGroup: {
    type: String
  },
  email: {
    type: String,
    sparse: true, 
  },
  isActive:{
    type: Boolean,
    default: true
  },
  gender: {
    type: String
  },
  university: {
    type: String
  },
  degree: { 
    type: String
  },
  password: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  address:{
    type:String
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
  photo:{
    type: String
  },
  forgetPasswordCount:{
    type:Number,
    default:0
  },
  leaveRequestCount: {
    type: Number,
    default: 0
  },
  section:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "section",
    default: null
  },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "admin"
  }
},
{
  timestamps:true
}
);


const teacherModel = mongoose.model("teacher", teacherSchema);

export default teacherModel;
