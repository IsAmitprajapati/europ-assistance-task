import { Request,Response } from "express";
import CustomerPolicy from "../models/customerPolicy.model";
import CustomerModel from "../models/customer.model";
import PolicyModel from "../models/policy.model";

export const createCustomerPolicy = async(req : Request, res : Response) =>{
    try {
        const { customer_id,policy_id} = req.body

        if(!customer_id || !policy_id ){
            return res.status(400).json({
                message : "provided the required fields"
            })
        }

        const payload = {
            created_by : req.userId,
            customer_id,
            policy_id,
            start_date : new Date().toISOString(),
        }

        const create = await CustomerPolicy.create(payload)

        return res.status(200).json({
            message : "Policy created successfully",
            data : create,
            success : true
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message : "Something went wrong"
        })
    }
}

export async function getCustomerPolicies(req : Request, res : Response) {
    try {
      // 📄 Pagination
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;
  
      // 🧠 Build base query
      const query: any = {};
  
      // 🔍 Search by name or policy_number
      if (req.query.search) {
        const search = req.query.search as string;
        const searchRegex = new RegExp(search, "i");
  
        // Find matching customers and policies
        const [customers, policies] = await Promise.all([
          CustomerModel.find({ name: searchRegex }, "_id"),
          PolicyModel.find({ name: searchRegex }, "_id"),
        ]);
  
        const customerIds = customers.map((c) => c._id);
        const policyIds = policies.map((p) => p._id);
  
        query.$or = [
          { customer_id: { $in: customerIds } },
          { policy_id: { $in: policyIds } },
          { policy_number: searchRegex },
        ];
      }
  
      // 🧾 Fetch paginated results
      const [data, total] = await Promise.all([
        CustomerPolicy.find(query)
          .populate("customer", "name email phone")
          .populate("policy", "name type premium")
          .skip(skip)
          .limit(limit)
          .sort({ createdAt: -1 }),
        CustomerPolicy.countDocuments(query),
      ]);
  
      return res.json({
        success: true,
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        data,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: "Server error" });
    }
}