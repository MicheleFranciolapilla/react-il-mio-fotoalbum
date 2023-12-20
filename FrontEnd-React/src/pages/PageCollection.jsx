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
    const [isUpdating, setIsUpdating] = useState(false);

    const { getPictures } = useContextApi();
    const { incomingError, resetOverlay } = useContextOverlay();
    const { getDefaultDialogParams, dialogOn, dialogForError } = useContextDialog();
    const { userIsLogged } = useContextUserAuthentication();
    const navigate = useNavigate();

    useEffect( () =>
        {
            if (!isUpdating)
            {
                setIsUpdating(true);
                console.log("VALORE ATTUALE: ", pagingData);
                makeApiCall();
            }
            else
                setIsUpdating(false); 
        }, [pagingData.current_page, pagingData.pictures_per_page]);

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

    function changeData(what, how)
    {
        let previousPagingData = { ...pagingData };
        let currentData = null;
        let keyToSet = null;
        switch (what)
        {
            case "PPP"  :   switch (how)
                            {
                                case "--"   :   currentData = 3;
                                                break;
                                case "-"    :   currentData = previousPagingData.pictures_per_page - 1;
                                                break;
                                case "+"    :   currentData = previousPagingData.pictures_per_page + 1;
                                                break;
                                default     :   currentData = 10;
                            }
                            keyToSet = "pictures_per_page";
                            break;
            default     :   switch (how)
                            {
                                case "--"   :   currentData = 1;
                                                break;
                                case "-"    :   currentData = previousPagingData.current_page - 1;
                                                break;
                                case "+"    :   currentData = previousPagingData.current_page + 1;
                                                break;
                                default     :   currentData = previousPagingData.total_pages;
                            }
                            keyToSet = "current_page";
        }
        setPagingData( previousPagingData =>  ({...previousPagingData, [keyToSet] : currentData}));
    }

    return (
        <div className={`${pagesStyle.page} flex justify-center items-center`}>
            {
                (collection) && <>
                                    {
                                        (collection.length === 0)   ?   <h2 className={ style.noDataMessage }>Nessuna foto disponibile</h2>
                                                                    :   <>
                                                                            {
                                                                                (userIsLogged)  &&  <div id="collectionVeticalNav">
                                                                                                    </div>
                                                                            }
                                                                            <div id="collectionFiltersAndControls">
                                                                                <div id="controls">
                                                                                    <div className={style.info}>
                                                                                        <h3>Totale foto:</h3>
                                                                                        <span>{collection.length}</span>
                                                                                    </div>
                                                                                    <div className={style.info}>
                                                                                        <h3>Totale pagine:</h3>
                                                                                        <span>{pagingData.total_pages}</span>
                                                                                    </div>
                                                                                    <div className={style.control}>
                                                                                        <div className={style.info}>
                                                                                            <h3>Foto per pagina:</h3>
                                                                                            <span>{pagingData.pictures_per_page}</span>
                                                                                        </div>
                                                                                        <div className={style.controlsGroup}>
                                                                                            <button 
                                                                                                disabled={pagingData.pictures_per_page === 3}
                                                                                                className=  {
                                                                                                                pagingData.pictures_per_page === 3
                                                                                                                    ?   style.controlBtnDisabled 
                                                                                                                    :   style.controlBtn
                                                                                                            }
                                                                                                onClick={ () => changeData("PPP", "--") }
                                                                                            >
                                                                                                <i class="fa-solid fa-backward-fast"></i>
                                                                                            </button>
                                                                                            <button
                                                                                                disabled={pagingData.pictures_per_page === 3}
                                                                                                className=  {
                                                                                                                pagingData.pictures_per_page === 3
                                                                                                                    ?   style.controlBtnDisabled 
                                                                                                                    :   style.controlBtn
                                                                                                            }
                                                                                                onClick={ () => changeData("PPP", "-") }
                                                                                             >
                                                                                                <i class="fa-solid fa-caret-left"></i>
                                                                                            </button>
                                                                                            <button
                                                                                                disabled={pagingData.pictures_per_page === 10}
                                                                                                className=  {
                                                                                                                pagingData.pictures_per_page === 10
                                                                                                                    ?   style.controlBtnDisabled 
                                                                                                                    :   style.controlBtn
                                                                                                            }
                                                                                                onClick={ () => changeData("PPP", "+") }
                                                                                             >
                                                                                                <i class="fa-solid fa-caret-right"></i>
                                                                                            </button>
                                                                                            <button
                                                                                                disabled={pagingData.pictures_per_page === 10}
                                                                                                className=  {
                                                                                                                pagingData.pictures_per_page === 10
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
                                                                                            <span>{pagingData.current_page}</span>
                                                                                        </div>
                                                                                        <div className={style.controlsGroup}>
                                                                                            <button
                                                                                                disabled={pagingData.current_page === 1}
                                                                                                className=  {
                                                                                                                pagingData.current_page === 1
                                                                                                                    ?   style.controlBtnDisabled 
                                                                                                                    :   style.controlBtn
                                                                                                            }
                                                                                                onClick={ () => changeData("CP", "--") }
                                                                                             >
                                                                                                <i class="fa-solid fa-backward-fast"></i>
                                                                                            </button>
                                                                                            <button
                                                                                                disabled={pagingData.current_page === 1}
                                                                                                className=  {
                                                                                                                pagingData.current_page === 1
                                                                                                                    ?   style.controlBtnDisabled 
                                                                                                                    :   style.controlBtn
                                                                                                            }
                                                                                                onClick={ () => changeData("CP", "-") }
                                                                                             >
                                                                                                <i class="fa-solid fa-caret-left"></i>
                                                                                            </button>
                                                                                            <button
                                                                                                disabled={pagingData.current_page === pagingData.total_pages}
                                                                                                className=  {
                                                                                                                pagingData.current_page === pagingData.total_pages
                                                                                                                    ?   style.controlBtnDisabled 
                                                                                                                    :   style.controlBtn
                                                                                                            }
                                                                                                onClick={ () => changeData("CP", "+") }
                                                                                             >
                                                                                                <i class="fa-solid fa-caret-right"></i>
                                                                                            </button>
                                                                                            <button
                                                                                                disabled={pagingData.current_page === pagingData.total_pages}
                                                                                                className=  {
                                                                                                                pagingData.current_page === pagingData.total_pages
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