import mongoose from "mongoose";

const feeStructureSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "admins",
      required: true,
      index: true,
    },

    feeCycleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "feeCycles",
      required: true,
      index: true,
    },

    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "sessions",
      required: true,
      index: true,
    },

    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "classes",
      required: true,
      index: true,
    },

    amountForAllSections:{
      type: Boolean,
      default: false,
    },

    applicableSections: [
      {
        _id: false,
        section: {
          sectionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "section",
          },
          name: {
            type: String,
          },
        },

        feeHeads: [
          {
            feeHeadId: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "feeHead",
            },

            amount: {
              type: Number,
              required: true,
            },
          },
        ],
      },
    ],

    status: {
      type: String,
      enum: ["DRAFT", "ACTIVE"],
      default: "DRAFT",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

feeStructureSchema.index(
  {
    adminId: 1,
    sessionId: 1,
    classId: 1,
  },
  {
    unique: true,
  },
);

const feeStructureModel = mongoose.model("feeStructure", feeStructureSchema);
export default feeStructureModel;
