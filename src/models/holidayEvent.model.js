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

const holidayEventModel = mongoose.model("holiday",holidayEventSchema);
export default holidayEventModel;