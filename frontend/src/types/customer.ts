export interface ICustomer {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    age?: number;
    location?: {
        city?: string;
        state?: string;
        country?: string;
    }
    segment?: string[]; 
    tags?: string[];
    status?: "Active" | "Inactive";
    total_policies?: string[]; 
    lifetime_value?: number; 
    engagement_score?: "High" | "Medium" | "At-Low"; 
    lifecycle_stage?: "Prospect" | "Active" | "At-Risk" | "Churned";
    last_interaction?: Date | null;
    claim_count?: string[]; 
    payment_behavior?: "On-time" | "Delayed";
    created_by?: string;
    createdAt: Date;
    updatedAt: Date;
}