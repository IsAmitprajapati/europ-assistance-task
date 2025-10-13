import { Request, Response } from "express";
import InteractionModel from "../models/Interaction.model";

// Create a new interaction (remark) for a customer
export const createInteraction = async(req : Request, res : Response)=>{
    try {
        const userId = req.userId
        const { customer_id, type, remark } = req.body;

        // Validate required fields
        if(!customer_id || !type || !remark){
            return res.status(400).json({
                message : "provide the required field",
                success : true
            })
        }

        const createData = await InteractionModel.create({
            customer_id,
            type,
            remark,
            created_by : userId
        })

        return res.status(201).json({
            message : "Remark added successfully",
            data : createData,
            success : true
        })

    } catch (error) {
        return res.status(500).json({
            message : "Something went wrong",
            success : false
        })
    }
}

export const getInteractionList = async(req : Request, res : Response)=>{
    try {
        const { customer_id } = req.params
        // Pagination
        const page = parseInt((req.query.page as string) || "1");
        const limit = parseInt((req.query.limit as string) || "10");
        const skip = (page - 1) * limit;

        const query = {
            customer_id,
        }

        const [data, total] = await Promise.all([
            InteractionModel.find(query).skip(skip).limit(limit).sort({
                createdAt: -1 
            }),
            InteractionModel.countDocuments(query)
        ])

        return res.status(200).json({
            message : "success",
            data,
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        })

    } catch (error) {
        return res.status(500).json({
            message : "Failed to get data",
            success : false
        })
    }
}