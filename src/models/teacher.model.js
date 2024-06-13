import mongoose from "mongoose";
// for one section of students one cordinator will be assigned.
const teacherSchema = mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true
  }, 
  firstname: {
    type: String,
    required: true
  },
  lastname: {
    type: String,
    required: true
  },
  dob:{
    type:String,
  },
  bloodGroup:{
    type:String,
  },
  email: {
    type: String,
    unique: true,
    required: true
  },
  gender:{
    type:String,
  },
  university:{
    type:String,
  },
  degree:{
    type:String
  },
  role:{
    type:String,
    enum:["teacher","classTeacher","coordinator"],
    default:"teacher"
  },
  isClassTeacher: {
    type: Boolean,
    default: false
  },
  password: {
    type: String,
    required: true,
    // select: false
  },
  phone: {
    type: String,
    required: true
  },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "admin"
  }
});

const teacherModel = mongoose.model("teacher", teacherSchema);
export default teacherModel;