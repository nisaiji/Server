import mongoose from "mongoose";
import addressSchema from "./Schemas/address.schema";


const studentSchema = mongoose.Schema({
    firstname:{
        type:String,
        required:true,
    },
    lastname:{
        type:String,
        required:true,
    },
    gender:{
        type:String,
        enum:['Male','Female','Non-binary','Other']
    },
    age:{
        type:Number,
        required:true,
        min:5,
        max:100,
    },
    phone:{
        type:String,
        required:true,
       
    },
    email:{
        type:String,
        required:true,
        unique:true,

    },
    fathername:{
        type:String,
        required:true,
    },
    fatherPhone :{
        type:String,
        required:true,
    },
    class:{
        type:String,
        required:true,
    },
    address:{
        type:addressSchema,
        // required:true,
    },
    section:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'section'
    }
    
})

const studentModel = mongoose.model("student",studentSchema);
export default studentModel;