import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ContextUserAuthentication = createContext();

export function ContextUserAuthenticationProvider({ children })
{
    const [userData, setUserData] = useState(null);
    const [authToken, setAuthToken] = useState(null);
    const [userIsLogged, setUserIsLogged] = useState(false);

    const navigate = useNavigate();

    useEffect( () =>
        {
            if (userIsLogged)
                navigate("/dashboard");
            else
                navigate("/");
        }, [userIsLogged]);

    function manageUserLogIn(response)
    {
        const user = response.newUser ?? response.userToLog;
        setUserData(user);
        setUserIsLogged(true);
        storeToken(response.token);
    }

    function manageUserLogOut()
    {
        clearToken();
        setUserIsLogged(false);
        setUserData(null);
    }

    function storeToken(token)
    {
        setAuthToken(token);
        localStorage.setItem("token", token);
    }

    function clearToken()
    {
        localStorage.removeItem("token");
        setAuthToken(null);
    }

    return (
        <ContextUserAuthentication.Provider value={{ userData, manageUserLogIn, manageUserLogOut }}>
            { children }
        </ContextUserAuthentication.Provider>
    )
}

export function useContextUserAuthentication()
{
    return useContext(ContextUserAuthentication);
}