const express = require("express")
const mongoose = require("mongoose")
const bcrypt = require("bcrypt")
const cors = require("cors")
const dotenv = require("dotenv")
const session = require("express-session")
const MongoStore = require("connect-mongo")
const UserModel = require("./model/user")
const app = express()

dotenv.config()
// const corsOptions = {
//     origin: ['http://localhost:3000', 'https://vi-meet-app.vercel.app'], 
//     credentials: true, 
// };
// app.use(cors(corsOptions));

app.use(cors({
    origin: (origin, callback) => {
        console.log("Origin:", origin);
        callback(null, true); // Temporarily allow all origins
    },
    credentials: true
}));

app.use(express.json())

mongoose.connect(process.env.MONGO_URI)
    .then(()=> console.log("Connected to MongoDB"))
    .catch(err => console.log("Failed to connect to MongoDB",err))

app.listen(process.env.PORT,()=>{
    console.log(`Server is started at ${process.env.PORT}`)
})

// app.use(session({
//     secret:process.env.SESSION_SECRET,
//     resave:false,
//     saveUninitialized:false,
//     store: MongoStore.create(
//         {
//             mongoUrl:process.env.MONGO_URI
//         }
//     ),
//     ccookie: {
//         maxAge: 24 * 60 * 60 * 1000, 
//       }
// }))

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI,
    }),
    cookie: {
        maxAge: 24 * 60 * 60 * 1000, // 1 day
        secure: true, // Ensures cookies are sent only over HTTPS
        sameSite: 'none', // Allows cross-origin cookie sharing
    }
}));

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
    try{
        const {email, password} = req.body
        const user = await UserModel.findOne({email})
        if(user){
            const passKey = await bcrypt.compare(password, user.password)
            if(passKey){
                req.session.user = {id:user._id, name:user.name, email:user.email}
                res.json("Success")
            }else{
                res.status(401).json("Password does not match")
            }
        }else{
            res.status(401).json("No records Found")
        }
    }catch(error){
        res.status(500).json({error:error.message})
    }
})

app.post("/user", (req, res) => {
     const { email, password } = req.body;

    // Log request body for debugging
    console.log("Request Body:", req.body);

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    // Simulate user data response
    res.status(200).json({
        message: "Route works without authentication",
        data: { email, password }
    });
});
