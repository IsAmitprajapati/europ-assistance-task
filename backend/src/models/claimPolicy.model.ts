import { Request, Response } from "express";
import { model, Schema, Document, Types } from "mongoose";
import CustomerPolicy from "./customerPolicy.model";
import CustomerModel from "./customer.model";
import PolicyModel from "./policy.model";

// Claim Policy Mongoose Schema & Model
export interface IClaimPolicy extends Document {
    customer_policy_id: Types.ObjectId; // reference to customer-policy
    customer_id: Types.ObjectId;        // reference to Customer
    policy_id: Types.ObjectId;          // reference to Policy
    claim_amount: number;
    reason: string;
    status: "Pending" | "Approved" | "Rejected";
    created_by?: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const claimPolicySchema = new Schema<IClaimPolicy>(
    {
        customer_policy_id: { type: Schema.Types.ObjectId, ref: "customer-policy", required: true, index: true },
        customer_id: { type: Schema.Types.ObjectId, ref: "Customer", required: true, index: true },
        policy_id: { type: Schema.Types.ObjectId, ref: "Policy", required: true, index: true },
        claim_amount: { type: Number, required: true, min: 0 },
        reason: { type: String, required: true, trim: true },
        status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
        created_by: { type: Schema.Types.ObjectId, ref: "User" },
    },
    {
        timestamps: true,
    }
);

const ClaimPolicyModel = model<IClaimPolicy>("claim-policy", claimPolicySchema);


export default ClaimPolicyModel;
