import { Types } from "mongoose";

// Define filter interfaces for type safety
export interface CustomerFilters {
  search?: string;
  location?: {
    city?: string;
    state?: string;
    country?: string;
  };
  age?: {
    min?: number;
    max?: number;
  };
  policyType?: string;
  premium?: {
    min?: number;
    max?: number;
  };
  tags?: string[];
  lifecycleStage?: string;
  policiesCount?: {
    min?: number;
    max?: number;
  };
  paymentBehavior?: string;
  engagementScore?: string;
  segmentIds?: string[];
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  skip?: number;
}

export interface SortOptions {
  field?: string;
  order?: 'asc' | 'desc';
}

/**
 * Builds MongoDB filter object from query parameters
 */
export class FilterBuilder {
  private filter: any = {};

  /**
   * Add search filter (searches in name, email, phone)
   */
  addSearch(searchTerm?: string): this {
    if (searchTerm && searchTerm.trim()) {
      const searchRegex = new RegExp(searchTerm.trim(), "i");
      this.filter.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { phone: searchRegex }
      ];
    }
    return this;
  }

  /**
   * Add location filters
   */
  addLocationFilters(location?: { city?: string; state?: string; country?: string }): this {
    if (!location) return this;

    if (location.city) {
      this.filter["location.city"] = { $regex: location.city, $options: "i" };
    }
    if (location.state) {
      this.filter["location.state"] = { $regex: location.state, $options: "i" };
    }
    if (location.country) {
      this.filter["location.country"] = { $regex: location.country, $options: "i" };
    }
    return this;
  }

  /**
   * Add age range filter
   */
  addAgeFilter(ageRange?: { min?: number; max?: number }): this {
    if (!ageRange || (!ageRange.min && !ageRange.max)) return this;

    this.filter.age = {};
    if (ageRange.min !== undefined) {
      this.filter.age.$gte = ageRange.min;
    }
    if (ageRange.max !== undefined) {
      this.filter.age.$lte = ageRange.max;
    }
    return this;
  }

  /**
   * Add policy type filter
   */
  addPolicyTypeFilter(policyType?: string): this {
    if (policyType) {
      this.filter.total_policies = { $elemMatch: { $eq: policyType } };
    }
    return this;
  }

  /**
   * Add premium (lifetime_value) range filter
   */
  addPremiumFilter(premiumRange?: { min?: number; max?: number }): this {
    if (!premiumRange || (!premiumRange.min && !premiumRange.max)) return this;

    this.filter.lifetime_value = {};
    if (premiumRange.min !== undefined) {
      this.filter.lifetime_value.$gte = premiumRange.min;
    }
    if (premiumRange.max !== undefined) {
      this.filter.lifetime_value.$lte = premiumRange.max;
    }
    return this;
  }

  /**
   * Add tags filter
   */
  addTagsFilter(tags?: string[]): this {
    if (tags && tags.length > 0) {
      this.filter.tags = { $all: tags };
    }
    return this;
  }

  /**
   * Add lifecycle stage filter
   */
  addLifecycleStageFilter(lifecycleStage?: string): this {
    if (lifecycleStage) {
      this.filter.lifecycle_stage = lifecycleStage;
    }
    return this;
  }

  /**
   * Add policies count filter
   */
  addPoliciesCountFilter(policiesCount?: { min?: number; max?: number }): this {
    if (!policiesCount || (!policiesCount.min && !policiesCount.max)) return this;

    const conditions = [];
    if (policiesCount.min !== undefined) {
      conditions.push({ $gte: [{ $size: "$total_policies" }, policiesCount.min] });
    }
    if (policiesCount.max !== undefined) {
      conditions.push({ $lte: [{ $size: "$total_policies" }, policiesCount.max] });
    }

    if (conditions.length > 0) {
      this.filter.$expr = conditions.length === 1 ? conditions[0] : { $and: conditions };
    }
    return this;
  }

  /**
   * Add payment behavior filter
   */
  addPaymentBehaviorFilter(paymentBehavior?: string): this {
    if (paymentBehavior) {
      this.filter.payment_behavior = paymentBehavior;
    }
    return this;
  }

  /**
   * Add engagement score filter
   */
  addEngagementScoreFilter(engagementScore?: string): this {
    if (engagementScore) {
      this.filter.engagement_score = engagementScore;
    }
    return this;
  }

  /**
   * Add segment IDs filter
   */
  addSegmentFilter(segmentIds?: string[]): this {
    if (segmentIds && segmentIds.length > 0) {
      // Convert string IDs to ObjectIds for proper matching
      const objectIds = segmentIds
        .filter(id => Types.ObjectId.isValid(id))
        .map(id => new Types.ObjectId(id));
      
      if (objectIds.length > 0) {
        this.filter.segment = { $in: objectIds };
      }
    }
    return this;
  }

  /**
   * Add status filter
   */
  addStatusFilter(status?: string): this {
    if (status) {
      this.filter.status = status;
    }
    return this;
  }

  /**
   * Add date range filter for creation/update dates
   */
  addDateRangeFilter(dateRange?: {
    createdAfter?: Date;
    createdBefore?: Date;
    updatedAfter?: Date;
    updatedBefore?: Date;
  }): this {
    if (!dateRange) return this;

    if (dateRange.createdAfter || dateRange.createdBefore) {
      this.filter.createdAt = {};
      if (dateRange.createdAfter) {
        this.filter.createdAt.$gte = dateRange.createdAfter;
      }
      if (dateRange.createdBefore) {
        this.filter.createdAt.$lte = dateRange.createdBefore;
      }
    }

    if (dateRange.updatedAfter || dateRange.updatedBefore) {
      this.filter.updatedAt = {};
      if (dateRange.updatedAfter) {
        this.filter.updatedAt.$gte = dateRange.updatedAfter;
      }
      if (dateRange.updatedBefore) {
        this.filter.updatedAt.$lte = dateRange.updatedBefore;
      }
    }
    return this;
  }

  /**
   * Get the final filter object
   */
  build(): any {
    return this.filter;
  }

  /**
   * Reset the filter builder
   */
  reset(): this {
    this.filter = {};
    return this;
  }
}

