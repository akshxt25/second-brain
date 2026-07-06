import express from "express"
import mongoose from "mongoose";
import jwt from "jsonwebtoken"
import connectDB, { ContentModel, LinkModel, UserModel } from "./db.js";

import dns from "node:dns";
import { userMiddleware } from "./middleware.js";
import { random } from "./utils.js";

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
            username: username,
            password: password
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

    console.log("before content creation")
    //@ts-ignore
    console.log(req.userId);

    ContentModel.create({
        link,
        title,
        // @ts-ignore
        owner: req.userId,
        tags: []
    })

    console.log("call after content creation")

    return res.json({
        message: "Content added"
    })

})

app.get("/api/v1/content", userMiddleware, async (req, res) => {
    //@ts-ignore
    const userId = req.userId;

    const result = await ContentModel.find({
        owner: userId
    })

    return res.json({
        result
    })

})

app.delete("/api/v1/content", userMiddleware, async (req, res) => {
    //@ts-ignore
    const userId = req.userId;

    const contentId = req.body.contentId;

    if(!userId){
        return res.status(404).json({
            message: "User not found"
        })
    }

    await ContentModel.findByIdAndDelete(contentId)

    return res.json({
        message: "Content deleted"
    })

})

app.post("/api/v1/brain/share", userMiddleware, async (req, res) => {
    const share = req.body.share;
    if(share){
        const existingLink = await LinkModel.findOne({
            //@ts-ignore
            userId: req.userId
        })

        if(existingLink){
            res.json({
                hash: existingLink.hash
            })
            return;
        }
        const hash = random(10);
        await LinkModel.create({
            //@ts-ignore
            userId: req.userId,
            hash: hash
        })
        res.json({
            hash
        })
    } else{
        await LinkModel.deleteOne({
            //@ts-ignore
            userId: req.userId
        })
    }
})

app.get("/api/v1/brain/:shareLink", async(req, res) => {
    const hash = req.params.shareLink;
    const link = await LinkModel.findOne({
        hash
    });

    if(!link){
        res.status(411).json({
            message: "Sorry incorrect input"
        })
        return;
    }

    const content = await ContentModel.findOne({
        userId: link.userId
    })

    const user = await UserModel.findOne({
        _id: link.userId
    })

    if (!user) {
        res.status(411).json({
            message: "user not found, error should ideally not happen"
        })
        return;
    }

    res.json({
        username: user.username,
        content: content
    })

})