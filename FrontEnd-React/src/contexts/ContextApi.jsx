import { createContext, useContext, useState } from "react";
import axiosApi from "../axiosClient";

const ContextApi = createContext();

export function ContextApiProvider({ children })
{
    async function getAllowedFilters(forAdmin)
    {
        const endPoint = forAdmin ? "/admin/pictures/allowed_filters" : "pictures/allowed_filters";
            const response = await axiosApi.get(endPoint);
            return response;
    }

    async function getAllCategories()
    {
        const response = await axiosApi.get("/admin/categories");
        return response;
    }

    async function getAllUsers()
    {
        const response = await axiosApi.get("/users");
        return response;
    }

    async function getPictures(forAdmin, queryString = null)
    {
        const endPoint = forAdmin ? "/admin/pictures" : "pictures";
        const queries = queryString ?? "";
            const response = await axiosApi.get(endPoint + queries);
            return response;
    }

    async function logInSignUp(userData, isLogin)
    {
        console.log("USERDATA: ", userData);
        const endPoint = isLogin ? "login" : "signup";
            const response = await axiosApi.post(`/auth/${endPoint}`, userData);
            return response;
    }

    async function verifyToken(token)
    {
            const response = await axiosApi.post(`/auth/verifytoken`, { token });
            console.log("LA RESPONSE: ", response);
            return response;
    }

    return (
        <ContextApi.Provider value={{ logInSignUp, verifyToken, getPictures, getAllowedFilters, getAllUsers, getAllCategories }}>
            { children }
        </ContextApi.Provider>
    )
}

export function useContextApi()
{
    return useContext(ContextApi);
}