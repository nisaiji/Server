import { required } from "joi";
import mongoose from "mongoose";

const teacherLeaveRequestSchema = mongoose.Schema({
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

  section:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "section",
    required: true
  },

  requestingTeacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "teacher",
    required: true
  },

  guestTeacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "teacher",
    required: true
  },

  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "admin"
  },

  status:{
    type:String,
    enum:["accept", "reject", "pending", "complete", "expired"],
    default: "pending"
  },

  startTime: {
    type: Number,
    required: true
  },

  endTime: {
    type: Number,
    required: true
  },
},
{
  timestamps:true
}
);

const teacherLeaveRequestModel = mongoose.model("teacherLeaveRequest", teacherLeaveRequestSchema);

export default teacherLeaveRequestModel;
