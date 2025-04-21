import mongoose from "mongoose";

const superAdminSchema = mongoose.Schema({
  username:{
    type: String,
    required:true
  },
  email:{
    type: String,
    required:true,
    lowercase: true,
    unique:true
  },
  password:{
    type: String,
    required:true
  }
},
{
  timestamps:true
}
);


const superAdminModel = mongoose.model("superAdmin", superAdminSchema);
export default superAdminModel;