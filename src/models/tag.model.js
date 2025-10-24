import mongoose from "mongoose";

const tagSchema = new mongoose.Schema({
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'teacher',
        required: true
    },
    subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'subject',
        required: true
    },
    section: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'section',
        required: true
    },
    classId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'class',
        required: true
    },
    session: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'session',
        required: true
    },
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    subtopics: [{
        type: String,
        trim: true
    }],
    date: {
        type: Number
    },
    notes: {
        type: String,
        trim: true
    },
    isCompleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

const tagModel = mongoose.model('tag', tagSchema);
export default  tagModel;
