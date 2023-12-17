import { Outlet } from "react-router-dom";

import generalStyle from "../assets/style/modules/styleForLayouts.module.css";

import CompHeader from "../components/guest/CompHeader";

export default function AdminLayout()
{
    return (
        <div className={generalStyle.layout}>
            <CompHeader/>
            <main>
                <Outlet></Outlet>
            </main>
        </div>
    )
} 