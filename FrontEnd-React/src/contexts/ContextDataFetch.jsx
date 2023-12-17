import { createContext, useContext, useState } from "react";

const ContextDataFetch = createContext();

export function ContextDataFetchProvider({ children })
{
    

    return (
        <ContextDataFetch.Provider>
            { children }
        </ContextDataFetch.Provider>
    )
}

export function useContextDataFetch()
{
    return useContext(ContextDataFetch);
}