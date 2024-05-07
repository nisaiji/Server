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
    // required:true,
  },
  phone: {
    type: String,
    default: "+910000000000"
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
  // one parent can have multiple childs
  child: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "student"
    }
  ]
});

const parentModel = mongoose.model("parent", parentSchema);

export default parentModel;
