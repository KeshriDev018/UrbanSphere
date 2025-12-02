import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";


const ConnectDB = async ()=>{
try { 
    
    const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)

    console.log(`\nMONGO_DB CONNECTED !! DB Host ${connectionInstance.connection.host}`)


} catch (error) {
    console.error("MONGO DB CONNECTION ERROR",error);
    process.exit(1);
    
}
}

export default ConnectDB