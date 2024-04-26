import mongoose from "mongoose";

const sectionSchema = mongoose.Schema({
    name:{
        type:String,
        required:true,
        unique:true
    },
    cordinator:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'cordinator',
        // required:true
    },
    students:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'student'
        }
    ]
})

const sectionModel = mongoose.model('section',sectionSchema);
export default sectionModel;


