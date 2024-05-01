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
  email: {
    type: String,
    unique: true,
    required: true
  },
  role:{
    type:String,
    enum:["teacher","classTeacher","coordinator"],
    default:"teacher"
  },
  isCoordinator: {
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
  section: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "section"
    }
  ],
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "school"
  }
});

const teacherModel = mongoose.model("teacher", teacherSchema);
export default teacherModel;
