import mongoose from "mongoose";

const academicYearSchema = new mongoose.Schema({
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin',
        index: true,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    }

}, {
    timestamps: true
});

academicYearSchema.index({ schoolId: 1, name: 1 }, { unique: true });

const academicYearModel = mongoose.model("academicYear", academicYearSchema);
module.exports = academicYearModel;