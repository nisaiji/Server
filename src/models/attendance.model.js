 import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({
    date:{
        type:Number,
        required:true
    },
    day:{ 
        type:String,
        required:true,
    },
    parentAttendance:{
        type:String,
        default:""
    },
    teacherAttendance:{
        type:String,
        default:""
    },
    sessionStudent:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"sessionStudent",
        required: true
    }, 
    section:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"section"
    },
    classId:{ 
        type:mongoose.Schema.Types.ObjectId,
        ref:"class"
    },
    session:{ 
        type:mongoose.Schema.Types.ObjectId,
        ref:"session"
    },
    admin:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"admin"
    }
},
{
   timestamps:true
});

const attendanceModel = mongoose.model("attendance",attendanceSchema);
export default attendanceModel;
