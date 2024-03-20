import express  from "express";
const app = express()
app.get('/', (reqest, response) => {
    response.send("hii this is just a check")
})
const port = 9000

app.listen(port,()=>console.log(`example listening at ${port}`))