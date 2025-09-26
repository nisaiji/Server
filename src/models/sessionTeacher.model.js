import mongoose from "mongoose";
const sessionTeacherSchema = mongoose.Schema({
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
  fcmToken: {
    type: String
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
    lowercase: true
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
  teacher:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "teacher",
    required: true
  },
  session:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "session",
    required: true
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

const sessionTeacherModel = mongoose.model("sessionTeacher", sessionTeacherSchema);

export default sessionTeacherModel;
