import mongoose from "mongoose";

const sectionSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  classId:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "class",
  },
  classTeacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "teacher"
  },
  students:[
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "student"
    }
  ],
  admin:{
    type: mongoose.Schema.Types.ObjectId,
    ref:"admin"
  }
});

const sectionModel = mongoose.model("section", sectionSchema);
export default sectionModel;
