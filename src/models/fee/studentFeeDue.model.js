import mongoose from "mongoose";

const studentFeeDueSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "admins",
      required: true,
      index: true,
    },

    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "students",
      required: true,
      index: true,
    },

    feeCycleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "feeCycle",
      required: true,
      index: true,
    },

    feeStructureId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "feeStructure",
      required: true,
    },

    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "sessions",
      required: true,
    },

    dueDate: {
      type: Date,
      required: true,
    },

    feeBreakup: [
      {
        _id: false,

        feeHeadId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "feeHead",
        },

        amount: Number,
      },
    ],

    totalAmount: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: [
        "PENDING",
        "PARTIAL",
        "PAID",
        "OVERDUE",
      ],
      default: "PENDING",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default mongoose.model(
  "studentFeeDue",
  studentFeeDueSchema
);