import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useContextApi } from "./ContextApi";
import { useContextOverlay } from "./ContextOverlay";
import { useContextDialog } from "./ContextDialog";

const ContextUserAuthentication = createContext();

export function ContextUserAuthenticationProvider({ children })
{
    const [userData, setUserData] = useState(null);
    const [authToken, setAuthToken] = useState(null);
    const [userIsLogged, setUserIsLogged] = useState(false);

    const navigate = useNavigate();
    const { verifyToken } = useContextApi();
    const { resetOverlay, incomingInfo } = useContextOverlay();
    const { getDefaultDialogParams, dialogForInfo, dialogOn, dialogOff  } = useContextDialog();

    useEffect( () =>
        {
            dialogOff();
            resetOverlay();
            const token = localStorage.getItem("token");
            if (!token)
                setTimeout( () => navigate("/"));
            else
                checkTokenOnLoad(token);
        }, []);

    useEffect( () =>
        {
            if (userIsLogged)
                navigate("/dashboard");
            else
                navigate("/");
        }, [userIsLogged]);

    async function checkTokenOnLoad(token)
    {
        const check = await verifyToken(token);
        console.log("USER IS: ",check);
        if (check)
        {
            setUserData(check);
            setAuthToken(token);
            setUserIsLogged(true);
        }
        else
            navigate("/");
    }

    function manageUserLogIn(response)
    {
        const user = response.newUser ?? response.userToLog;
        setUserData(user);
        setUserIsLogged(true);
        storeToken(response.token);
    }

    function manageUserLogOut()
    {
        incomingInfo();
        dialogForInfo();
        const errorDialogParams = getDefaultDialogParams();
        dialogOn(   {
                        ...errorDialogParams, 
                        "message1"          :   `Log Out per ${userData.name} ${userData.surname}`,
                        "message2"          :   "Tempo necessario per l'operazione: 5 secondi",
                        "timingClose"       :   true,
                        "timerMsec"         :   5000,
                        "functionTiming"    :   () =>
                                                    {
                                                        clearToken();
                                                        setUserIsLogged(false);
                                                        setUserData(null);
                                                    }
                    });
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
        <ContextUserAuthentication.Provider value={{ userData, userIsLogged, manageUserLogIn, manageUserLogOut }}>
            { children }
        </ContextUserAuthentication.Provider>
    )
}

export function useContextUserAuthentication()
{
    return useContext(ContextUserAuthentication);
}