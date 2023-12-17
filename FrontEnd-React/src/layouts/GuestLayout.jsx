import { Outlet } from "react-router-dom";

import generalStyle from "../assets/style/modules/styleForLayouts.module.css";

import CompHeaderGuest from "../components/guest/CompHeaderGuest";

export default function GuestLayout()
{
    return (
        <div className={generalStyle.layout}>
            <CompHeaderGuest/>
            <main>
                <Outlet></Outlet>
            </main>
        </div>
    )
} 