/**
 * Parse query parameters into typed filter options
 */
export function parseQueryFilters(query: any): CustomerFilters {
  const filters: CustomerFilters = {};

  // Search
  if (query.search) {
    filters.search = query.search as string;
  }

  // Location
  if (query.location_city || query.location_state || query.location_country) {
    filters.location = {};
    if (query.location_city) filters.location.city = query.location_city as string;
    if (query.location_state) filters.location.state = query.location_state as string;
    if (query.location_country) filters.location.country = query.location_country as string;
  }

  // Age range
  if (query.age_min || query.age_max) {
    filters.age = {};
    if (query.age_min) filters.age.min = Number(query.age_min);
    if (query.age_max) filters.age.max = Number(query.age_max);
  }

  // Policy type
  if (query.policy_type) {
    filters.policyType = query.policy_type as string;
  }

  // Premium range
  if (query.premium_min || query.premium_max) {
    filters.premium = {};
    if (query.premium_min) filters.premium.min = Number(query.premium_min);
    if (query.premium_max) filters.premium.max = Number(query.premium_max);
  }

  // Tags
  if (query.tags) {
    let tagsArr: string[] = [];
    if (Array.isArray(query.tags)) {
      tagsArr = (query.tags as Array<string | object>)
        .map(t => typeof t === 'string' ? t : '')
        .filter(t => t !== '');
    } else if (typeof query.tags === 'string') {
      tagsArr = query.tags.split(',').map(t => t.trim());
    }
    if (tagsArr.length > 0) {
      filters.tags = tagsArr;
    }
  }

  // Lifecycle stage
  if (query.lifecycle_stage) {
    filters.lifecycleStage = query.lifecycle_stage as string;
  }

  // Policies count
  if (query.policies_min || query.policies_max) {
    filters.policiesCount = {};
    if (query.policies_min) filters.policiesCount.min = Number(query.policies_min);
    if (query.policies_max) filters.policiesCount.max = Number(query.policies_max);
  }

  // Payment behavior
  if (query.payment_behavior) {
    filters.paymentBehavior = query.payment_behavior as string;
  }

  // Engagement score
  if (query.engagement_score) {
    filters.engagementScore = query.engagement_score as string;
  }

  // Segment IDs
  if (query.segment_ids) {
    let segmentIds: string[] = [];
    if (Array.isArray(query.segment_ids)) {
      segmentIds = (query.segment_ids as Array<string | object>)
        .map(s => typeof s === 'string' ? s : '')
        .filter(s => s !== '');
    } else if (typeof query.segment_ids === 'string') {
      segmentIds = query.segment_ids.split(',').map(s => s.trim());
    }
    if (segmentIds.length > 0) {
      filters.segmentIds = segmentIds;
    }
  }

  return filters;
}

