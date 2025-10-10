import { Types, model, Document, Schema } from "mongoose"


export interface IUser extends Document {
    _id: string;
    name: string;
    email: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;
}

const userSchema = new Schema<IUser>(
    {
        name: { type: String, required: true, trim: true, index: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
        password: { type: String, required: true, minlength: 6, select: false },
    },
    {
        timestamps: true,
    }
);

const UserModel = model<IUser>("User", userSchema);

export default UserModel



