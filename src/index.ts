import express from "express"
import  dotenv from "dotenv";
dotenv.config();
import connectDB from "./db.js";

import dns from "node:dns";
import router from "./routes/userRoute.js";


dns.setServers([
  "8.8.8.8",
  "1.1.1.1"
]);

const app = express();
app.use(express.json());


connectDB();

app.use("/api/v1", router);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});


//  const signupSchema = z.object({
//     username: z.string().min(3, "Username must be at least 3 characters"),
//     password: z.string().min(8, "Password must be at least 8 characters")
//  });

//  const signinSchema = signupSchema;

//  const contentSchema = z.object({
//     title: z.string().min(1),
//     link: z.string(),
//     tags: z.array(z.string()).default([])
//  });

//  const deleteContentSchema = z.object({
//     contentId: z.string()
//  });

//  const shareBrainSchema = z.object({
//     share: z.boolean()
//  })

//  const shareLinkSchema = z.object({
//     shareLink: z.string().min(1)
//  })


// app.get("/api/v1/brain/:shareLink", async(req, res) => {
//     // const hash = req.params.shareLink;

//     const result = shareLinkSchema.safeParse(req.params);

//     if(!result.success){
//         return res.status(400).json(result.error.flatten());
//     }

//     const {shareLink} = result.data;



//     const link = await LinkModel.findOne({
//         hash: shareLink
//     });

//     if(!link){
//         res.status(411).json({
//             message: "Sorry incorrect input"
//         })
//         return;
//     }

//     const content = await ContentModel.findOne({
//         userId: link.userId
//     })

//     const user = await UserModel.findOne({
//         _id: link.userId
//     })

//     if (!user) {
//         res.status(411).json({
//             message: "user not found, error should ideally not happen"
//         })
//         return;
//     }

//     res.json({
//         username: user.username,
//         content: content
//     })

// })