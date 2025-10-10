import * as express from "express";

declare global {
  namespace Express {
    interface Request {
      userId?: string; // optional, or number if IDs are numeric
    }
  }
}

export {}; // ensures this file is treated as a module
