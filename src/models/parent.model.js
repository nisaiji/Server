import mongoose from "mongoose";
// import addressSchema from "./Schemas/address.schema";

const parentSchema = mongoose.Schema({
  username:{
    type: String
  },
  firstname: {
    type: String
  },
  lastname: {
    type: String
  },
  phone:{
    type: String,
    unique: true,
    required: true
  },
  email: {
    type: String,
    lowercase: true
  },
  password: {
    type: String
  }
});

const parentModel = mongoose.model("parent", parentSchema);

export default parentModel;
