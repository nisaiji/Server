import mongoose from "mongoose";

const changePasswordRequestSchema = mongoose.Schema({
  reason:{
    type: String,
    enum: ["forgetPassword", "changeDevice"],
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
      enum: ["teacher","parent", "admin"]
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
      enum:["admin", "superAdmin"]
    }
  },

  status:{
    type:String,
    enum:["accept", "reject", "pending", "expired", "complete"],
    default: "pending"
  },

  date: {
    type: Number,
    required: true
  },

  otp: {
    type: Number,
    maxLength: 5
  },

  expiredIn: {
    type: Number
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

const changePasswordRequestModel = mongoose.model("changePasswordRequest", changePasswordRequestSchema);

export default changePasswordRequestModel;

