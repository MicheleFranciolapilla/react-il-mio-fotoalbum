import style from "../../assets/style/modules/guest/styleForHeaderGuest.module.css";

import { NavLink } from "react-router-dom";

import menu from "../../assets/data/menuForGuest.json";

export default function CompHeader()
{
    return (
        <header className={style.header}>
            <h1 className={style.title}>PhotoLand</h1>
            <nav className={style.nav}>
                {
                    menu.map( item => 
                        <NavLink 
                            key={`guest-menu-${item.id}`} 
                            className={style.menuItem}
                            activeClassName="active"
                            to={item.route}
                            onClick={ item.isActive ? event => event.preventDefault() : null }
                        >
                            {item.text}
                        </NavLink> )
                }
            </nav>
        </header>
    )
}