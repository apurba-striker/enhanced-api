import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        unique: true,
        default: () => new mongoose.Types.ObjectId()
    },
    
    name : {
        type : String,
        required : true,
        unique : false,
    },

    email : {
        type : String,
        required : true,
        unique : true,
    },

    phone : {
        type : String,
        required : false,
        unique : false,
    },
    
    password : {
        type : String,
        required : true,
        unique : false,
    },

    user_type : {
        type : String,
        enum : ["admin","normal"],
        default : "normal",
    }
})

const user = mongoose.model("User",userSchema);
export default user;