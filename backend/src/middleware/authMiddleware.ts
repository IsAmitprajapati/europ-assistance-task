///<reference path="../types/express/index.d.ts" />

import { Request, Response, NextFunction } from "express";
import jwt, { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { env } from "../config/env";

export function authMiddleware(
  req: Request, 
  res: Response, 
  next: NextFunction
) {
  try {
    // Get token from cookies or Authorization header
    const token = req.cookies?.accessToken || 
      req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
       res.status(401).json({
        success: false,
        message: "Authentication token missing",
      });
      return
    }

    // Verify and decode token
    const decoded  =  jwt.verify(token, env.JWT_SECRET ) as { id: string };

    // Attach user ID to request object
    req.userId = decoded.id;

    next();
  } catch (err) {
    if (err instanceof TokenExpiredError) {
       res.status(401).json({
        success: false,
        message: "Token expired. Please login again.",
      });
      return
    }

    if (err instanceof JsonWebTokenError) {
       res.status(401).json({
        success: false,
        message: "Invalid token. Please login again.",
      });
      return
    }

    console.error("JWT verification error:", err);

    res.status(500).json({
      success: false,
      message: "Internal server error during authentication",
    });

    return
  }
}