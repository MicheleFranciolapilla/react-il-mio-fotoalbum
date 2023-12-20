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
    const [collectionData, setCollectionData] = useState(   {
                                                                "collection"    :   null,
                                                                "pagingData"    :   { current_page : 1 },
                                                                "validFilters"  :   null
                                                            });
    const [updateTo, setUpdateTo] = useState(null);

    const { getPictures } = useContextApi();
    const { incomingError, resetOverlay } = useContextOverlay();
    const { getDefaultDialogParams, dialogOn, dialogForError } = useContextDialog();
    const { userIsLogged } = useContextUserAuthentication();
    const navigate = useNavigate();

    useEffect( () =>
        {
                console.log("VALORE ATTUALE: ", collectionData.pagingData);
                makeApiCall();
        }, [needToUpdate]);

    async function makeApiCall()
    {
        // EFFETTUARE CONTROLLI SULLA PERSISTENZA DEGLI STATES AL CAMBIO DEL VALORE DI USERISLOGGED
        const response = await getPictures(collectionData.pagingData.current_page, userIsLogged);
        if (response.outcome)
        {
            let newCollectionData = {
                                        "collection"        :   response.data.pictures,
                                        "pagingData"        :   response.data.paging_data ?? { "current_page" : 1 },
                                        "validFilters"      :   response.data.valid_filters ?? null
                                    };
            setCollectionData(newCollectionData);
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

    function changeData(what, how)
    {
        const previousCollectionData = { ...collectionData };
        let updatedPagingData = { ...previousCollectionData.pagingData };
        let currentData = null;
        let keyToSet = null;
        switch (what)
        {
            case "PPP"  :   switch (how)
                            {
                                case "--"   :   currentData = 3;
                                                break;
                                case "-"    :   currentData = updatedPagingData.pictures_per_page - 1;
                                                break;
                                case "+"    :   currentData = updatedPagingData.pictures_per_page + 1;
                                                break;
                                default     :   currentData = 10;
                            }
                            keyToSet = "pictures_per_page";
                            break;
            default     :   switch (how)
                            {
                                case "--"   :   currentData = 1;
                                                break;
                                case "-"    :   currentData = updatedPagingData.current_page - 1;
                                                break;
                                case "+"    :   currentData = updatedPagingData.current_page + 1;
                                                break;
                                default     :   currentData = updatedPagingData.total_pages;
                            }
                            keyToSet = "current_page";
        }
        updatedPagingData[keyToSet] = currentData;
        setCollectionData( previousCollectionData => ({...previousCollectionData, pagingData : updatedPagingData}) )
    }

    return (
        <div className={`${pagesStyle.page} flex justify-center items-center`}>
            {
                (collectionData.collection) 
                && 
                <>
                    {
                        (collectionData.collection.length === 0)    
                        ?   <h2 className={ style.noDataMessage }>
                                Nessuna foto disponibile
                            </h2>
                        :   <>
                                {
                                    (userIsLogged)  &&  <div id="collectionVeticalNav">
                                                        </div>
                                }
                                <div id="collectionFiltersAndControls">
                                    <div id="controls">
                                        <div className={style.info}>
                                            <h3>Totale foto:</h3>
                                            <span>
                                                {collectionData.collection.length}
                                            </span>
                                        </div>
                                        <div className={style.info}>
                                            <h3>Totale pagine:</h3>
                                            <span>
                                                {collectionData.pagingData.total_pages}
                                            </span>
                                        </div>
                                        <div className={style.control}>
                                            <div className={style.info}>
                                                <h3>Foto per pagina:</h3>
                                                <span>
                                                    {collectionData.pagingData.pictures_per_page}
                                                </span>
                                            </div>
                                            <div className={style.controlsGroup}>

                                                <button 
                                                    disabled={collectionData.pagingData.pictures_per_page === 3}
                                                    className=  {
                                                                    collectionData.pagingData.pictures_per_page === 3
                                                                        ?   style.controlBtnDisabled 
                                                                        :   style.controlBtn
                                                                }
                                                    onClick={ () => changeData("PPP", "--") }
                                                >
                                                    <i class="fa-solid fa-backward-fast"></i>
                                                </button>

                                                <button
                                                    disabled={collectionData.pagingData.pictures_per_page === 3}
                                                    className=  {
                                                                    collectionData.pagingData.pictures_per_page === 3
                                                                        ?   style.controlBtnDisabled 
                                                                        :   style.controlBtn
                                                                }
                                                    onClick={ () => changeData("PPP", "-") }
                                                >
                                                    <i class="fa-solid fa-caret-left"></i>
                                                </button>

                                                <button
                                                    disabled={collectionData.pagingData.pictures_per_page === 10}
                                                    className=  {
                                                                    collectionData.pagingData.pictures_per_page === 10
                                                                        ?   style.controlBtnDisabled 
                                                                        :   style.controlBtn
                                                                }
                                                    onClick={ () => changeData("PPP", "+") }
                                                >
                                                    <i class="fa-solid fa-caret-right"></i>
                                                </button>

                                                <button
                                                    disabled={collectionData.pagingData.pictures_per_page === 10}
                                                    className=  {
                                                                    collectionData.pagingData.pictures_per_page === 10
                                                                        ?   style.controlBtnDisabled 
                                                                        :   style.controlBtn
                                                                }
                                                    onClick={ () => changeData("PPP", "++") }
                                                >
                                                    <i class="fa-solid fa-forward-fast"></i>
                                                </button>
                                            </div>
                                        </div>
                                        <div className={style.control}>
                                            <div className={style.info}>
                                                <h3>Pagina corrente:</h3>
                                                <span>
                                                    {collectionData.pagingData.current_page}
                                                </span>
                                            </div>
                                            <div className={style.controlsGroup}>

                                                <button
                                                    disabled={collectionData.pagingData.current_page === 1}
                                                    className=  {
                                                                    collectionData.pagingData.current_page === 1
                                                                        ?   style.controlBtnDisabled 
                                                                        :   style.controlBtn
                                                                }
                                                    onClick={ () => changeData("CP", "--") }
                                                >
                                                    <i class="fa-solid fa-backward-fast"></i>
                                                </button>

                                                <button
                                                    disabled={collectionData.pagingData.current_page === 1}
                                                    className=  {
                                                                    collectionData.pagingData.current_page === 1
                                                                        ?   style.controlBtnDisabled 
                                                                        :   style.controlBtn
                                                                }
                                                    onClick={ () => changeData("CP", "-") }
                                                >
                                                    <i class="fa-solid fa-caret-left"></i>
                                                </button>

                                                <button
                                                    disabled={collectionData.pagingData.current_page === collectionData.pagingData.total_pages}
                                                    className=  {
                                                                    collectionData.pagingData.current_page === collectionData.pagingData.total_pages
                                                                        ?   style.controlBtnDisabled 
                                                                        :   style.controlBtn
                                                                }
                                                    onClick={ () => changeData("CP", "+") }
                                                >
                                                    <i class="fa-solid fa-caret-right"></i>
                                                </button>

                                                <button
                                                    disabled={collectionData.pagingData.current_page === collectionData.pagingData.total_pages}
                                                    className=  {
                                                                    collectionData.pagingData.current_page === collectionData.pagingData.total_pages
                                                                        ?   style.controlBtnDisabled 
                                                                        :   style.controlBtn
                                                                }
                                                    onClick={ () => changeData("CP", "++") }
                                                >
                                                    <i class="fa-solid fa-forward-fast"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div id="filters">

                                    </div>
                                </div>
                                <div id="collectionSlider">
                                </div>
                            </>
                    }
                </>
            }
        </div>
    )
}