import pagesStyle from "../../assets/style/modules/styleForPages.module.css";
import userDataStyle from "../../assets/style/modules/guest/styleForAccess.module.css";
import dialogStyle from "../../assets/style/modules/styleForDialogsAndErrors.module.css";

import { useState, useEffect } from "react";

import { useContextOverlay } from "../../contexts/ContextOverlay";
import { useContextDialog } from "../../contexts/ContextDialog";
import { useContextApi } from "../../contexts/ContextApi";
import { useContextUserAuthentication } from "../../contexts/ContextUserAuthentication";

import CompInput from "../../components/CompInput";

export default function PageLogInSignUp()
{
    const [hasAccount, setHasAccount] = useState(true);
    const [userData, setUserData] = useState( {email : "", password : ""} );
    const [newUserData, setNewUserData] = useState( {name : "", surname : "", email : "", password : ""} );

    const { incomingDialog, incomingError, resetOverlay } = useContextOverlay();
    const { getDefaultDialogParams, dialogOn, dialogOff, dialogForError } = useContextDialog();
    const { logInSignUp } = useContextApi();
    const { manageUserLogIn } = useContextUserAuthentication();

    useEffect( () =>
    {
        incomingDialog();
    }, []);

    useEffect( () =>
    {
        if (hasAccount)
            document.getElementById("userHasAccount").checked = true;
        else
            document.getElementById("userHasNotAccount").checked = true;
    }, [hasAccount]);

    function onRadioChange(event)
    {
        setHasAccount(event.target.value === "login");
    }

    function setNewValue(newValue, what)
    {
        let currentValues = null;
        if (hasAccount)
        {
            currentValues = {...userData};
            currentValues[what] = newValue;
            setUserData(currentValues);
        }
        else
        {
            currentValues = {...newUserData};
            currentValues[what] = newValue;
            setNewUserData(currentValues);
        }
    }

    function returnErrorMsg(errorResponse)
    {
        console.log("ERRORE ENTRANTE: ", errorResponse);
        let errorMsgs = ["Operazione non eseguibile al momento.", "Riprovare più tardi."];
        if (errorResponse.errorBy === "network")
            errorMsgs = ["Rete non disponibile o instabile.", "Riprovare più tardi."];
        else if (errorResponse.errorBy === "response")
            errorMsgs = [`Errore (${errorResponse.status})`, errorResponse.errorMsg];
        return errorMsgs;
    }

    async function onSubmitEvent(event)
    {
        event.preventDefault();
        let userToFetch = newUserData;
        if (hasAccount)
            userToFetch = userData;
        const response = await logInSignUp(userToFetch, hasAccount);
        console.log(response);
        if (response.outcome)
        {
            resetOverlay();
            manageUserLogIn(response.data);
        }
        else
        {
            const errorMsgs = returnErrorMsg(response);
            incomingError();
            dialogForError();
            const errorDialogParams = getDefaultDialogParams();
            dialogOn(   {
                            ...errorDialogParams, 
                            "title"         :   "ERRORE", 
                            "message1"      :   errorMsgs[0],
                            "message2"      :   errorMsgs[1],
                            "twoButtons"    :   false,
                        });
        }
    }

    return (
        <div className={ pagesStyle.page }>
            <form className={`${userDataStyle.form} ${dialogStyle.accessibleDialog}`} onSubmit={ (event) => onSubmitEvent(event) }>
                <div className={userDataStyle.logInSignUp}>
                    <div>
                        <label 
                            htmlFor="userHasAccount" 
                            className={`${userDataStyle.radioTxt} ${hasAccount ? "text-blue-700" : "text-black"}`} 
                        >
                            Log In
                        </label>
                        <input 
                            id="userHasAccount" 
                            type="radio" 
                            name="logInSignUp" 
                            value="login" 
                            onChange={ (event) => onRadioChange(event) } 
                        />
                    </div>
                    <div>
                        <label 
                            htmlFor="userHasNotAccount" 
                            className={`${userDataStyle.radioTxt} ${hasAccount ? "text-black" : "text-blue-700"}`}
                        >
                            Crea account
                        </label>
                        <input 
                            id="userHasNotAccount" 
                            type="radio" 
                            name="logInSignUp" 
                            value="signup"  
                            onChange={ (event) => onRadioChange(event) } 
                        />
                    </div>
                </div>
                <div className={userDataStyle.formBody}>
                    {
                        hasAccount ||
                        <CompInput
                            label="Nome utente"
                            tailwindClasses="w-full"
                            inputName="name"
                            inputValue={hasAccount ? userData.name : newUserData.name}
                            callOnChange={ (arg, what) => setNewValue(arg.value, what) }
                            minL={3}
                            maxL={25}
                        />
                    }
                    {
                        hasAccount ||
                        <CompInput
                            label="Cognome utente"
                            tailwindClasses="w-full"
                            inputName="surname"
                            inputValue={hasAccount ? userData.surname : newUserData.surname}
                            callOnChange={ (arg, what) => setNewValue(arg.value, what) }
                            minL={3}
                            maxL={35}
                        />
                    }
                    <CompInput
                        label="Email"
                        tailwindClasses="w-full"
                        inputName="email"
                        inputValue={hasAccount ? userData.email : newUserData.email}
                        callOnChange={ (arg, what) => setNewValue(arg.value, what) }
                        inputType="email"
                        maxL={50}
                    />
                    <CompInput
                        label="Password"
                        tailwindClasses="w-full"
                        inputName="password"
                        inputValue={hasAccount ? userData.password : newUserData.password}
                        callOnChange={ (arg, what) => setNewValue(arg.value, what) }
                        inputType="password"
                        minL={10}
                        maxL={50}
                    />
                </div>
                <div className={userDataStyle.formBtn}>
                    <button className={userDataStyle.btn} type="button" onClick={ () => navigate(-1) }>Annulla</button>
                    <button className={userDataStyle.btn} type="submit">Conferma</button>
                </div>
            </form>
        </div>
    )
}