/**
 * Parse pagination options from query parameters
 */
export function parsePaginationOptions(query: any): PaginationOptions {
  const page = parseInt((query.page as string) || "1", 10);
  const limit = parseInt((query.limit as string) || "10", 10);
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

/**
 * Parse sort options from query parameters
 */
export function parseSortOptions(query: any): SortOptions {
  const sortField = (query.sort_field as string) || 'createdAt';
  const sortOrder = (query.sort_order as string) || 'desc';

  return {
    field: sortField,
    order: sortOrder === 'asc' ? 'asc' : 'desc'
  };
}

/**
 * Validate filter parameters and return validation errors
 */
export function validateFilters(filters: CustomerFilters): string[] {
  const errors: string[] = [];

  // Validate age range
  if (filters.age) {
    if (filters.age.min !== undefined && (filters.age.min < 0 || filters.age.min > 150)) {
      errors.push('Age minimum must be between 0 and 150');
    }
    if (filters.age.max !== undefined && (filters.age.max < 0 || filters.age.max > 150)) {
      errors.push('Age maximum must be between 0 and 150');
    }
    if (filters.age.min !== undefined && filters.age.max !== undefined && filters.age.min > filters.age.max) {
      errors.push('Age minimum cannot be greater than maximum');
    }
  }

  // Validate premium range
  if (filters.premium) {
    if (filters.premium.min !== undefined && filters.premium.min < 0) {
      errors.push('Premium minimum must be greater than or equal to 0');
    }
    if (filters.premium.max !== undefined && filters.premium.max < 0) {
      errors.push('Premium maximum must be greater than or equal to 0');
    }
    if (filters.premium.min !== undefined && filters.premium.max !== undefined && filters.premium.min > filters.premium.max) {
      errors.push('Premium minimum cannot be greater than maximum');
    }
  }

  // Validate policies count range
  if (filters.policiesCount) {
    if (filters.policiesCount.min !== undefined && filters.policiesCount.min < 0) {
      errors.push('Policies count minimum must be greater than or equal to 0');
    }
    if (filters.policiesCount.max !== undefined && filters.policiesCount.max < 0) {
      errors.push('Policies count maximum must be greater than or equal to 0');
    }
    if (filters.policiesCount.min !== undefined && filters.policiesCount.max !== undefined && filters.policiesCount.min > filters.policiesCount.max) {
      errors.push('Policies count minimum cannot be greater than maximum');
    }
  }

  // Validate enum values
  const validLifecycleStages = ['Prospect', 'Active', 'At-Risk', 'Churned'];
  if (filters.lifecycleStage && !validLifecycleStages.includes(filters.lifecycleStage)) {
    errors.push(`Invalid lifecycle stage. Must be one of: ${validLifecycleStages.join(', ')}`);
  }

  const validEngagementScores = ['High', 'Medium', 'At-Low'];
  if (filters.engagementScore && !validEngagementScores.includes(filters.engagementScore)) {
    errors.push(`Invalid engagement score. Must be one of: ${validEngagementScores.join(', ')}`);
  }

  const validPaymentBehaviors = ['On-time', 'Delayed'];
  if (filters.paymentBehavior && !validPaymentBehaviors.includes(filters.paymentBehavior)) {
    errors.push(`Invalid payment behavior. Must be one of: ${validPaymentBehaviors.join(', ')}`);
  }

  return errors;
}

