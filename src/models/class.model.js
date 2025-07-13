import mongoose from "mongoose";

const classSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  section: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "section"
    }
  ], 
  session: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "session"
  },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "admin",
    required: true
  }
},
{
  timestamps:true
}
);

const classModel = mongoose.model("class", classSchema);
export default classModel;
