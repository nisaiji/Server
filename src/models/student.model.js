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
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "parent",
    required: true
  },
  section: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "section",
    required: true
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "class",
    required: true
  },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "admin",
    required: true
  }
});

const studentModel = mongoose.model("student", studentSchema);
export default studentModel;