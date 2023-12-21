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
                                                                "pagingData"    :   { 
                                                                                        "current_page"      :   1,
                                                                                        "pictures_per_page" :   4
                                                                                    },                                                                
                                                                "validFilters"  :   null
                                                            });
    const [anyQuery, setAnyQuery] = useState(null);

    const { getPictures, getAllowedFilters } = useContextApi();
    const { incomingError, resetOverlay } = useContextOverlay();
    const { getDefaultDialogParams, dialogOn, dialogForError } = useContextDialog();
    const { userIsLogged } = useContextUserAuthentication();
    const navigate = useNavigate();

    let allowedFilters = [];

    useEffect( () =>
        {
            makeApiCall(true);
        }, []);

    useEffect( () =>
        {
            if (anyQuery)
            {
                console.log("VALORE ATTUALE: ", collectionData.pagingData);
                makeApiCall(false);
            }
        }, [anyQuery]);

    async function makeApiCall(firstCall)
    {
        // EFFETTUARE CONTROLLI SULLA PERSISTENZA DEGLI STATES AL CAMBIO DEL VALORE DI USERISLOGGED

        if (firstCall)
        {
            const allowedFiltersResponse = await getAllowedFilters(userIsLogged);
            allowedFilters = allowedFiltersResponse.data;
        }

        const response = await getPictures(userIsLogged, anyQuery);
        if (response.outcome)
        {
            let newCollectionData = {
                                        "collection"        :   response.data.pictures,
                                        "pagingData"        :   response.data.paging_data ??    { 
                                                                                                    "current_page"      :   1,
                                                                                                    "pictures_per_page" :   4
                                                                                                },
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

    function setFiltersQuery()
    {
        let queryToReturn = "";
        if (collectionData.validFilters)
            for (key in collectionData.validFilters)
                queryToReturn += "&filter[".concat(key, "]=", collectionData.validFilters[key]);
        return queryToReturn;
    }

    function changeData(what, how)
    {
        let CP = collectionData.pagingData.current_page;
        let PPP = collectionData.pagingData.pictures_per_page;
        switch (what)
        {
            case "PPP"  :   switch (how)
                            {
                                case "--"   :   PPP = 3;
                                                break;
                                case "-"    :   PPP--;
                                                break;
                                case "+"    :   PPP++;
                                                break;
                                default     :   PPP = 10;
                            }
                            break;
            case "CP"   :   switch (how)
                            {
                                case "--"   :   CP = 1;
                                                break;
                                case "-"    :   CP--;
                                                break;
                                case "+"    :   CP++;
                                                break;
                                default     :   CP = collectionData.pagingData.total_pages;
                            }
                            break;
            // Il caso default è relativo alla modifica dei filtri di ricerca
            default     :   CP = 1;
        }
        const filtersQuery = (what === "filters") ? how : setFiltersQuery();
        setAnyQuery(`?page=${CP}&itemsxpage=${PPP}${filtersQuery}`);
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
                                Nessun elemento da mostrare
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
                                        <div className={style.control}>
                                            <div className={style.info}>
                                                <h3>Foto per pagina:</h3>
                                                <span>
                                                    {collectionData.pagingData.pictures_per_page}
                                                </span>
                                            </div>
                                            <div className={style.controlsGroup}>

                                                <button 
                                                    disabled={collectionData.pagingData.pictures_per_page == 3}
                                                    className=  {
                                                                    collectionData.pagingData.pictures_per_page == 3
                                                                        ?   style.controlBtnDisabled 
                                                                        :   style.controlBtn
                                                                }
                                                    onClick={ () => changeData("PPP", "--") }
                                                >
                                                    <i class="fa-solid fa-backward-fast"></i>
                                                </button>

                                                <button
                                                    disabled={collectionData.pagingData.pictures_per_page == 3}
                                                    className=  {
                                                                    collectionData.pagingData.pictures_per_page == 3
                                                                        ?   style.controlBtnDisabled 
                                                                        :   style.controlBtn
                                                                }
                                                    onClick={ () => changeData("PPP", "-") }
                                                >
                                                    <i class="fa-solid fa-caret-left"></i>
                                                </button>

                                                <button
                                                    disabled={collectionData.pagingData.pictures_per_page == 10}
                                                    className=  {
                                                                    collectionData.pagingData.pictures_per_page == 10
                                                                        ?   style.controlBtnDisabled 
                                                                        :   style.controlBtn
                                                                }
                                                    onClick={ () => changeData("PPP", "+") }
                                                >
                                                    <i class="fa-solid fa-caret-right"></i>
                                                </button>

                                                <button
                                                    disabled={collectionData.pagingData.pictures_per_page == 10}
                                                    className=  {
                                                                    collectionData.pagingData.pictures_per_page == 10
                                                                        ?   style.controlBtnDisabled 
                                                                        :   style.controlBtn
                                                                }
                                                    onClick={ () => changeData("PPP", "++") }
                                                >
                                                    <i class="fa-solid fa-forward-fast"></i>
                                                </button>
                                            </div>
                                        </div>
                                        <div className={style.info}>
                                            <h3>Totale pagine:</h3>
                                            <span>
                                                {collectionData.pagingData.total_pages}
                                            </span>
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
                                                    disabled={collectionData.pagingData.current_page == 1}
                                                    className=  {
                                                                    collectionData.pagingData.current_page == 1
                                                                        ?   style.controlBtnDisabled 
                                                                        :   style.controlBtn
                                                                }
                                                    onClick={ () => changeData("CP", "--") }
                                                >
                                                    <i class="fa-solid fa-backward-fast"></i>
                                                </button>

                                                <button
                                                    disabled={collectionData.pagingData.current_page == 1}
                                                    className=  {
                                                                    collectionData.pagingData.current_page == 1
                                                                        ?   style.controlBtnDisabled 
                                                                        :   style.controlBtn
                                                                }
                                                    onClick={ () => changeData("CP", "-") }
                                                >
                                                    <i class="fa-solid fa-caret-left"></i>
                                                </button>

                                                <button
                                                    disabled={collectionData.pagingData.current_page == collectionData.pagingData.total_pages}
                                                    className=  {
                                                                    collectionData.pagingData.current_page == collectionData.pagingData.total_pages
                                                                        ?   style.controlBtnDisabled 
                                                                        :   style.controlBtn
                                                                }
                                                    onClick={ () => changeData("CP", "+") }
                                                >
                                                    <i class="fa-solid fa-caret-right"></i>
                                                </button>

                                                <button
                                                    disabled={collectionData.pagingData.current_page == collectionData.pagingData.total_pages}
                                                    className=  {
                                                                    collectionData.pagingData.current_page == collectionData.pagingData.total_pages
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
                                        <h3 className="text-xl text-green-300">Filtri di ricerca</h3>
                                        <div id="filtersBox">
                                        </div>
                                        <button className={style.addFilterBtn}>Aggiungi</button>
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