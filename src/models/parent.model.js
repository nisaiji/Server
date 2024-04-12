import mongoose from "mongoose";
// import addressSchema from "./Schemas/address.schema";

const parentSchema = mongoose.Schema({
    username:{
        type:String,
        unique:true,
        required:true,
    },
    firstname:{
        type:String,
        unique:true,
        required:true,
    },
    lastname:{
        type:String,
        unique:true,
        required:true,
    },
    phone:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true
    },
    password:{
        type:String,
        required:true,
    },

    // one parent can have multiple childs 
    child:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"student"
        }
    ],
    address:{
        type:String,
    }
        
    
})

const parentModel = mongoose.model('parent',parentSchema);

export default parentModel;