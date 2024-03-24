### to conenct with database from index.js file

```express
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
```