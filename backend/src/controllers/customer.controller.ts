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
      payment_behavior = null,
    } = req.body;

    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: "Name and email are required",
      });
    }

    // Check if email already exists
    const existingCustomerByEmail = await CustomerModel.findOne({ email });
    if (existingCustomerByEmail) {
      return res.status(400).json({
        success: false,
        message: "Customer with this email already exists",
      });
    }

    // Check if phone already exists (if phone is provided)
    if (phone) {
      const existingCustomerByPhone = await CustomerModel.findOne({ phone });
      if (existingCustomerByPhone) {
        return res.status(400).json({
          success: false,
          message: "Customer with this phone number already exists",
        });
      }
    }

    // checking the segment id provided is correct or not that validate
    let validSegmentIds: string[] = [];
    if (segmentIds.length > 0) {
      const segments = await SegmentModel.find({ _id: { $in: segmentIds } });
      validSegmentIds = segments.map((seg) => seg._id.toString());
    }

    // Create new customer
    let customer;
    try {
      customer = await CustomerModel.create({
        name,
        email,
        phone,
        age,
        location,
        segment: validSegmentIds,
        tags,
        total_policies: [],
        lifetime_value: 0,
        engagement_score,
        lifecycle_stage,
        last_interaction: null,
        claim_count: [],
        payment_behavior: payment_behavior,
        created_by: req.userId || null,
      });
    } catch (dbError: any) {
      // Handle unique constraint errors for email and phone
      if (dbError.code === 11000 && dbError.keyPattern) {
        const duplicateField = Object.keys(dbError.keyPattern)[0];
        const duplicateMsg =
          duplicateField === "email"
            ? "Customer with this email already exists"
            : duplicateField === "phone"
              ? "Customer with this phone number already exists"
              : "Duplicate key error";

        return res.status(400).json({
          success: false,
          message: duplicateMsg,
        });

      }
      throw dbError;
    }

    // Add customer to segments
    if (validSegmentIds.length > 0) {
      await SegmentModel.updateMany(
        { _id: { $in: validSegmentIds } },
        { $addToSet: { customers: customer._id } } // addToSet avoids duplicates
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

export const updateCustomer = async (req: Request, res: Response) => {
  try {
    const { customerId } = req.params;
    const {
      name,
      email,
      phone,
      age,
      location,
      segmentIds,
      tags,
      engagement_score,
      status,
      lifecycle_stage,
      last_interaction,
      payment_behavior,
    } = req.body;

    // Check if the customer exists
    const existingCustomer = await CustomerModel.findById(customerId);
    if (!existingCustomer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    //while updating email 
    if (email !== existingCustomer.email) {
      // Check if email already exists
      const existingCustomerByEmail = await CustomerModel.findOne({ email });

      if (existingCustomerByEmail) {
        return res.status(400).json({
          success: false,
          message: "Customer with this email already exists",
        });
      }
    }

    //while updating phone
    if (phone !== existingCustomer.phone) {
      const existingCustomerByPhone = await CustomerModel.findOne({ phone });
      if (existingCustomerByPhone) {
        return res.status(400).json({
          success: false,
          message: "Customer with this phone number already exists",
        });
      }
    }


    // Build update data object
    let updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (age !== undefined) updateData.age = age;
    if (location !== undefined) updateData.location = location;
    if (tags !== undefined) updateData.tags = tags;
    if (engagement_score !== undefined) updateData.engagement_score = engagement_score;
    if (lifecycle_stage !== undefined) updateData.lifecycle_stage = lifecycle_stage;
    if (last_interaction !== undefined) updateData.last_interaction = last_interaction;
    if (payment_behavior !== undefined) updateData.payment_behavior = payment_behavior;
    if (status !== undefined) updateData.status = status;

    // Handle segments update in the segment collection also 
    //add the customer id in that also
    if (segmentIds && Array.isArray(segmentIds)) {
      // Update customer's segment field
      updateData.segment = segmentIds;

      // Add customer to new segments
      await SegmentModel.updateMany(
        { _id: { $in: segmentIds } },
        { $addToSet: { customers: existingCustomer._id } }
      );

      // Ensure segment is defined
      const existingSegments = existingCustomer.segment || [];

      // Remove customer from segments no longer assigned
      const removedSegments = existingSegments
        .map((segId: any) => segId.toString()) // convert ObjectId to string
        .filter((segId: string) => !segmentIds.includes(segId));

      if (removedSegments.length > 0) {
        await SegmentModel.updateMany(
          { _id: { $in: removedSegments } },
          { $pull: { customers: existingCustomer._id } }
        );
      }

    }

    
    let updatedCustomer;
    updatedCustomer = await CustomerModel.findByIdAndUpdate(
      customerId,
      { $set: updateData },
      { new: true, runValidators: true }
    );


    // If for some reason the update failed to find the customer (shouldn't happen), handle it
    if (!updatedCustomer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found after update",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Customer updated successfully",
      customer: updatedCustomer,
    });

  } catch (error: any) {
    console.error("Update Customer Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getCustomerList = async (req: Request, res: Response) => {
  try {
    // Pagination
    const page = parseInt((req.query.page as string) || "1");
    const limit = parseInt((req.query.limit as string) || "10");
    const skip = (page - 1) * limit;

    // Build filter object
    const filter: any = {};

    // Search by name/email/phone
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search as string, "i");
      filter.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
      ];
    }

    // Location filter — supports nested query like ?location[city]=Delhi&location[state]=Delhi
    if (req.query.location && typeof req.query.location === "object") {
      const location = req.query.location as Record<string, string>;
      for (const [key, value] of Object.entries(location)) {
        if (value) {
          filter[`location.${key}`] = { $regex: value, $options: "i" };
        }
      }
    }

    // Age range filter
    if (req.query.age_min || req.query.age_max) {
      filter.age = {};
      if (req.query.age_min) filter.age.$gte = Number(req.query.age_min);
      if (req.query.age_max) filter.age.$lte = Number(req.query.age_max);
    }

    // // Premium range filter
    // if (req.query.premium_min || req.query.premium_max) {
    //   filter.lifetime_value = {};
    //   if (req.query.premium_min) filter.lifetime_value.$gte = Number(req.query.premium_min);
    //   if (req.query.premium_max) filter.lifetime_value.$lte = Number(req.query.premium_max);
    // }

    // Tags filter (OR logic)
    if (req.query.tags) {
      let tagsArr: string[] = [];

      const tags = req.query.tags;

      if (Array.isArray(tags)) {
        // Handles ?tags[]=VIP&tags[]=Gold or multiple ?tags=VIP&tags=Gold
        tagsArr = tags
          .map((t) => (typeof t === "string" ? t.trim() : ""))
          .filter(Boolean);
      } else if (typeof tags === "string") {
        // Handles ?tags=VIP,Gold
        tagsArr = tags.split(",").map((t) => t.trim());
      }

      if (tagsArr.length > 0) {
        // OR logic using $in
        filter.tags = { $in: tagsArr };
      }
    }

    //Lifecycle stage
    if (req.query.lifecycle_stage) {
      filter.lifecycle_stage = req.query.lifecycle_stage;
    }

    // // Number of policies filter (array length)
    // if (req.query.policies_min || req.query.policies_max) {
    //   const min = req.query.policies_min ? Number(req.query.policies_min) : undefined;
    //   const max = req.query.policies_max ? Number(req.query.policies_max) : undefined;

    //   if (min !== undefined && max !== undefined) {
    //     filter.$expr = {
    //       $and: [
    //         { $gte: [{ $size: "$total_policies" }, min] },
    //         { $lte: [{ $size: "$total_policies" }, max] },
    //       ],
    //     };
    //   } else if (min !== undefined) {
    //     filter.$expr = { $gte: [{ $size: "$total_policies" }, min] };
    //   } else if (max !== undefined) {
    //     filter.$expr = { $lte: [{ $size: "$total_policies" }, max] };
    //   }
    // }

    // 💳 Payment behavior
    if (req.query.payment_behavior) {
      filter.payment_behavior = req.query.payment_behavior;
    }

    // ⭐ Engagement score
    if (req.query.engagement_score) {
      filter.engagement_score = req.query.engagement_score;
    }


    // 🚀 Query the data
    const query = CustomerModel.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }).populate('segment',"name");

    //promise
    const [customers, total] = await Promise.all([
      query.exec(),
      CustomerModel.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data : customers,
    });
  } catch (error: any) {
    console.error("Get Customer List Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

