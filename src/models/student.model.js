import mongoose from "mongoose";
import { GENDER, STUDENT_BLOOD_GROUP } from "../enums/student.enums.js";
import { generateCustomId } from "../helpers/idGenerator.helper.js";

const studentSchema = new mongoose.Schema(
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
      unique: true,
      sparse: true
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
      enum: Object.values(GENDER),
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
    timestamps: true,
    versionKey: false,
    collection: "students"
  }
);

studentSchema.pre("save", function () {
  if (!this.studentId) {
    this.studentId = generateCustomId("student");
  }
});

const studentModel = mongoose.model("student", studentSchema);
export default studentModel;
