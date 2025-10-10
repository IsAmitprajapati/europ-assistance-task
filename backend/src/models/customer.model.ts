import { model, Document, Schema, Types } from "mongoose";

export interface ICustomer extends Document {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    age?: number;
    location?: {
        city?: string;
        state?: string;
        country?: string;
    };
    segment?: Types.ObjectId[]; // reference to Segment
    tags?: string[];
    status?: "Active" | "Inactive";
    total_policies?: Types.ObjectId[]; // Array of Policy ObjectIds
    lifetime_value?: number; // total policy premium
    engagement_score?: "High" | "Medium" | "At-Low"; 
    lifecycle_stage?: "Prospect" | "Active" | "At-Risk" | "Churned";
    last_interaction?: Date | null;
    claim_count?: Types.ObjectId[]; // Array of Policy ObjectIds with claims
    payment_behavior?: "On-time" | "Delayed";
    created_by?: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const customerSchema = new Schema<ICustomer>(
    {
        name: { type: String, required: true, trim: true, index: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
        phone: { type: String, trim: true },
        age: { type: Number, min: 0 },
        location: {
            city: { type: String, trim: true },
            state: { type: String, trim: true },
            country: { type: String, trim: true },
        },
        segment: [{ type: Schema.Types.ObjectId, ref: "Segment" }], // reference to Segment collection
        tags: { type: [String], default: [] },
        status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
        total_policies: [{ type: Schema.Types.ObjectId, ref: "ClaimPolicy" }], // array of Policy ObjectIds
        lifetime_value: { type: Number, default: 0 },
        engagement_score: { type: String, enum: ["High", "Medium", "At-Low"], default: "At-Low" },
        lifecycle_stage: { type: String, enum: ["Prospect", "Active", "At-Risk", "Churned"], default: "Active" },
        last_interaction: { type: Date, default: null },
        claim_count: [{ type: Schema.Types.ObjectId, ref: "Policy" }], // array of claimed Policy ObjectIds
        payment_behavior: { type: String, enum: ["On-time", "Delayed"], default: "On-time" },
        created_by: { type: Schema.Types.ObjectId, ref: "User" },
    },
    {
        timestamps: true,
    }
);

const CustomerModel = model<ICustomer>("Customer", customerSchema);

export default CustomerModel;
