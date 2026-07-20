import type { Response } from "express";
import type { AuthRequest } from "../middlewares/authMiddleware.js";
import { ContentModel } from "../models/contentModel.js";
import { UserModel } from "../models/userModel.js";
import { buildContextText, generateEmbedding } from "../services/embeddingService.js";


export const postContent = async (req: AuthRequest, res: Response) => {
  const {link, title, contentType, tags, notes} = req.body;
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

    // Build context text for embedding
    const contextText = buildContextText(contentType, title, tags, notes);

    // Generate embedding (non-blocking — if it fails, we still save the content)
    let embedding: number[] = [];
    try {
      embedding = await generateEmbedding(contextText);
    } catch (embError) {
      console.error("Failed to generate embedding (content will be saved without it):", embError);
    }

    const content = await new ContentModel({
      link: link,
      title: title,
      notes: notes || "",
      contentType: contentType,
      tags: tags,
      owner: userId,
      embedding: embedding
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
    }).select("-embedding") // Exclude embedding from response to save bandwidth

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


/**
 * Vector search: embed the user's query and find semantically similar content.
 * Uses MongoDB Atlas $vectorSearch aggregation.
 */
export const searchContent = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  const query = req.query.q as string;

  try {
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!query || query.trim().length === 0) {
      return res.status(400).json({ message: "Search query is required" });
    }

    // Generate embedding for the search query
    let queryEmbedding: number[];
    try {
      queryEmbedding = await generateEmbedding(query.trim());
    } catch (embError) {
      console.error("Failed to generate query embedding:", embError);
      return res.status(500).json({ message: "Failed to process search query" });
    }

    if (queryEmbedding.length === 0) {
      return res.status(400).json({ message: "Could not generate embedding for query" });
    }

    // Run MongoDB Atlas Vector Search
    const results = await ContentModel.aggregate([
      {
        $vectorSearch: {
          index: "vector_index",
          path: "embedding",
          queryVector: queryEmbedding,
          numCandidates: 100,
          limit: 20,
          filter: {
            owner: userId
          }
        }
      },
      {
        $project: {
          _id: 1,
          title: 1,
          link: 1,
          notes: 1,
          contentType: 1,
          tags: 1,
          owner: 1,
          score: { $meta: "vectorSearchScore" }
        }
      }
    ]);

    return res.status(200).json({
      message: "Search results",
      data: results
    });

  } catch (error) {
    console.error("Search error:", error);
    return res.status(500).json({
      message: "Search failed"
    });
  }
}