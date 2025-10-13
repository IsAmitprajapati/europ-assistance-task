import { model, Document, Schema, Types } from "mongoose";

export interface IPolicy extends Document {
    _id: string;
    name : string;
    type: string;
    premium: number;
    created_by?: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const policySchema = new Schema<IPolicy>(
    {
        name : { type : String, required: true, unique : true, trim : true },
        type: { type: String, required: true , index : true },
        premium: { type: Number, required: true, min: 0, index : true },
        created_by: { type: Schema.Types.ObjectId, ref: "User" },
    },
    {
        timestamps: true,
    }
);


const PolicyModel = model<IPolicy>("Policy", policySchema);

export default PolicyModel;
