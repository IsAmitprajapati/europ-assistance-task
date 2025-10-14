export const endpoints = {
    login : "/auth/login",
    logout : "/auth/logout",
    user : "/auth/user",
    segment : "/segment",
    segmentWiseCustomer : (id : string)=> `/segment/customer/${id}`,
    customer : "/customer"
}