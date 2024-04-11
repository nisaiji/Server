import mongoose from "mongoose";
import addressSchema from "./Schemas/address.schema";

const schoolSchema = mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    affiliationNo:{
        type:String,
        required:true,
        unique:true
    },
    address:{
        type:addressSchema,
    },
    sections:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'section',
        }
    ],
    cordinators:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"cordinator"
        }
    ]

});

const schoolModel = mongoose.model('school',schoolSchema); 
export default schoolModel;