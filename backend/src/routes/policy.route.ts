import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { createPolicy, getPolicylist, updatePolicy } from "../controllers/policy.controller";
import { createCustomerPolicy, getCustomerPolicies } from "../controllers/customerPolicy.controller";
import { createClaimPolicy, getClaimPolicies } from "../controllers/claim-policy.controller";

const policyRouter = Router()

policyRouter.post('/',authMiddleware,createPolicy)
policyRouter.get("/",authMiddleware,getPolicylist)
policyRouter.put("/:policy_id",authMiddleware,updatePolicy)

//customer policy 
policyRouter.post('/customer',authMiddleware,createCustomerPolicy)
policyRouter.get('/customer',authMiddleware,getCustomerPolicies)


//claim policy
policyRouter.post('/customer/claim',authMiddleware,createClaimPolicy)
policyRouter.get('/customer/claim',authMiddleware,getClaimPolicies)


export default policyRouter