import { Request, Response } from "express";
import SegmentModel from "../models/segment.mode";
import CustomerModel from "../models/customer.model";

// Create a new segment
export const createSegment = async (req: Request, res: Response) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ success: false, message: "Segment name is required" });
        }
        
        // Check if segment already exists
        const existing = await SegmentModel.findOne({ name });
        if (existing) {
            return res.status(409).json({ success: false, message: "Segment already exists" });
        }

        // Create segment
        const segment = await SegmentModel.create({
            name,
            customers: [],
            created_by: req?.userId, // assuming req.user from auth middleware
        });

        return res.status(201).json({ success: true, segment });
    } catch (error: any) {
        console.error("Create Segment Error:", error);
        return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
};

// Get all segments with pagination
export const getAllSegments = async (req: Request, res: Response) => {
    try {
        // Parse query parameters
        const page = parseInt(req.query.page as string) || 1;  // default page 1
        const limit = parseInt(req.query.limit as string) || 10; // default 10 items per page
        const skip = (page - 1) * limit;
        
        //for search 
        const search = req?.query?.search as string;
        const searchRegex = new RegExp(search, "i");
                    
        const query = {
            name : searchRegex
        }

        const [segments, total] = await Promise.all([
            //data (.populate("customers", "name email segment")) for all the user name and password
            SegmentModel.find(query)
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 }),

            //total
            SegmentModel.countDocuments()
        ])

        return res.status(200).json({
            success: true,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            totalItems: total,
            data : segments,
        });
    } catch (error: any) {
        console.error("Get All Segments Error:", error);
        return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
};


// // Update a segment (add/remove customers)
export const updateSegment = async (req: Request, res: Response) => {
    try {
        const { segmentId } = req.params;
        const { name, } = req.body;

        const segment = await SegmentModel.findById(segmentId);
        if (!segment) {
            return res.status(404).json({ success: false, message: "Segment not found" });
        }

        if (name) {
            const existingSegment = await SegmentModel.findOne({ name });
            if (existingSegment && existingSegment._id.toString() !== segmentId) {
                return res.status(400).json({ 
                    success: false, 
                    message: "Segment name already exists" 
                });
            }
            segment.name = name;
        }
 
        await segment.save();

        return res.status(200).json({ success: true, segment });
    } catch (error: any) {
        console.error("Update Segment Error:", error);
        return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
};


// Get customers in a segment (with pagination and search by customer name/email)
export const getSegmentCustomers = async (req: Request, res: Response) => {
    try {
        const { segmentId } = req.params;
        const { page = 1, limit = 10, search = "" } = req.query;

        // Find the segment and only get the customer ObjectIds array
        const segment = await SegmentModel.findById(segmentId).select("customers");
        if (!segment) {
            return res.status(404).json({ success: false, message: "Segment not found" });
        }

        // Build search filter for customer
        let customerFilter: any = {
            _id: { $in: segment.customers }
        };

        if (search && typeof search === "string") {
            customerFilter.$or = [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } }
            ];
        }

        // Pagination variables
        const pageNumber = parseInt(page as string, 10) || 1;
        const pageSize = parseInt(limit as string, 10) || 10;
        const skip = (pageNumber - 1) * pageSize;

        const [customers, total] = await Promise.all([
            CustomerModel.find(customerFilter)
                .select("name email segment")
                .skip(skip)
                .limit(pageSize)
                .lean(),
            CustomerModel.countDocuments(customerFilter)
        ]);

        return res.status(200).json({
            success: true,
            data : customers,
            page: pageNumber,
            limit: pageSize,
            totalItems: total,
            totalPages: Math.ceil(total / pageSize)
        });
    } catch (error: any) {
        console.error("Get Segment Customers Error:", error);
        return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
};

