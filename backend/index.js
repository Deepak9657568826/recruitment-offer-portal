const express = require('express');
const cors = require('cors');
const path = require('path');
const { CONNECTED_TO_DB } = require('./config/db');
const { userRouter } = require('./route/user.route');
const { authRouter } = require('./route/auth.route');
const { candidateRouter } = require('./route/candidate.route');
const { emailRouter } = require('./route/email.route');
const { templateRouter } = require('./route/template.route');

const app = express()
app.use(cors())
app.use(express.json())

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

app.get("/health-check", (req, res)=>{
    res.json({message : "Server is healthy"})
})
app.use("/", userRouter)
app.use("/", authRouter)
app.use("/", candidateRouter)
app.use("/", emailRouter)
app.use("/", templateRouter)

const PORT = process.env.PORT || 5000   
app.listen(PORT, async()=>{
    try{
        await CONNECTED_TO_DB
        console.log("Connected to DB successfully")
        console.log(`Server is running on port ${PORT}`)    
    }
    catch(err){
        console.log("err", err.message)
    }
})


