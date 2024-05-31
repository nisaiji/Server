import mongoose from "mongoose";
// import addressSchema from "./Schemas/address.schema";

const parentSchema = mongoose.Schema({
  username: {
    type: String,
    default: "abc@123"
  },
  firstname: {
    type: String,
    default: "John"
  },
  lastname: {
    type: String,
    default: "Doe"
  },
  phone: {
    type: String,
    unique:true,
    required: true
  },
  email: {
    type: String,
    lowercase: true
  },
  password: {
    type: String
  },
  address: {
    type: String,
    default: "abc xyz india"
  },
});

const parentModel = mongoose.model("parent", parentSchema);

export default parentModel;
