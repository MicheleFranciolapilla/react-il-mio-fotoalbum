import { createContext, useContext, useState } from "react";

import style from "../assets/style/modules/styleForContextOverlay.module.css";

const ContextOverlay = createContext();

const overlayForDialogs = 0;
const overlayForErrors = 1;
const overlayForInfo = 2;
const overlayTWClasses = ["bg-transparent z-20", "bg-red-800/80 z-40", "bg-transparent z-40"];

export function ContextOverlayProvider({ children })
{
    const [showOverlay, setShowOverlay] = useState(false);
    const [overlayType, setOverlayType] = useState(overlayForDialogs);

    function incomingDialog()
    {
        setOverlayType(overlayForDialogs);
        if (!showOverlay)
            setShowOverlay(true);
    }

    function incomingError()
    {
        setOverlayType(overlayForErrors);
        if (!showOverlay)
            setShowOverlay(true);
    }

    function incomingInfo()
    {
        setOverlayType(overlayForInfo);
        if (!showOverlay)
            setShowOverlay(true);
    }

    function resetOverlay()
    {
        setShowOverlay(false);
    }

    return (
        <ContextOverlay.Provider value={{ incomingDialog, incomingError, incomingInfo, resetOverlay }}>
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