import { Outlet } from "react-router-dom";
import { useContextUserAuthentication } from "../contexts/ContextUserAuthentication";

import generalStyle from "../assets/style/modules/styleForLayouts.module.css";

import CompHeaderGuest from "../components/guest/CompHeaderGuest";

export default function GuestLayout()
{
    const { go } = useContextUserAuthentication();

    return (
            go && <div className={generalStyle.layout}>
                        <CompHeaderGuest/>
                        <main>
                            <Outlet></Outlet>
                        </main>
                    </div>
    )
} 