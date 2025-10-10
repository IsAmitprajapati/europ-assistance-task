import { Request, Response } from "express";
import UserModel from "../models/user.model";
import { createUserSchema } from "../validations/user.zod";
import bcrypt from "bcryptjs"; // for password hashing
import jwt from 'jsonwebtoken'
import { env } from "../config/env";


export const registerUser = async (request: Request, response: Response) => {
    try {

        // Validate request body
        const parsed = createUserSchema.safeParse(request.body);
        if (!parsed.success) {
            return response.status(400).json({
                success: false,
                message: "Validation failed",
                errors: parsed.error.format(),
            });
        }

        const { name, email, password } = parsed.data;

        // Check if user already exists
        const existingUser = await UserModel.findOne({ email });
        if (existingUser) {
            return response.status(409).json({
                success: false,
                message: "User with this email already exists",
            });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = await UserModel.create({
            name,
            email,
            password: hashedPassword,
        });

        return response.status(201).json({
            success: true,
            message: "User registered successfully",
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
            },
        });

    } catch (error: any) {
        console.error("Register User Error:", error);
        return response.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};


export const loginUser = async (request: Request, response: Response) => {
    try {
        const { email, password } = request.body;

        if (!email || !password) {
            return response.status(400).json({
                success: false,
                message: "Email and password are required",
            });
        }

        // Find user by email
        const user = await UserModel.findOne({ email }).select("+password");;
        if (!user) {
            return response.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        // Compare password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return response.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        const tokenData = {
            id: user._id, 
            email: user.email
        }

        // Generate JWT token
        const token = jwt.sign(tokenData,env.JWT_SECRET,{ expiresIn: '1d' });


         // Set cookies
        response.cookie("accessToken", token, {
            httpOnly: true,
            secure: env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 24 * 60 * 60 * 1000, // 1 day
        });

        return response.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
        });

    } catch (error: any) {
        console.error("Login Error:", error);
        return response.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};
