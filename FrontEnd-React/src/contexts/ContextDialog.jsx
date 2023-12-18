import { createContext, useContext, useEffect, useState } from "react";

import { useContextOverlay } from "./ContextOverlay";

import style from "../assets/style/modules/styleForContextDialog.module.css";

const ContextDialog = createContext();

const dialogInfo = 0;
const dialogError = 1;
const dialogTWClasses = ["bg-gray-400 border-gray-600", "bg-red-700 border-yellow-300"];
const titleTWClasses = ["text-xl text-white", "text-xl text-black"];
const defaultDialogParams = {
                                "title"             :   "ATTENZIONE",
                                "message1"          :   "",
                                "message2"          :   "",
                                "twoButtons"        :   true,
                                "textBtnOK"         :   "OK",
                                "textBtnKO"         :   "Chiudi",
                                "functionBtnOK"     :   null,
                                "functionBtnKO"     :   null,
                                "switchDialogFirst" :   true,    
                                "timingClose"       :   false,
                                "timerMsec"         :   0,
                                "functionTiming"    :   null
                            };

export function ContextDialogProvider({ children })
{
    const [showDialog, setShowDialog] = useState(false);
    const [dialogType, setDialogType] = useState(dialogInfo);
    const [dialogParams, setDialogParams] = useState(defaultDialogParams);

    const { resetOverlay } = useContextOverlay();

    useEffect( () =>
        {
            if ((showDialog) && (dialogParams.timingClose))
                setTimeout( () =>
                    {
                        if (dialogParams.switchDialogFirst)
                        {
                            dialogOff();
                            resetOverlay();
                        }
                        if (dialogParams.functionTiming)
                            dialogParams.functionTiming();
                        if (!dialogParams.switchDialogFirst)
                        {
                            dialogOff();
                            resetOverlay();
                        }
                        setDialogParams(defaultDialogParams);
                    }, dialogParams.timerMsec);
        }, [showDialog]);

    function dialogForInfo()
    {
        setDialogType(dialogInfo);
    }

    function dialogForError()
    {
        setDialogType(dialogError);
    }

    function getDefaultDialogParams()
    {
        return defaultDialogParams;
    }

    function dialogOn(params)
    {
        setDialogParams(params);
        setShowDialog(true);
    }

    function dialogOff()
    {
        setShowDialog(false);
    }

    function manageClick(event, what)
    {
        event.stopPropagation();
        event.preventDefault();
        // ...se si intende chiudere il dialog prima di eseguire le funzioni al click
        if (dialogParams.switchDialogFirst)
        {
            dialogOff();
            resetOverlay();
        }
        if ((what === "KO") && (dialogParams.functionBtnKO))
            dialogParams.functionBtnKO();
        if ((what === "OK") && (dialogParams.functionBtnOK))
            dialogParams.functionBtnOK();
        // ...se si intende chiudere il dialog dopo aver eseguito le funzioni al click
        if (!dialogParams.switchDialogFirst)
        {
            dialogOff();
            resetOverlay();
        }
        // si resettano i dialog params ai valori di default solo al termine delle operazioni
        setDialogParams(defaultDialogParams);
    }

    return (
        <ContextDialog.Provider value={{ getDefaultDialogParams, dialogForInfo, dialogForError, dialogOn, dialogOff }}>
            {
                showDialog &&   <div className={`${style.dialog} ${dialogTWClasses[dialogType]}`}>
                                    <h3 className={`self-center mb-3 ${titleTWClasses[dialogType]}`}>{dialogParams.title}</h3>
                                    <h6>{dialogParams.message1}</h6>
                                    <h6>{dialogParams.message2}</h6>
                                    {
                                        (!dialogParams.timingClose) &&  <div className="flex gap-4 items-center justify-center self-center mt-3">
                                                                            {
                                                                                dialogParams.twoButtons &&  <button 
                                                                                                                className={`${style.btn}`} 
                                                                                                                onClick={ (event) => manageClick(event, "KO") }
                                                                                                            >
                                                                                                                {dialogParams.textBtnKO}
                                                                                                            </button>
                                                                            }
                                                                            <button 
                                                                                className={`${style.btn}`} 
                                                                                onClick={ (event) => manageClick(event, "OK") }
                                                                            >
                                                                                {dialogParams.textBtnOK}
                                                                            </button>
                                                                        </div>
                                    }
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