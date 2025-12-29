import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const EVENT_TYPES = [
    "PaymentReceived",
    "AdvanceAppliedToInstallment",
    "LateFeeAccrued",
    "LateFeeWaived",
    "ConcessionGranted",
    "RefundIssued"
];

const ledgerEventSchema = mongoose.Schema({
    eventId:{
        type: String,
        required: true,
        unique: true,
        default: uuidv4,
    },
    eventType: {
        type: String,
        enum: EVENT_TYPES,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "student",
        required: true
    },
    // Nullable because some events (PaymentReceived, RefundReceived) may not be tied to a specific installment
    feeInstallmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "feeInstallment",
        index: true,
        default: null
    },
    eventTime: {
        type: Date,
        required: true,
        default: Date.now
    },
    actorType: {
        type: String,
        enum: ["admin", "system_cron", "gateway", "parent_app"],
        required: true
    },
    actorId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    //Gateway transaction id for idempotency
    externalRef: {
        type: String, 
        index: true,
    },
    reason: {
        type: String,
    },
    metaData: {
        type: Object
    }
}, { timestamps: true });

// hard guards to keep events immutable
ledgerEventSchema.pre('updateOne', function () {
    throw new Error("Ledger events are immutable and cannot be updated");
});

ledgerEventSchema.pre('findOneAndUpdate', function () {
     throw new Error("Ledger events are immutable and cannot be updated");
});

ledgerEventSchema.pre('deleteOne', function () {
     throw new Error("Ledger events are immutable and cannot be deleted");
});

const ledgerEventModel = mongoose.model("ledgerEvent", ledgerEventSchema);
export default ledgerEventModel;