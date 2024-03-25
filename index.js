import express  from "express";
import mongoose from "mongoose";
import { DB_NAME } from "./constants.js";
import connectDatabase from "./db/ConnectMongoDb.js";
import dotenv from "dotenv"
import { app } from "./app.js";
dotenv.config({
    path:'./env'
})


// const app = express()
// app.get('/', (request, response) => {
//     response.send("hii this is just a check")
// })
// const port = 9000

// app.listen(port, () => console.log(`example listening at ${port}`))


connectDatabase()
    .then(()=>app.listen(process.env.PORT||8000,()=>console.log(`Server is listening at: ${process.env.PORT}`)))
.catch(error=>console.log(`MONGODB CONNECTION FAILED!!!`,error))
//app.listen(process.env.PORT,()=>console.log(`example listening at ${process.env.PORT}`))