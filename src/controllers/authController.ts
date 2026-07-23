import type { Request, Response } from "express";
import { UserModel } from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"

export const register = async (req: Request, res: Response) => {
  const {username, email, password} = req.body;
  try{
    if(!username || !password || !email){
      return res.status(400).json({
        message: "All fields required"
      })
    }

    const checkEmail = await UserModel.findOne({
      email: email
    })
    
    if(checkEmail){
      return res.status(409).json({
        message: "Email already exists"
      })
    }

    const hashedPassword = await bcrypt.hash(password, 5);

    const newUser = new UserModel({
      username: username,
      email: email,
      password: hashedPassword
    })

    await newUser.save();

    return res.status(201).json({
      message: "User signed up successfully"
    })

  }
  catch(error){
    return res.status(500).json({
      message: "Some Error Occured"
    })    
  }
}

export const login = async (req: Request, res: Response) => {
  const {email, password} = req.body;
  try{
    if(!email || !password){
      return res.status(409).json({
        message: "All fields required"
      })
    }

    console.log(req.body)

    const user = await UserModel.findOne({
      email: email
    })

    if(!user){
      return res.status(404).json({
        message: "User does not exsist"
      })
    }

    const checkPassword = await bcrypt.compare(password, user.password as string);

    if(!checkPassword){
      return res.status(401).json({
        message: "Invalid Credentials"
      })
    }

    const token = jwt.sign({userId: user._id}, process.env.JWT_SECRET as string, {
      expiresIn: '1d'
    })

    return res.status(200).json({
      message: "user logged in successfully",
      token,
      userID: user._id 
    })

  } catch (error){
      console.log("something wrong",error);
      return res.status(500).json({
        message: "Something went wrong"
      })
  }
}

export const logout = async (req: Request, res: Response) => {
  // Since you are using JWTs stored on the client (not in HTTP-only cookies), 
  // the actual logout logic happens on the frontend by removing the token.
  // This endpoint is provided for consistency and in case you want to add 
  // server-side token blacklisting or cookie clearing in the future.
  return res.status(200).json({
    message: "User logged out successfully"
  });
}