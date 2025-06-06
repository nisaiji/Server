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
  }
},
{
  timestamps:true
}
);
parentSchema.index({ phone: 1, isActive: 1 }, { unique: true });

const parentModel = mongoose.model("parentt", parentSchema);

export default parentModel;
