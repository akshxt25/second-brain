import express from "express"
import mongoose from "mongoose";
import jwt from "jsonwebtoken"
import connectDB, { ContentModel, UserModel } from "./db.js";

import dns from "node:dns";
import { userMiddleware } from "./middleware.js";

dns.setServers([
  "8.8.8.8",
  "1.1.1.1"
]);

const JWT_PASSWORD = "123456"

const app = express();
app.use(express.json());


connectDB();

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

app.post("/api/v1/signup" , async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    try {
        const result = await UserModel.create({
            username: username,
            password: password
        })

        console.log(result);

        res.json({
            message: "you signed up"
        })
    } catch (error) {
        res.status(411).json({
            message: "User already exists"
        })
    }
})

app.post("/api/v1/signin", async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    try {
        const exsistingUser = await UserModel.findOne({
            username: username
        })

        if(!exsistingUser){
            return res.status(403).json({
                message: "User does not exsist"
            })
        }

        const token = jwt.sign({
            id: exsistingUser._id
        }, JWT_PASSWORD)

        res.json({
            token
        })

    } catch (error) {
        
    }
})

app.post("/api/v1/content", userMiddleware, async (req, res) => {
    const link = req.body.link;            //content link eg-> yt url, x post 
    const title = req.body.title;

    ContentModel.create({
        link,
        title,
        // @ts-ignore
        owner: req.userId,
        tags: []
    })

})

// app.get("/api/v1/content", (req, res) => {

// })

// app.delete("/api/v1/content", (req, res) => {

// })

// app.post("/api/v1/brain/share", (req, res) => {

// })

// app.get("/api/v1/brain/:shareLink", (req, res) => {

// })