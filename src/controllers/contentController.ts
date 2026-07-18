import type { Response } from "express";
import type { AuthRequest } from "../middlewares/authMiddleware.js";
import { ContentModel } from "../models/contentModel.js";
import { UserModel } from "../models/userModel.js";


export const postContent = async (req: AuthRequest, res: Response) => {
  const {link, title, contentType, tags} = req.body;
  const userId = req.userId;
  try{
    if(!link || !contentType || !tags || !title){
      return res.status(401).json({
        message: "All fields are required."
      })
    }

    if(!userId){
      return res.status(404).json({
        message: "User not found"
      })
    }

    const content = await new ContentModel({
      link: link,
      title: title,
      contentType: contentType,
      tags: tags,
      owner: userId
    })

    await content.save();
    return res.status(200).json({
      message: "Content saved Successfully"
    })

  } catch (err){
    console.log("Err(catch): something went wrong",err)
    return;
  }
}


export const getContent = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  try{

    if(!userId){
        return res.status(401).json({
            message: "Unauthorized"
        });
    }

    const user = await UserModel.findById(userId)

    if(!user){
      return res.status(409).json({
        message: "Invalid User"
      })
    }

    const content = await ContentModel.find({
      owner: userId
    })

    console.log(content);

    return res.status(200).json({
      message: "Content retrieved",
      data: content
    })

  } catch (err) {
    return res.status(500).json({
      message: "Internal server error"
    })
  }
}


export const deleteContent = async (req: AuthRequest, res: Response) => {
  const {contentId} = req.params;
  const userId = req.userId;
  try{
    const user = await UserModel.findById(userId)

    if(!user){
      return res.status(404).json({
        message: "User does not exsist"
      })
    }

    const content = await ContentModel.findByIdAndDelete(contentId )

    if(!content){
      return res.status(403).json({
        message: "Content Id not valid"
      })
    }

    return res.status(200).json("Content deleted successfully");


  } catch (err) {
    return res.status(500).json({
      message: "Some Error occured"
    })
  }
}


export const shareContent = async (req: AuthRequest, res: Response) => {
  const {userId} = req.params;
  try{
    const user = await UserModel.findOne({
      userId
    })

    if(!user){
      return res.status(404).json({
        message: "User not found"
      })
    }

    const documents = await ContentModel.find({
      userId
    })
    
    return res.status(200).json({
      data: documents
    })

  } catch (error) {
    return res.status(500).json({
      message: "Internal error occured"
    })
  }
}