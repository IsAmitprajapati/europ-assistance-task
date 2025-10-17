import { Request, Response } from "express";
import CustomerPolicy from "../models/customerPolicy.model";
import CustomerModel from "../models/customer.model";
import PolicyModel from "../models/policy.model"; 
import ClaimPolicyModel, { IClaimPolicy } from "../models/claimPolicy.model";

// Create claim policy controller
export const createClaimPolicy = async (req: Request, res: Response) => {
    try {
        const { customer_policy_id, claim_amount, reason } = req.body;

        // Validation
        if (!customer_policy_id || !claim_amount || !reason) {
            return res.status(400).json({ success: false, message: "customer_policy_id, claim_amount and reason are required." });
        }
        if (claim_amount <= 0) {
            return res.status(400).json({ success: false, message: "claim_amount must be greater than 0." });
        }

        // Check if customer_policy exists
        const customerPolicy = await CustomerPolicy.findById(customer_policy_id);
        if (!customerPolicy) {
            return res.status(404).json({ success: false, message: "Customer policy not found." });
        }
        // Check policy status
        if (customerPolicy.status !== "Active") {
            return res.status(400).json({ success: false, message: "Cannot claim on an inactive policy." });
        }

        // Check if policy exists
        const policy = await PolicyModel.findById(customerPolicy.policy_id);
        if (!policy) {
            return res.status(404).json({ success: false, message: "Policy not found." });
        }

        // Check if customer exists
        const customer = await CustomerModel.findById(customerPolicy.customer_id);
        if (!customer) {
            return res.status(404).json({ success: false, message: "Customer not found." });
        }

        // Optional: Prevent duplicate claims on the same customer_policy_id while one is pending
        const existingPending = await ClaimPolicyModel.findOne({
            customer_policy_id,
            status: "Pending"
        });
        if (existingPending) {
            return res.status(400).json({ success: false, message: "A pending claim already exists for this policy." });
        }

        // Create claim
        const claim = await ClaimPolicyModel.create({
            customer_policy_id,
            customer_id: customerPolicy.customer_id,
            policy_id: customerPolicy.policy_id,
            claim_amount,
            reason,
            created_by: req.userId,
        });

        return res.status(201).json({ success: true, message: "Claim submitted successfully.", data: claim });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Server error." });
    }
};

// Get all claim policies with pagination/filter/search
export const getClaimPolicies = async (req: Request, res: Response) => {
    try {
        const page = parseInt((req.query.page as string) || "1", 10);
        const limit = parseInt((req.query.limit as string) || "10", 10);
        const skip = (page - 1) * limit;
        const query: any = {};

        // Search by reason, status, or policy_number
        if (req.query.search) {
            const searchRegex = new RegExp(req.query.search as string, "i");
            query.$or = [{ reason: searchRegex }];
        }

        if (req.query.status) {
            query.status = req.query.status;
        }

        if (req.query.policy_id) {
            query.policy_id = req.query.policy_id;
        }

        if (req.query.customer_id) {
            query.customer_id = req.query.customer_id;
        }

        const [data, total] = await Promise.all([
            ClaimPolicyModel.find(query)
                .populate("customer_id", "name email phone")
                .populate("policy_id", "name type premium")
                .populate("customer_policy_id", "policy_number")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            ClaimPolicyModel.countDocuments(query)
        ]);

        return res.json({
            success: true,
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            data,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Server error." });
    }
};

// Update claim policy (e.g., for admin to approve/reject)
export const updateClaimPolicy = async (req: Request, res: Response) => {
    try {
        const { claim_id } = req.params;
        const { status } = req.body;

        // Validation
        if (!claim_id) {
            return res.status(400).json({ success: false, message: "Claim ID is required." });
        }
        if (!["Pending", "Approved", "Rejected"].includes(status)) {
            return res.status(400).json({ success: false, message: "Invalid status value." });
        }

        const claim = await ClaimPolicyModel.findById(claim_id);
        if (!claim) {
            return res.status(404).json({ success: false, message: "Claim not found." });
        }

        if (claim.status !== "Pending") {
            return res.status(400).json({ success: false, message: "Only pending claims can be updated." });
        }

        claim.status = status as IClaimPolicy["status"];
        await claim.save();

        return res.json({
            success: true,
            message: "Claim updated successfully.",
            data: claim,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Server error." });
    }
};