import { model, Document, Schema, Types } from "mongoose";

export interface IPolicy extends Document {
    _id: string;
    customer_id: Types.ObjectId; // reference to Customer
    policy_number: string;
    type: "Vehicle" | "Travel" | "Concierge";
    status: "Active" | "Expired" | "Cancelled";
    premium: number;
    start_date: Date;
    end_date: Date;
    created_by?: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const policySchema = new Schema<IPolicy>(
    {
        customer_id: { type: Schema.Types.ObjectId, ref: "Customer", required: true, index: true },
        policy_number: { type: String, required: true, unique: true, trim: true, index: true },
        type: { type: String, enum: ["Vehicle", "Travel", "Concierge"], required: true },
        status: { type: String, enum: ["Active", "Expired", "Cancelled"], default: "Active" },
        premium: { type: Number, required: true, min: 0 },
        start_date: { type: Date, required: true },
        end_date: { type: Date, required: true },
        created_by: { type: Schema.Types.ObjectId, ref: "User" },
    },
    {
        timestamps: true,
    }
);

// Auto-generate policy_number before saving
policySchema.pre("save", async function (next) {
    if (!this.policy_number) {
        const year = new Date().getFullYear();
        const Policy = model<IPolicy>("Policy", policySchema);

        // Count how many policies exist for this year
        const count = await Policy.countDocuments({
            policy_number: { $regex: `^POL-${year}-` },
        });

        // Generate policy number with leading zeros (001, 002, etc.)
        const sequence = String(count + 1).padStart(3, "0");
        this.policy_number = `POL-${year}-${sequence}`;
    }
    next();
});

const PolicyModel = model<IPolicy>("Policy", policySchema);

export default PolicyModel;
