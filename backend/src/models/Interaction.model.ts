import { model, Document, Schema, Types } from "mongoose";

export interface IInteraction extends Document {
    _id: string;
    customer_id: Types.ObjectId;        // Reference to Customer
    type: "Call" | "Email" | "Meeting";  // Interaction type
    remark : string;
    created_by?: Types.ObjectId;        // User who logged the interaction
    createdAt: Date;
    updatedAt: Date;
}

const interactionSchema = new Schema<IInteraction>(
    {
        customer_id: { type: Schema.Types.ObjectId, ref: "Customer", required: true, index: true },
        type: { type: String, enum: ["Call", "Email", "Meeting",], required: true },
        remark: { type: String, trim: true },
        created_by: { type: Schema.Types.ObjectId, ref: "User" },
    },
    {
        timestamps: true,
    }
);

const InteractionModel = model<IInteraction>("Interaction", interactionSchema);

export default InteractionModel;
