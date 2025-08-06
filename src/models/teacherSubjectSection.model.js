import mongoose from "mongoose";

const teacherSubjectSectionSchema = new mongoose.Schema({
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
}, { timestamps: true });

const teacherSubjectSectionModel =  mongoose.model('teacherSubjectSection', teacherSubjectSectionSchema);
export default teacherSubjectSectionModel;