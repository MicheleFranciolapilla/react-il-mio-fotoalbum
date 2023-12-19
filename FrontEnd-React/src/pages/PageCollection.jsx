import { useState, useEffect } from "react";

import { useContextApi } from "../contexts/ContextApi";
import { useContextOverlay } from "../contexts/ContextOverlay";
import { useContextDialog } from "../contexts/ContextDialog";
import { useContextUserAuthentication } from "../contexts/ContextUserAuthentication";
import { useNavigate } from "react-router-dom";

import pagesStyle from "../assets/style/modules/styleForPages.module.css";
import style from "../assets/style/modules/styleForCollectionPage.module.css";

import { returnErrorMsg } from "../assets/utilities/errorRelatedFunctions";

export default function PageCollection()
{
    const [pagingData, setPagingData] = useState({current_page : 1});
    const [validFilters, setValidFilters] = useState(null);
    const [collection, setCollection] = useState(null);

    const { getPictures } = useContextApi();
    const { incomingError, resetOverlay } = useContextOverlay();
    const { getDefaultDialogParams, dialogOn, dialogForError } = useContextDialog();
    const { userIsLogged } = useContextUserAuthentication();
    const navigate = useNavigate();

    useEffect( () =>
        {
            makeApiCall();
        }, [pagingData.current_page]);

    async function makeApiCall()
    {
        // EFFETTUARE CONTROLLI SULLA PERSISTENZA DEGLI STATES AL CAMBIO DEL VALORE DI USERISLOGGED
        const response = await getPictures(pagingData.current_page, userIsLogged);
        if (response.outcome)
        {
            setCollection(response.data.pictures);
            if (response.data.pictures.length !== 0)
                setPagingData(response.data.paging_data);
            else if ((!pagingData) || (pagingData.current_page !== 1))
                setPagingData({ current_page : 1 });
            if (response.data.valid_filters) 
                setValidFilters(response.data.valid_filters);
            else
                setValidFilters(null);
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
                            "functionBtnOK" :   () => userIsLogged ? navigate("/dashboard") : navigate("/")
                        });
        }
    }

    return (
        <div className={`${pagesStyle.page} flex justify-center items-center`}>
            {
                (collection) && <>
                                    {
                                        (collection.length === 0)   ?   <h2 className={ style.noDataMessage }>Nessuna foto disponibile</h2>
                                                                    :   <>
                                                                            
                                                                        </>
                                    }
                                </>
            }
        </div>
    )
}