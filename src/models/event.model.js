import mongoose from "mongoose";

const eventSchema = mongoose.Schema({
  type:{
    type: String,
    enum: ["forgetPassword"],
  },

  title:{
    type:String,
  },

  description:{
    type:String,
  },

  sender: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    model:{
      type:String,
      required:true,
      enum: ["admin","teacher","parent", "superAdmin"]
    }
  },

  receiver:{
    id:{
      type: mongoose.Schema.Types.ObjectId,
      required:true
    },
    model:{
      type:String,
      required:true,
      enum:["admin","teacher","parent", "superAdmin"]
    }
  },

  status:{
    type:String,
    enum:["accept", "reject", "pending", "expired", "complete", "notSet"],
    default: "notSet"
  },

  date: {
    type: Number,
    required: true
  },

  otp: {
    type: Number,
    maxLength: 5
  },
  
  isRead:{
    type: Boolean,
    default: false
  },
},
{
  timestamps:true
}
);

const eventModel = mongoose.model("event", eventSchema);

export default eventModel;