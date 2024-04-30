import mongoose from "mongoose";

const sectionSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  coordinator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "teacher"
  },
  students: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "student"
    }
  ]
});

const sectionModel = mongoose.model("section", sectionSchema);
export default sectionModel;
