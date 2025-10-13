import { model, Document, Schema, Types } from "mongoose";

export interface IPolicy extends Document {
    _id: string;
    customer_id: Types.ObjectId; // reference to Customer
    policy_id : Types.ObjectId;
    policy_number: string;
    status: "Active" | "Expired" | "Cancelled";
    start_date: Date;
    end_date?: Date | null;
    created_by?: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const policySchema = new Schema<IPolicy>(
    {
        customer_id: { type: Schema.Types.ObjectId, ref: "Customer", required: true, index: true },
        policy_id : { type : Schema.Types.ObjectId, ref : 'Policy'},
        policy_number: { type: String, unique: true, trim: true, index: true },
        status: { type: String, enum: ["Active", "Expired", "Cancelled"], default: "Active" },
        start_date: { type: Date, required: true },
        end_date: { type: Date, default : null },
        created_by: { type: Schema.Types.ObjectId, ref: "User" },
    },
    {
        timestamps: true,
    }
);


// 🧩 Pre-save hook to auto-generate `policy_number`
policySchema.pre<IPolicy>("save", async function (next) {
    if (this.policy_number) return next(); // already set
  
    const currentYear = new Date().getFullYear();
  
    // Find the last policy for the current year
    const lastPolicy = await CustomerPolicy
      .findOne({ policy_number: new RegExp(`^POL-${currentYear}-`) })
      .sort({ createdAt: -1 })
      .exec();
  
    let nextNumber = 1;
    if (lastPolicy?.policy_number) {
      const lastNum = parseInt(lastPolicy.policy_number.split("-").pop() || "0", 10);
      nextNumber = lastNum + 1;
    }
    
    //formate POL-2015-001
    this.policy_number = `POL-${currentYear}-${String(nextNumber).padStart(3, "0")}`;
    next();
});


policySchema.virtual("customer", { ref: "Customer", localField: "customer_id", foreignField: "_id", justOne: true });
policySchema.virtual("policy", { ref: "Policy", localField: "policy_id", foreignField: "_id", justOne: true });
policySchema.set("toObject", { virtuals: true });
policySchema.set("toJSON", { virtuals: true });


const CustomerPolicy = model<IPolicy>("customer-policy", policySchema);

export default CustomerPolicy;
