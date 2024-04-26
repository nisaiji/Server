import mongoose from "mongoose";
// for one section of students one cordinator will be assigned.
const cordinatorSchema = mongoose.Schema({
    username:{
        type:String,
        unique:true,
        required:true,
    },
    firstname:{
        type:String,
        required:true,
    },
    lastname:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        unique:true,
        required:true,
    },
    isCordinator:{
        type:Boolean,
        default:false,
    },
    password:{
        type:String,
        required:true,
    },
    phone:{
        type:String,
        required:true,
    },
    section:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"section"
        }
    ],
   school:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"school",
    }
});

const cordinatorModel = mongoose.model('cordinator',cordinatorSchema);
export  default cordinatorModel;