import style from "../../assets/style/modules/admin/styleForHeaderAdmin.module.css";

import { NavLink } from "react-router-dom";

import { useContextUserAuthentication } from "../../contexts/ContextUserAuthentication";

import menu from "../../assets/data/menuForGuest.json";

export default function CompHeaderAdmin()
{
    const { userData, manageUserLogOut } = useContextUserAuthentication();

    return (
        <header className={style.header}>
            <h1 className={style.title}>PhotoLand</h1>
            <div className={style.userBox}>
                {
                    (userData) && <h2 className={`${style.user} ${userData.role === "Super Admin" && style.super}`}>{userData.name} {userData.surname}</h2>
                }
                <button className={style.menuItem} type="button" onClick={ manageUserLogOut } >
                    Log Out
                </button>
            </div>
        </header>
    )
}