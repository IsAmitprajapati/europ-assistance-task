import { model, Document, Schema, Types } from "mongoose";


const defaultSegments = ["Platinum", "Gold", "Silver", "Bronze"];


export interface ISegment extends Document {
    _id: string;
    name: string;                     
    customers: Types.ObjectId[];     
    created_by: Types.ObjectId; 
    createdAt: Date;
    updatedAt: Date;
}

const segmentSchema = new Schema<ISegment>(
    {
        name: { type: String, required: true, trim: true, unique: true },
        customers: [{ type: Schema.Types.ObjectId, ref: "Customer" }],
        created_by: { type: Schema.Types.ObjectId, ref: "User" },
    },
    {
        timestamps: true,
    }
);

const SegmentModel = model<ISegment>("Segment", segmentSchema);

export default SegmentModel;
