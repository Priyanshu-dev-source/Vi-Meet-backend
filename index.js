const express = require("express")
const mongoose = require("mongoose")
const bcrypt = require("bcrypt")
const cors = require("cors")
const dotenv = require("dotenv")
const UserModel = require("./model/user")

dotenv.config()
const app = express()
app.use(cors())

app.use(express.json())


mongoose.connect(process.env.MONGO_URI)
    .then(()=> console.log("Connected to MongoDB"))
    .catch(err => console.log("Failed to connect to MongoDB",err))

app.listen(process.env.PORT,()=>{
    console.log(`Server is started at ${process.env.PORT}`)
})

app.post("/signup", async (req,res)=>{
    try{
        const {name, email, password} = req.body;
        const existingUser = await UserModel.findOne({ email });
        console.log(existingUser)
        if(existingUser){
            return res.status(400).json({ error: "Email already exists"}) 
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        const newUser = new UserModel({name, email, password: hashedPassword})
        const savedUser = await newUser.save()
        res.status(201).json(savedUser)
    } catch (error){
        res.status(500).json({ error: error.message})
    }
})

app.post("/login", async (req, res)=>{
    const {email, password} = req.body
    const user = await UserModel.findOne({email})
    if(user){
        const passKey = await bcrypt.compare(password, users.password)
        if(passKey){
            res.status(200).json("Logged in succesfully")
        }else{
            res.status(401).json("Password does not match")
        }
    }else{
        res.status(401).json("No records Found")
    }
})