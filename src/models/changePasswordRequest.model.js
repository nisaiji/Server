import mongoose from "mongoose";
import { PASSWORD_CHANGE_REASON, PASSWORD_CHANGE_SENDER_MODEL, PASSWORD_CHANGE_RECEIVER_MODEL, PASSWORD_CHANGE_STATUS } from "../enums/password.enums.js";

const changePasswordRequestSchema = mongoose.Schema({
  reason: {
    type: String,
    enum: Object.values(PASSWORD_CHANGE_REASON)
  },

  description: {
    type: String
  },

  sender: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    model: {
      type: String,
      required: true,
      enum: Object.values(PASSWORD_CHANGE_SENDER_MODEL)
    }
  },

  receiver: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    model: {
      type: String,
      required: true,
      enum: Object.values(PASSWORD_CHANGE_RECEIVER_MODEL)
    }
  },

  status: {
    type: String,
    enum: Object.values(PASSWORD_CHANGE_STATUS),
    default: PASSWORD_CHANGE_STATUS.PENDING
  },

    otp: {
      type: Number,
      maxLength: 5
    },

  expiredAt: {
    type: Number
  }  
},
{
  timestamps: true
}
);

const changePasswordRequestModel = mongoose.model(
  "changePasswordRequest",
  changePasswordRequestSchema
);

export default changePasswordRequestModel;
