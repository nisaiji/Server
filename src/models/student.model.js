import mongoose from "mongoose";

const studentSchema = mongoose.Schema({
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
    required:true
  },
  age: {
    type: Number,
  },
  email: {
    type: String,
  },
  address: {
    type: String
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "parent"
  },
  section: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "section"
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "class"
  },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "admin"
  }
});

const studentModel = mongoose.model("student", studentSchema);
export default studentModel;
