import { Request, Response, Router } from "express";
import { getCurrentUser, loginUser, logout, registerUser } from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/authMiddleware";


const authRouter = Router()


authRouter.post("/register", registerUser);
authRouter.post('/login',loginUser)
authRouter.get('/user',authMiddleware,getCurrentUser)
authRouter.get('/logout',authMiddleware,logout)


export default authRouter