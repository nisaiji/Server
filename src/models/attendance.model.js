import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({
    date:{
        type:Date,
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
    admin:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"admin"
    }
},
{
    timestamps:true
});