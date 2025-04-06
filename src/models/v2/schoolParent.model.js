import mongoose from "mongoose";

const schoolParentSchema = mongoose.Schema({
  username:{
    type: String,
  },
  fullname: {
    type: String
  },
  age:{
    type:Number
  },
  gender:{
    type:String
  },
  isActive:{
    type:Boolean,
    default:true
  },
  address:{
    type:String
  },
  city:{
    type:String
  },
  district:{
    type:String
  },
  status:{
    type:String,
    enum: ['unVerified', 'phoneVerified', 'verified']
  },
  country:{
    type:String
  },
  pincode:{
    type:String
  },
  qualification:{
    type:String
  },
  occupation:{
    type:String
  },
  isLoginAlready:{
    type:Boolean,
    default:false
  },
  phone:{
    type: String,
    required: true
  },
  email: {
    type: String,
    lowercase: true
  },
  password: {
    type: String
  },
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref:"admin",
    required: true
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref:"parent",
    required: true
  }
},
{
timestamps:true
}
);

const schoolParentModel = mongoose.model("schoolParent", schoolParentSchema);

export default schoolParentModel;
