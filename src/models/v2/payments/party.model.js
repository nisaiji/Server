import mongoose from "mongoose";

const partySchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "admin",
      required: true,
      index: true,
    },
    partyType: {
      type: String,
      enum: ["STUDENT", "ENROLLMENT", "CUSTOMER"],
      required: true,
    },
    externalRefType: {
      type: String,
      enum: ["STUDENT_ID", "ADMISSION_ID", "BATCH_ENROLLMENT_ID"],
      required: true,
    }, 
    externalRefId: {
      type: String,
      required: true,
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
    },
    guardianName: {
      type: String,
      default: null,
      trim: true,
    },
    phone: {
      type: String,
      default: null,
    },
    email: {
      type: String,
      default: null,
      lowercase: true,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
    },
  },
  {
    timestamps: true,
  }
);

partySchema.index(
  { tenantId: 1, externalRefType: 1, externalRefId: 1 },
  { unique: true }
);
partySchema.index({ tenantId: 1, partyType: 1, status: 1 });

const partyModel = mongoose.model("paymentParty", partySchema, "parties");

export default partyModel;
