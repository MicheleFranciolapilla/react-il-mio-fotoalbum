import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useContextApi } from "./ContextApi";
import { useContextOverlay } from "./ContextOverlay";
import { useContextDialog } from "./ContextDialog";

const ContextUserAuthentication = createContext();

export function ContextUserAuthenticationProvider({ children })
{
    const [go, setGo] = useState(false);
    const [userData, setUserData] = useState(null);
    const [authToken, setAuthToken] = useState(null);
    const [userIsLogged, setUserIsLogged] = useState(false);

    const navigate = useNavigate();
    const { verifyToken } = useContextApi();
    const { incomingInfo, resetOverlay } = useContextOverlay();
    const { getDefaultDialogParams, dialogForInfo, dialogOn, dialogOff  } = useContextDialog();

    useEffect( () =>
        {
            resetOverlay();
            dialogOff();
            const token = localStorage.getItem("token");
            if (!token)
            {
                setTimeout( () => 
                    {
                        setGo(true);
                        console.log("GO SETTATO A TRUE");
                        navigate("/");
                    });
            }
            else
            {
                // Se il token è presente, prima di effettuare la chiamata API di verifica dello stesso lo si rimuove dal local storage per evitare conflitti con l'axios interceptor. In caso di validità lo si riposiziona nel local storage in un momento seguente.
                localStorage.removeItem("token");
                checkTokenOnLoad(token);
            }
        }, []);

    useEffect( () =>
        {
            if (!go)
                setGo(true);
                console.log("GO SETTATO A TRUE");
            if (userIsLogged)
                navigate("/dashboard");
            else
                navigate("/");
        }, [userIsLogged]);

    async function checkTokenOnLoad(token)
    {
        const check = await verifyToken(token);
        console.log("USER IS: ",check);
        if (check.outcome)
        {
            setUserData(check.data.userVerified);
            storeToken(token);
            setUserIsLogged(true);
        }
        else
        {
            setGo(true);
            console.log("GO SETTATO A TRUE");
            navigate("/");
        }
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
        <ContextUserAuthentication.Provider value={{ go, userData, userIsLogged, manageUserLogIn, manageUserLogOut }}>
            { children }
        </ContextUserAuthentication.Provider>
    )
}

export function useContextUserAuthentication()
{
    return useContext(ContextUserAuthentication);
}