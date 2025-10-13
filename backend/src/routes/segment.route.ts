import { Router } from "express";
import { createSegment, getAllSegments, getSegmentCustomers, updateSegment } from "../controllers/segment.controller";
import { authMiddleware } from "../middleware/authMiddleware";


const segmentRouter = Router()


segmentRouter.post("/",authMiddleware, createSegment);
segmentRouter.get("/",authMiddleware, getAllSegments);
segmentRouter.put("/:segmentId",authMiddleware, updateSegment);
segmentRouter.get("/customer/:segmentId",authMiddleware, getSegmentCustomers);


export default segmentRouter