require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const users = require('./models/users')
const bcrypt = require('bcrypt')
const session = require('express-session')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')

const app = express()
app.use(express.json())
app.use(cors({
    origin: [process.env.ORIGIN],
    methods: ["GET", "POST"],
    credentials: true
}))
app.use(cookieParser())
app.use(bodyParser.urlencoded({extended: true}))
app.use(session({
    key: "userId",
    secret: "secretId",
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 60 * 60 * 24
    }
}))

const saltRounds = 10

mongoose.set('strictQuery',false)
mongoose.connect(process.env.DATABASE_URL,() => {
    console.log(mongoose.connection.readyState)
})

app.post('/register', async (req,res) => {
    const userData = req.body
    try{
        const userNumber = await users.findOne({number: userData.number})
        if(userNumber == null){
            bcrypt.hash(userData.password, saltRounds, async (err,hash) => {
                if(err){
                    console.log(err)
                }else{
                    await users.create({number: userData.number,password: hash})
                    res.send("Register Success")
                } 
            })
        }else{
            res.send("User Already Exists")
        }
        
    }catch(e){
        console.log("Error : ",e)
    }
})

app.post('/login', async (req,res) => {
    const userData = req.body
    try{
        const userNumber = await users.findOne({number: userData.number})
        if(userNumber == null){
            res.send("User Not Exists")
        }else{
            bcrypt.compare(userData.password,userNumber.password,(err,response) => {
                if(response){
                    req.session.user = userNumber
                    res.send("Login Success")
                }else{
                    res.send("Password Incorrect")
                }
            })
        }
    }catch(e){
        console.log("Error : ",e)
    }
})

app.get('/login',(req,res) => {
    if(req.session.user){
        res.send({loggedIn: true,user: req.session.user})
    }else{
        res.send({loggedIn: false})
    }
})

app.listen(process.env.PORT,() => {
    console.log('Server is running.')
})