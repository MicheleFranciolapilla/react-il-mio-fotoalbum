import { useContextUserAuthentication } from "../contexts/ContextUserAuthentication";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function ProtectAdminRoutes({ children })
{
    const { userIsLogged } = useContextUserAuthentication();
    const navigate = useNavigate();

    useEffect( () =>
        {
            if (!userIsLogged)
                navigate("/access");
        }, [userIsLogged]);

    return (
        children
    )
}