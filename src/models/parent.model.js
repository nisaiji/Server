import mongoose from "mongoose";

const parentSchema = mongoose.Schema({
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
  state:{
    type:String
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
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "admin"
  }
});
parentSchema.index({ phone: 1, isActive: 1 }, { unique: true });

const parentModel = mongoose.model("parent", parentSchema);

export default parentModel;