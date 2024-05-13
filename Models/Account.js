import mongoose from "mongoose";

const accountSchema = new mongoose.Schema({
    account_id: {
        type: String,
        required: true,
        unique: true,
    },

    name : {
        type : String,
        required : false,
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

    bio : {
        type : String,
        required : false,
        unique : false,
    },

    password : {
        type : String,
        required : true,
        unique : false,
    },

    visibility : {
        type : String,
        enum : ['public','private'],
        default : 'public',
        required : false,
    }
});

const account = mongoose.model("Account",accountSchema);
export default account;
