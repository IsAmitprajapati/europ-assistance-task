export const endpoints = {
    login : "/auth/login",
    logout : "/auth/logout",
    user : "/auth/user",
    segment : "/segment",
    segmentWiseCustomer : (id : string)=> `/segment/customer/${id}`,
    customer : "/customer",
    dashboard : "/dashboard",
    policyDistribution : "/dashboard/policy-distribution",
    revenues : "/dashboard/revenues",
    customerAcquisition : "/dashboard/customer-acquisition",
    claimPolicychart : "/dashboard/claim-policy-chart"
}