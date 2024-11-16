import mongoose from "mongoose";

const studentSchema = mongoose.Schema({
  rollNumber:{
    type:String
  },
  firstname: {
    type: String,
    required: true
  },
  lastname:{
    type: String,
    required: true
  },
  isActive:{
    type:Boolean,
    default: true
  },
  gender: {
    type: String,
    required:true
  },
  bloodGroup:{
    type:String,
  },
  dob:{
    type: String,
  },
  photo:{
    type: String,
  },
  address:{
    type: String
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
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "parent",
    default: "64b8f3d9f58b7e2f8f2c5d1a"
  },
  section: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "section",
    default: "64b8f3d9f58b7e2f8f2c5d1b"
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "class",
    default: "64b8f3d9f58b7e2f8f2c5d1b"
  },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "admin",
    default: "64b8f3d9f58b7e2f8f2c5d1b"
  }
});

const studentModel = mongoose.model("student", studentSchema);
export default studentModel;