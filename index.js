import express  from "express";
import mongoose from "mongoose";
import { DB_NAME } from "./constants.js";

const app = express()
// app.get('/', (request, response) => {
//     response.send("hii this is just a check")
// })
// const port = 9000

// app.listen(port, () => console.log(`example listening at ${port}`))

function connectDatabase() { }
; (async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error", () => {
            console.log("ERROR: ", error)
            throw error
        })
        app.listen(process.env.PORT,()=>console.log(`App is listening on port ${process.env.PORT}`))
    } catch (error) {
        console.log("Error: ", error)
    }
})()
