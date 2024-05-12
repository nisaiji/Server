import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({
    date:{
        type:String,
        required:true
    },
    day:{
        type:String,
        required:true,
    },
    isPresent:{
        type:Boolean,
        required:true,
    },
    student:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"student"
    },
    section:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"section"
    },
    classTeacher:{ 
        type:mongoose.Schema.Types.ObjectId,
        ref:"teacher"
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