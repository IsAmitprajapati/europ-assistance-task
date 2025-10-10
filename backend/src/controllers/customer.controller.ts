import { Request, Response } from "express";
import CustomerModel from "../models/customer.model";
import SegmentModel from "../models/segment.mode";

export const createCustomer = async (req: Request, res: Response) => {
  try {
    const {
      name,
      email,
      phone,
      age,
      location,
      segmentIds = [],
      tags = [],
      engagement_score = "At-Low",
      lifecycle_stage = "Prospect",
    //   last_interaction = null,
    //   payment_behavior = null,
    } = req.body;

    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: "Name and email are required",
      });
    }

    // Check if email already exists
    const existingCustomer = await CustomerModel.findOne({ email });
    if (existingCustomer) {
      return res.status(400).json({
        success: false,
        message: "Customer with this email already exists",
      });
    }

    // Validate segment IDs
    let validSegmentIds: string[] = [];
    if (segmentIds.length > 0) {
      const segments = await SegmentModel.find({ _id: { $in: segmentIds } });
      validSegmentIds = segments.map((seg) => seg._id.toString());
    }

    // Create new customer
    const customer = await CustomerModel.create({
      name,
      email,
      phone,
      age,
      location,
      segment: validSegmentIds,
      tags,
      total_policies: [], // default empty array
      lifetime_value: 0,  // default 0
      engagement_score,
      lifecycle_stage,
      last_interaction : null,
      claim_count: [],     // default empty array
      payment_behavior : null,
      created_by: req.userId || null,
    });

    // Add customer to Segment documents
    if (validSegmentIds.length > 0) {
      await SegmentModel.updateMany(
        { _id: { $in: validSegmentIds } },
        { $addToSet: { customers: customer._id } }
      );
    }

    return res.status(201).json({ success: true, customer });
  } catch (error: any) {
    console.error("Create Customer Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};


// export const updateCustomer = async (req: Request, res: Response) => {
//   try {
//     const { customerId } = req.params;
//     const {
//         name,
//         email,
//         phone,
//         age,
//         location,
//         segmentIds = [],
//         tags = [],
//         engagement_score,
//         lifecycle_stage,
//         last_interaction,
//         payment_behavior,
//     } = req.body;

//     // Check if the customer exists
//     const existingCustomer = await CustomerModel.findById(customerId);
//     if (!existingCustomer) {
//       return res.status(404).json({
//         success: false,
//         message: "Customer not found",
//       });
//     }

//     // If segmentIds are included, validate them
//     if (updateData.segmentIds && Array.isArray(updateData.segmentIds)) {
//       const segments = await SegmentModel.find({
//         _id: { $in: updateData.segmentIds },
//       });
//       updateData.segment = segments.map((seg) => seg._id.toString());
//       delete updateData.segmentIds;
//     }

//     const updatedCustomer = await CustomerModel.findByIdAndUpdate(
//       customerId,
//       { $set: updateData },
//       { new: true, runValidators: true }
//     );

//     return res.status(200).json({
//       success: true,
//       message: "Customer updated successfully",
//       customer: updatedCustomer,
//     });
//   } catch (error: any) {
//     console.error("Update Customer Error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error",
//       error: error.message,
//     });
//   }
// };
