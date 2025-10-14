import { createContext, useContext, useEffect, useState } from "react";
import api from "../utils/Axios";
import { endpoints } from "../utils/endpoint";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

interface IUser {
    name : string 
    email : string
}

interface IContext {
    user : IUser | null,
    fetchCurrentUser : () => void
    globalLoading : boolean
}

const defaultValue = {
    user : null,
    globalLoading : false,
    fetchCurrentUser : () => {}
}

const Context  = createContext<IContext>(defaultValue)

export const useProvider = ()=>useContext(Context)

export default function Provider({children} : {children : React.ReactNode}){
    const navigate = useNavigate()
    const [user,setUser] = useState<IUser | null>(defaultValue.user)
    const [globalLoading,setGlobalLoading] = useState<boolean>(false)

    const fetchCurrentUserDetails = async () => {
        setGlobalLoading(true)
        try {
            const response = await api.get(endpoints.user);

            if (response?.data?.success) {
                setUser({
                    name: response.data.data.name,
                    email: response.data.data.email,
                });
            } else {
                setUser(null);
                // toast.error(response?.data?.message || "Failed to fetch user info");
            }

        } catch (error: any) {
            setUser(null);
            // toast.error(error?.message || "Failed to fetch user info");
        }finally{
            setGlobalLoading(false)
        }
    }

    useEffect(()=>{
        fetchCurrentUserDetails()
    },[])

    return(
        <Context.Provider value={{
            user,
            globalLoading,
            fetchCurrentUser : fetchCurrentUserDetails
        }}>
            {children}
        </Context.Provider>
    )
}

