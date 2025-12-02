import dotenv from "dotenv"
dotenv.config({
  path: "./.env",
});

import app from "./app.js"
import ConnectDB from "./db/index.js";







ConnectDB()
.then(app.listen(process.env.PORT || 8000 ,()=>{
    console.log(`Server running on port ${process.env.PORT}`)
   
}))
.catch((err)=>{
    console.log("MONGO DB connection failed",err);
})
