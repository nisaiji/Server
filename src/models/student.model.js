import mongoose from "mongoose";

const studentSchema = mongoose.Schema({
  rollNumber: {
    type: String,
    required: true,
    unique: true
  },
  firstname: {
    type: String,
    required: true
  },
  lastname: {
    type: String,
    required: true
  },
  gender: { 
    type: String,
    enum: ["Male", "Female", "Non-binary", "Other"]
  },
  age: {
    type: Number,
    required: true,
    min: 3,
    max: 100
  },
  phone: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  classStd: {
    type: String,
    required: true
  },
  address: {
    type: String
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "parent"
  },
  section:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "section"
  },
  school:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "admin"
  }
});

const studentModel = mongoose.model("student", studentSchema);
export default studentModel;