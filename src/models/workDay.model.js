import mongoose from "mongoose";
 
// If we want to declare any holiday(sunday) as working day
const workDaySchema =new mongoose.Schema({
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
    admin:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'admin'
    }
},
{
    timestamps:true
});

const workDayModel = mongoose.model("workday", workDaySchema);
export default workDayModel;
