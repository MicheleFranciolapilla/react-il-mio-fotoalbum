import { createContext, useContext, useState } from "react";

import style from "../assets/style/modules/styleForContextOverlay.module.css";

const ContextOverlay = createContext();

const overlayForDialogs = 0;
const overlayForErrors = 1;
const overlayTWClasses = ["bg-transparent", "bg-red-400"];

export function ContextOverlayProvider({ children })
{
    const [showOverlay, setShowOverlay] = useState(false);
    const [overlayType, setOverlayType] = useState(overlayForDialogs);

    function incomingDialog()
    {
        setOverlayType(overlayForDialogs);
        setShowOverlay(true);
    }

    function incomingError()
    {
        setOverlayType(overlayForErrors);
        setShowOverlay(true);
    }

    function resetOverlay()
    {
        setShowOverlay(false);
    }

    return (
        <ContextOverlay.Provider value={{ incomingDialog, incomingError, resetOverlay }}>
            {
                showOverlay &&  <div className={`${style.overlay} ${overlayTWClasses[overlayType]}`}>
                                </div>
            }
            { children }
        </ContextOverlay.Provider>
    )
}
 export function useContextOverlay()
 {
    return useContext(ContextOverlay);
 }