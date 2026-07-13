import type { NextFunction, Request, Response } from "express";
import jwt, {type JwtPayload} from "jsonwebtoken";
import type { Types } from "mongoose";

export interface AuthRequest extends Request {
  userId ?: Types.ObjectId;
}

export const authMiddleware = async(req: AuthRequest, res: Response, next: NextFunction) => {
  try{
    const token = req.headers["authorization"]

    console.log("token is: ",token);

    if(!token){
      return res.status(403).json({
        message: "token not found"
      })
    }

    if(!process.env.JWT_SECRET){
      return res.status(404).json({
        message: "Internal Server Error"
      })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as unknown as { userId : Types.ObjectId };
    req.userId = decoded.userId;

    console.log("usetoken : ", decoded);
    next();


  } catch (error) {
    res.status(401).json({
      message: `Inavlid or expired token ${error}`
    })
    return;
  }
}