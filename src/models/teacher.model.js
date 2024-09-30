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
  photo:{
    type: String,
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
});

teacherSchema.index({ phone: 1, isActive: 1 }, { unique: true });
teacherSchema.index({ email: 1, isActive: 1 }, { unique: true, sparse:true });
teacherSchema.index({ username: 1, isActive: 1 }, { unique: true, sparse:true });

const teacherModel = mongoose.model("teacher", teacherSchema);

export default teacherModel;
