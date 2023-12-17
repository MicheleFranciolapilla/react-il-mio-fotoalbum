import { createContext, useContext, useState } from "react";

const ContextUserAuthentication = createContext();

export function ContextUserAuthenticationProvider({ children })
{
    const [userData, setUserData] = useState(null);
    const [authToken, setAuthToken] = useState(null);
    const [userIsLogged, setUserIsLogged] = useState(false);

    return (
        <ContextUserAuthentication.Provider>
            { children }
        </ContextUserAuthentication.Provider>
    )
}

export function useContextUserAuthentication()
{
    return useContext(ContextUserAuthentication);
}