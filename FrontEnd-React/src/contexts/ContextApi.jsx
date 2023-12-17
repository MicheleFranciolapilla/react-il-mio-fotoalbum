import { createContext, useContext, useState } from "react";
import axiosApi from "../axiosClient";

const ContextApi = createContext();

export function ContextApiProvider({ children })
{
    async function logInSignUp(userData, isLogin)
    {
        console.log("USERDATA: ", userData);
        const endPoint = isLogin ? "login" : "signup";
        try
        {
            const { data } = await axiosApi.post(`/auth/${endPoint}`, userData);
            return { outcome : true, data : data} ;
        }
        catch(error)
        {
            if (error.response)
                return { outcome : false, errorBy : "response", error : error.response.data };
            else if (error.request)
                return { outcome : false, errorBy : "network" };
            else
                return { outcome : false, errorBy : "unknown" };
        }
    }

    return (
        <ContextApi.Provider value={{ logInSignUp }}>
            { children }
        </ContextApi.Provider>
    )
}

export function useContextApi()
{
    return useContext(ContextApi);
}