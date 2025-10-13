import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { createCustomer, getCustomerList, updateCustomer } from "../controllers/customer.controller";
import { createInteraction, getInteractionList } from "../controllers/interaction.controller";

const customerRouter = Router()


customerRouter.post('/',authMiddleware,createCustomer)
customerRouter.put('/:customerId',authMiddleware,updateCustomer)
customerRouter.get('/',authMiddleware,getCustomerList)

//customer interactions
customerRouter.post("/interaction",authMiddleware,createInteraction)
customerRouter.get("/interaction/:customer_id",authMiddleware,getInteractionList)

export default customerRouter
