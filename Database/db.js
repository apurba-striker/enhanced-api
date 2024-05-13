import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

async function connect() {
    const uri = process.env.MONGODB_ATLAS_URI;

    try {
        const db = await mongoose.connect(uri);
        console.log("Database Connected");
        return db;
    } catch (error) {
        console.error("Database Connection Error:", error);
    }
}

export default connect;
