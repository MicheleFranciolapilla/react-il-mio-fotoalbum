import { Outlet } from "react-router-dom";

import generalStyle from "../assets/style/modules/styleForLayouts.module.css";

import CompHeaderAdmin from "../components/admin/CompHeaderAdmin";

export default function AdminLayout()
{
    return (
        <div className={generalStyle.layout}>
            <CompHeaderAdmin/>
            <main>
                <Outlet></Outlet>
            </main>
        </div>
    )
} 