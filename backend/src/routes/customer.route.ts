import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { createCustomer } from "../controllers/customer.controller";

const customerRouter = Router()


customerRouter.post('/',authMiddleware,createCustomer)

export default customerRouter
