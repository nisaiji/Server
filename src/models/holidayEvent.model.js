import mongoose from "mongoose";
 
const holidayEventSchema =new mongoose.Schema({
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
    isActive:{
        type:String,
        default:true
    },
    description:{
        type:String,
    },
    holiday:{
        type:Boolean,
    },
    event:{
        type:Boolean,
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