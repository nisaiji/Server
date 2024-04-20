import mongoose from "mongoose";
// import addressSchema from "./Schemas/address.schema";

const schoolSchema = mongoose.Schema({
  // admin: a unique username which represents a school, used for authentication and other stuff
  adminName: {
    type: String,
    unique: true,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  affiliationNo: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  sections: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "section"
    }
  ],
  cordinators: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "cordinator"
    }
  ]
});

const schoolModel = mongoose.model("school", schoolSchema);
export default schoolModel;
