import { useState, useEffect } from "react";

import { useContextApi } from "../../contexts/ContextApi";
import { useContextOverlay } from "../../contexts/ContextOverlay";
import { useContextDialog } from "../../contexts/ContextDialog";

import pagesStyle from "../../assets/style/modules/styleForPages.module.css";

import { returnErrorMsg } from "../../assets/utilities/errorRelatedFunctions";

export default function PageCollectionGuest()
{
    const [pagingData, setPagingData] = useState({current_page : 1});
    const [validFilters, setValidFilters] = useState(null);
    const [collection, setCollection] = useState([]);

    const { getPictures } = useContextApi();
    const { incomingError } = useContextOverlay();
    const { getDefaultDialogParams, dialogOn, dialogForError } = useContextDialog();

    useEffect( () =>
        {
            makeApiCall();
        }, [pagingData.current_page]);

    async function makeApiCall()
    {
        const response = await getPictures(pagingData.current_page, false);
        // console.log("DATI: ", response.data.pictures);
        if (response.outcome)
        {
            if (collection.length !== 0)
                setPagingData(response.data.paging_data);
            else if ((!pagingData) || (pagingData.current_page !== 1))
                setPagingData({current_page : 1});
            setValidFilters(response.data.valid_filters);
            setCollection(response.data.pictures);
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

        </div>
    )
}