import mongoose from "mongoose";
import { generateCustomId } from "../helpers/idGenerator.helper.js";

const studentSchema = mongoose.Schema(
  {
    firstname: {
      type: String,
      required: true,
    },
    lastname: {
      type: String,
      required: true,
    },
    guardianName: {
      type: String,
    },
    studentId: {
      type: String,
    },
    aadharNumber: {
      type: Number,
      required: true,
      unique: true,
    },
    aadharVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    gender: {
      type: String,
      required: true,
    },
    bloodGroup: {
      type: String,
    },
    dob: {
      type: String,
    },
    photo: {
      type: String,
    },
    address: {
      type: String,
    },
    city: {
      type: String,
    },
    district: {
      type: String,
    },
    state: {
      type: String,
    },
    country: {
      type: String,
    },
    pincode: {
      type: String,
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "parent",
    },
    schoolParent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "schoolParent",
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "admin",
    },
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "class",
    },
    section: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "section",
    }
  },
  {
    timestamps: true,
  },
);

studentSchema.pre("save", async function (next) {
  if (!this.studentId) {
    this.studentId = generateCustomId("student");
  }
  next();
});

const studentModel = mongoose.model("student", studentSchema);
export default studentModel;