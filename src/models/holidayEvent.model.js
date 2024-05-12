import mongoose from "mongoose";
 
const holidayEventSchema =new mongoose.Schema({
    date:{
        type:String,
        required:true,
    },
    day:{
        type:String,
        required:true,
    },
    name:{
        type:String,
        required:true
    },
    teacherHoliday:{
        type:Boolean,
        required:true,
    },
    studentHoliday:{
        type:Boolean,
        required:true
    },
    description:{
        type:String,
    },
    admin:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'admin'
    }
},
{
    timestamps:true
});

const holidayEventModel = mongoose.model("holiday",holidayEventSchema);
export default holidayEventModel;