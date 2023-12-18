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
            console.log("DETTAGLIO DELL'ERRORE:", error);
            if (error.response)
                return { outcome : false, errorBy : "response", status : error.response.status, errorMsg : error.response.data.message };
            else if (error.request)
                return { outcome : false, errorBy : "network" };
            else
                return { outcome : false, errorBy : "unknown" };
        }
    }

    async function verifyToken(token)
    {
        try
        {
            const response = await axiosApi.post(`/auth/verifytoken`, { token });
            console.log("LA RESPONSE: ", response);
            return response.data.userVerified;
        }
        catch(error)
        {
            return null;
        }
    }

    return (
        <ContextApi.Provider value={{ logInSignUp, verifyToken }}>
            { children }
        </ContextApi.Provider>
    )
}

export function useContextApi()
{
    return useContext(ContextApi);
}