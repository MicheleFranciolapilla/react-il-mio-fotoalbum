import { createContext, useContext, useState } from "react";

import style from "../assets/style/modules/styleForContextDialog.module.css";

const ContextDialog = createContext();

const dialogInfo = 0;
const dialogError = 1;
const dialogTWClasses = ["bg-gray-600", "bg-orange-600"];
const defaultDialogParams = {
                                "title"         :   "ATTENZIONE",
                                "message1"      :   "",
                                "message2"      :   "",
                                "twoButtons"    :   true,
                                "textBtnOK"     :   "OK",
                                "textBtnKO"     :   "Chiudi",
                                "timingClose"   :   false,
                                "timerMsec"     :   0
                            };

export function ContextDialogProvider({ children })
{
    const [showDialog, setShowDialog] = useState(false);
    const [dialogType, setDialogType] = useState(dialogInfo);
    const [dialogParams, setDialogParams] = useState(defaultDialogParams);

    function getDefaultDialogParams()
    {
        return defaultDialogParams;
    }

    function dialogOn(params)
    {
        setDialogParams(params);
        setShowDialog(true);
    }

    return (
        <ContextDialog.Provider value={{ getDefaultDialogParams, dialogOn }}>
            {
                showDialog &&   <div className={`${style.dialog} ${dialogTWClasses[dialogType]}`}>

                                </div>
            }
            { children }
        </ContextDialog.Provider>
    )
}

export function useContextDialog()
{
    return useContext(ContextDialog);
}