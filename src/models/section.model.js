import mongoose from "mongoose";

const sectionSchema = mongoose.Schema({
    name:{
        type:String,
        required:true,
        unique:true
    },
    cordinatorName:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'cordinator',
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