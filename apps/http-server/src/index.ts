import express from 'express'
import cors from 'cors'
import {config, firebaseApp, setAndGetAccessToken} from './config'
import {prisma} from '@repo/db'
import cookieParser from 'cookie-parser'
const app = express()

app.use(cors())
app.use(express.json())
app.use(cookieParser())

app.get("/", (req, res)=>{
    res.send("HTTP Server is running broo :)")
})

app.post("/signin", async(req, res)=>{
    try {
        const {idToken} = req.body
        if(!firebaseApp){
            console.log("No fb app")
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }
        const decodedToken = await firebaseApp.auth().verifyIdToken(idToken);
        const uid = decodedToken.uid;
        const user = await prisma.user.findUnique({ where: { id: uid } });
        if(!user) {
            const newUser = await prisma.user.create({
                data: {
                    id: uid,
                    name: decodedToken.name,
                    email: decodedToken.email!,
                    profilePicture: decodedToken.picture
                }
            });
            const accessToken = setAndGetAccessToken(res, uid);
            res
            .status(200)
            .json(
                { 
                    message:"User logged in successfully", 
                    user: newUser, 
                    accessToken 
                });
            return;
        }

    } catch (error : any) {
        console.log("signin error", error)
        res.status(500).json({
            message: error.message || "Something went wrong"
        })
    }
})

app.listen(config.PORT, ()=>{
    console.log("HTTP server is running on port", config.PORT)
})