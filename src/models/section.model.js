import mongoose from "mongoose";

const sectionSchema = mongoose.Schema({
    name:{
        type:String,
        required:true,
        unique:true
    },
    cordinatorName:{
        type:String,
        required:true
    },
    students:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'student'
        }
    ]
})