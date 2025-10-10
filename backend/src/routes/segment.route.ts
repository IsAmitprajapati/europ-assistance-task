import { Router } from "express";
import { createSegment, getAllSegments, updateSegment } from "../controllers/segment.controller";
import { authMiddleware } from "../middleware/authMiddleware";


const segmentRouter = Router()


segmentRouter.post("/",authMiddleware, createSegment);
segmentRouter.get("/",authMiddleware, getAllSegments);
segmentRouter.put("/:segmentId",authMiddleware, updateSegment);


export default segmentRouter