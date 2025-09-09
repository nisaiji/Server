import mongoose from "mongoose";

const studentLeaveRequestSchema = mongoose.Schema({
  reason:{
    type:String,
    required: true
  },

  description:{
    type:String,
  },

  remark: {
    type: String
  },

  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "parent"
  },

  sessionStudent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "sessionStudent"
  },

  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "student"
  },

  teacher:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "teacher"
  },

  section: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "section"
  },

  school:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "admin"
  },

  status:{
    type:String,
    enum:["accept", "reject", "pending", "complete", "expired"],
    default: "pending"
  },

  isRead: {
    type: Boolean,
    default: false
  },

  startDate: {
    type: Number,
    required: true
  },

  endDate: {
    type: Number,
    required: true
  },
},
{
  timestamps:true
}
);

const studentLeaveRequestModel = mongoose.model("studentLeaveRequest", studentLeaveRequestSchema);
export default studentLeaveRequestModel;
