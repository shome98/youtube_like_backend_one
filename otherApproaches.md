### to conenct with database from index.js file

```
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
### to register a user steps need to follow or check
```
    1.get user details from forntend
    2.validation-not empty check all the required fields are present or not
    3.check if user already exists like username and email
    4.check for images check for avatar image
    5.upload the images to cloudinary
    6.create user object and create and entry in database
    7.remove password and refresh token field from response while creating database entry
    8.check for creation is done or not
    9.return yes
```

### to log in an user
```
    1.get user data
    2.check all the required fields are present or not
    3.find the user
    4.password check
    5.access and refresh token generation
    6.send response
```
