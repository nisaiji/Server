import mongoose from "mongoose";

import { generateCustomId } from "../helpers/idGenerator.helper.js";
import { STUDENT_GENDER, STUDENT_BLOOD_GROUP } from "../enums/student.enums.js";

const studentSchema = mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true
    },
    lastName: {
      type: String,
      required: true
    },
    guardianName: {
      type: String
    },
    studentId: {
      type: String
    },
    aadharNumber: {
      type: Number,
      required: true
    },
    aadharVerified: {
      type: Boolean,
      default: false
    },
    isActive: {
      type: Boolean,
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
    },
    photo: {
      type: String
    },
    address: {
      type: String
    },
    city: {
      type: String
    },
    district: {
      type: String
    },
    state: {
      type: String
    },
    country: {
      type: String
    },
    pincode: {
      type: String
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "parent"
    },
    schoolParent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "schoolParent"
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "admin"
    },
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "class"
    },
    section: {
      type: mongoose.Schema.Types.ObjectId,
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
