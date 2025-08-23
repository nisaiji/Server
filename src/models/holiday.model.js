import mongoose from "mongoose";
 
const holidaySchema =new mongoose.Schema({
    date:{
        type:Number,
        required:true,
    },
    day:{
        type:String,
        required:true,
    },
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
    },
    session: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'session'
    },
    section: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'section'
    },
    classId: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'class'
    },
    admin:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'admin'
    }
},
{
    timestamps:true
});

const holidayModel = mongoose.model("holiday", holidaySchema);
export default holidayModel;
