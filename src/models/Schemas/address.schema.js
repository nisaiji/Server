import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
    street:{
        type:String,
        // required:true
    },
    colony:{
        type:String,
        // required:true
    },
    city:{
        type:String,
    },
    postalCode:{
        type:String,
    },
    state:{
        type:String
    },
    country:{
        type:String,
        default:"India",
    }
});

export default addressSchema;