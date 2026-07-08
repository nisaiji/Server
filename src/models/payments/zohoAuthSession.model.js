import mongoose from "mongoose";

const zohoAuthSessionSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "admins",
      required: true,
      index: true,
      unique: true
    },
    accessToken: {
      type: String,
      required: true
    },
    accountId: {
      type: String,
      required: true
    },
    paymentSecretKey: {
      type: String,
      required: true
    },
    expiresAt: {
      type: Date
    },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "EXPIRED"],
      default: "ACTIVE",
      index: true
    },
    zohoWebhookUrlId: {
      type: String,
      required: true
    }
  },
  { timestamps: true, versionKey: false, collection: "zoho_auth_sessions" }
);

export default mongoose.model("zohoAuthSession", zohoAuthSessionSchema);
