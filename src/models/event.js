import mongoose from "mongoose";

const eventSchema = mongoose.Schema({
  eventType:{
    type: String,
    enum: ["forgetPassword"],
  },
  sender: {
    id: {
      type: Schema.Types.ObjectId,
      required: true
    },
    model:{
      type:String,
      required:true,
      enum: ["Admin","Teacher","Parent"]
    }
  },
  receiver:{
    id:{
      type: Schema.Types.ObjectId,
      required:true
    },
    model:{
      type:String,
      required:true,
      enum:["Admin","Teacher","Parent"]
    }
  },
  title:{
    type:String,
  },
  description:{
    type:String,
  },
  date:{
    type:Number
  },
  isRead:{
    type: Boolean,
    default: false
  }  
});

const eventModel = mongoose.model("event", eventSchema);

export default eventModel;