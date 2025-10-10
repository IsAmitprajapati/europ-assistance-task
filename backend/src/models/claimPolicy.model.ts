import { model, Document, Schema, Types } from "mongoose";

export interface IClaimPolicy extends Document {
    customer: Types.ObjectId;             // Reference to Customer
    policies: Types.ObjectId[];           // Array of Policy ObjectIds claimed
    claim_date: Date;                      // Date when claim was made
    status?: "Pending" | "Approved" | "Rejected"; // Claim status
    created_by?: Types.ObjectId;          // User who created the claim (optional)
    createdAt: Date;
    updatedAt: Date;
}

const claimPolicySchema = new Schema<IClaimPolicy>(
    {
        customer: { type: Schema.Types.ObjectId, ref: "Customer", required: true },
        policies: [{ type: Schema.Types.ObjectId, ref: "Policy", required: true }],
        claim_date: { type: Date, default: Date.now },
        status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
        created_by: { type: Schema.Types.ObjectId, ref: "User" },
    },
    {
        timestamps: true,
    }
);

const ClaimPolicyModel = model<IClaimPolicy>("ClaimPolicy", claimPolicySchema);

export default ClaimPolicyModel;
