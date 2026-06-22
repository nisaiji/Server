import mongoose from "mongoose";
import { generateCustomId } from "../helpers/idGenerator.helper.js";
import { STUDENT_GENDER, STUDENT_BLOOD_GROUP } from "../enums/student.enums.js";

const studentSchema = mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true
      required: true
    },
    lastName: {
      type: String,
      required: true
      required: true
    },
    guardianName: {
      type: String
      type: String
    },
    studentId: {
      type: String
      type: String
    },
    aadharNumber: {
      type: Number,
      required: true,
      unique: true
      unique: true
    },
    aadharVerified: {
      type: Boolean,
      default: false
      default: false
    },
    isActive: {
      type: Boolean,
      default: true
      default: true
    },
    gender: {
      type: String,
      enum: Object.values(STUDENT_GENDER),
      required: true
    },
    bloodGroup: {
      type: String,
      enum: Object.values(STUDENT_BLOOD_GROUP)
    },
    dob: {
      type: String
      type: String
    },
    photo: {
      type: String
      type: String
    },
    address: {
      type: String
      type: String
    },
    city: {
      type: String
      type: String
    },
    district: {
      type: String
      type: String
    },
    state: {
      type: String
      type: String
    },
    country: {
      type: String
      type: String
    },
    pincode: {
      type: String
      type: String
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "parent"
      ref: "parent"
    },
    schoolParent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "schoolParent"
      ref: "schoolParent"
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "admin"
      ref: "admin"
    },
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "class"
      ref: "class"
    },
    section: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "section"
      ref: "section"
    }
  },
  {
    timestamps: true
  }
);

studentSchema.pre("save", function () {
  if (!this.studentId) {
    this.studentId = generateCustomId("student");
  }
});

const studentModel = mongoose.model("student", studentSchema);
export default studentModel;
