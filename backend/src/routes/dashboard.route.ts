import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { claimPolicyStatusController, CustomerAcquisition, dashboardController, policyDistributionChart, RevenueChart } from "../controllers/dashboard.controller";


const dashboardRouter = Router()

dashboardRouter.get('/',authMiddleware,dashboardController)
dashboardRouter.get('/policy-distribution',authMiddleware,policyDistributionChart)
dashboardRouter.get('/revenues',authMiddleware,RevenueChart)
dashboardRouter.get('/customer-acquisition',authMiddleware,CustomerAcquisition)
dashboardRouter.get('/claim-policy-chart',authMiddleware,claimPolicyStatusController)

export default dashboardRouter
