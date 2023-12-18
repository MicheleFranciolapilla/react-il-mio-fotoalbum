import { Outlet } from "react-router-dom";
import { useContextUserAuthentication } from "../contexts/ContextUserAuthentication";

import generalStyle from "../assets/style/modules/styleForLayouts.module.css";

import CompHeaderAdmin from "../components/admin/CompHeaderAdmin";

export default function AdminLayout()
{
    const { go } = useContextUserAuthentication();

    return (
        go &&   <div className={generalStyle.layout}>
                    <CompHeaderAdmin/>
                    <main>
                        <Outlet></Outlet>
                    </main>
                </div>
    )
} 