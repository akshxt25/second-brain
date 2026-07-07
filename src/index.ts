import express from "express"
import mongoose from "mongoose";
import jwt from "jsonwebtoken"
import connectDB, { ContentModel, LinkModel, UserModel } from "./db.js";
import z from "zod";

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


 const signupSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    password: z.string().min(8, "Password must be at least 8 characters")
 });

 const signinSchema = signupSchema;

 const contentSchema = z.object({
    title: z.string().min(1),
    link: z.string()
 });

 const deleteContentSchema = z.object({
    contentId: z.string()
 });

 const shareBrainSchema = z.object({
    share: z.boolean()
 })

 const shareLinkSchema = z.object({
    shareLink: z.string().min(1)
 })



app.post("/api/v1/signup" , async (req, res) => {
    // const username = req.body.username;
    // const password = req.body.password;

    const result = signupSchema.safeParse(req.body);

    if(!result.success){
        return res.status(400).json({
            errors: result.error.flatten().fieldErrors
        })
    }

    const { username, password } = result.data;

    try {
        const user = await UserModel.create({
            username: username,
            password: password
        })

        console.log(user);

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
    // const username = req.body.username;
    // const password = req.body.password;

    const result = signinSchema.safeParse(req.body)

    if(!result.success){
        return res.status(400).json({
            errors: result.error.flatten()
        })
    }

    const {username, password} = result.data;

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
    // const link = req.body.link;            //content link eg-> yt url, x post 
    // const title = req.body.title;

    const result = contentSchema.safeParse(req.body);

    if(!result.success){
        return res.status(400).json({
            errors: result.error.flatten().fieldErrors
        })
    }

    const {title, link} = result.data;

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

    // const contentId = req.body.contentId;

    const result = deleteContentSchema.safeParse(req.body);
    
    if(!result.success){
        return res.status(400).json(result.error.flatten());
    }
    
    const {contentId} = result.data;

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
    // const share = req.body.share;

    const result = shareBrainSchema.safeParse(req.body);

    if(!result.success){
        return res.status(400).json(result.error.flatten());
    }

    const {share} = result.data;
    

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
    // const hash = req.params.shareLink;

    const result = shareLinkSchema.safeParse(req.params);

    if(!result.success){
        return res.status(400).json(result.error.flatten());
    }

    const {shareLink} = result.data;



    const link = await LinkModel.findOne({
        hash: shareLink
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