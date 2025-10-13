///<reference path="./types/express/index.d.ts" />

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { env } from './config/env';
import qs from "qs";

import rateLimit from 'express-rate-limit';
import authRouter from './routes/auth.route';
import segmentRouter from './routes/segment.route';
import customerRouter from './routes/customer.route';
import policyRouter from './routes/policy.route';


const app = express()

// Split and trim comma-separated values
const ALLOWED_ORIGINS = env.ALLOWED_ORIGINS?.split(",").map(origin => origin.trim())

const corsOptions: cors.CorsOptions = {
    origin: (origin, callback) => {
  
      // Allow requests with no origin (like mobile apps, Postman)
      if (!origin) return callback(null, true);
  
      if (ALLOWED_ORIGINS?.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("❌ Not allowed by CORS"));
      }
      
    },
    credentials: true,
};

// Rate Limiting Middleware
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // time frame = 15 minutes
    max: 100,                 // max requests = 100 per IP in that time frame
});


app.use(cors(corsOptions))
app.use(limiter)
app.use(express.json())
app.use(cookieParser())
app.use(morgan('dev'))

//Enable nested query parameter parsing safely in TypeScript
app.set("query parser", (str: string) => qs.parse(str));

app.get("/",(request : Request, response : Response) =>{
    return response.status(200).json({
        message : "Server is running",
        success : true
    })
})

//user routes api
app.use("/api/auth", authRouter); 
app.use("/api/segment", segmentRouter); 
app.use("/api/customer", customerRouter); 
app.use("/api/policy", policyRouter)


export default app;
