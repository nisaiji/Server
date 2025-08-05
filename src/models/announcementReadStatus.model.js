import mongoose from "mongoose";

const announcementReadStatusSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        refPath:'userRole',
        required: true
    },
    userRole: {
        type: String,
        enum: ['teacher', 'parent'],
        required: true
    },
    announcement: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'announcement',
        required: true
    },
    readAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

announcementReadStatusSchema.index({ userId: 1, announcementId: 1 }, { unique: true });

const announcementReadStatusModel = mongoose.model('announcementReadStatus', announcementReadStatusSchema);
export default  announcementReadStatusModel;
