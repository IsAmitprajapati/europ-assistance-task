import { Request, Response } from "express";
import PolicyModel from "../models/policy.model";

export const createPolicy = async(req : Request, res : Response)=>{
    try{
        const userId = req.userId
        const { name, type , premium } = req.body

        if(!name || !type || !premium){
            return res.status(400).json({
                message : "provide required fields"
            })
        }

        const alreadyNameExits = await PolicyModel.findOne({ name })

        if(alreadyNameExits){
            return res.status(400).json({
                message : "Already policy name exits",
                success : false
            })
        }

        const data = await PolicyModel.create({
            name,
            type,
            premium,
            created_by : userId
        })

        return res.status(201).json({
            message : "Policy created successfully",
            success : true,
            data : data  
        })
    }catch{
        return res.status(500).json({
            message : "Failed to create policy",
            success : false
        })
    }
}

export const updatePolicy = async (req: Request, res: Response) => {
    try {
        const { policy_id } = req.params;
        const { name, type, premium } = req.body;

        // Check if another policy with the same name exists (exclude current policy)
        if (name) {
            const alreadyNameExits = await PolicyModel.findOne({ name, _id: { $ne: policy_id } });
            if (alreadyNameExits) {
                return res.status(400).json({
                    message: "Already policy name exists",
                    success: false
                });
            }
        }

        // Find the policy to ensure it exists
        const existingPolicy = await PolicyModel.findById(policy_id);
        if (!existingPolicy) {
            return res.status(404).json({
                message: "Policy not found",
                success: false
            });
        }

        // Update the policy
        existingPolicy.name = name ?? existingPolicy.name;
        existingPolicy.type = type ?? existingPolicy.type;
        existingPolicy.premium = premium ?? existingPolicy.premium;

        await existingPolicy.save();

        return res.status(200).json({
            message: "Policy updated successfully",
            success: true,
            data: existingPolicy
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to update policy",
            success: false
        });
    }
}

export const getPolicylist = async(req : Request, res : Response)=>{
    try {
        const page = parseInt((req.query.page as string) || "1");
        const limit = parseInt((req.query.limit as string) || "10");
        const skip = (page - 1) * limit;

        // Build filter object
        const query: any = {};

        // Search by name/email/phone
        if (req.query.search) {
            const searchRegex = new RegExp(req.query.search as string, "i");
            query.$or = [
                { name: searchRegex },
            ];
        }

        const [data,totalCount] = await Promise.all([
            PolicyModel.find(query).skip(skip).limit(limit).sort({ createdAt : -1 }),
            PolicyModel.countDocuments(query)
        ])

        return res.status(200).json({
            message : "Success",
            success : true,
            data,
            page,
            limit,
            total : totalCount,
            totalPages: Math.ceil(totalCount / limit),
        })
    } catch (error) {
        return res.status(500).json({
            message : "Failed to fetch",
            success : true
        })
    }
}

