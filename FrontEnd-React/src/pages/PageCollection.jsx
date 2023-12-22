import { useState, useEffect } from "react";

import { useContextApi } from "../contexts/ContextApi";
import { useContextOverlay } from "../contexts/ContextOverlay";
import { useContextDialog } from "../contexts/ContextDialog";
import { useContextUserAuthentication } from "../contexts/ContextUserAuthentication";
import { useNavigate } from "react-router-dom";

import pagesStyle from "../assets/style/modules/styleForPages.module.css";
import style from "../assets/style/modules/styleForCollectionPage.module.css";
import dialogStyle from "../assets/style/modules/styleForFiltersEditing.module.css";

import { returnErrorMsg } from "../assets/utilities/errorRelatedFunctions";

let allowedFilters = [];

function filterItalianName(filterEnglishName)
{
    switch (filterEnglishName)
    {
        case "title_includes"   :   return "Titolo";
        case "author_id"        :   return "Autore";
        case "category_id"      :   return "Categoria";
        case "visible"          :   return "Foto pubblica";
    }
}

// Nel caso di aggiunta di un nuovo filtro, addFilter sarà true e filtersArrayOrFilterObj sarà un array con uno o più filtri (oggetti)
// Nel caso di modifica di un filtro già valido, addFilter è false e filtersArrayOrFilterObj è un oggetto con una sola chiave ed è l'oggetto da modificare
function CompFiltersEditing(props)
{
    const { addFilter, filtersArrayOrFilterObj, onEventClick } = props;

    console.log("VALORE BOOLEANO: ", addFilter);
    console.log("FILTERS: ", filtersArrayOrFilterObj);

    const [selectedFilter, setSelectedFilter] = useState(null);
    const [filterToHandle, setFilterToHandle] = useState( addFilter ? null : filtersArrayOrFilterObj );

    useEffect( () =>
        {
            if (selectedFilter)
                setFilterToHandle(filtersArrayOrFilterObj[selectedFilter]);
        }, [selectedFilter]);

    function clickOnFilter(index)
    {
        selectedFilter ?? setSelectedFilter(index);
    }

    function setClasses(index)
    {
        if (selectedFilter !== null)
        {
            if (selectedFilter === index)
                return "border-blue-400 text-blue-400 hover:no-underline cursor-default";
            else
                return "hover:no-underline hover:text-black cursor-default";
        }
        else 
            return "";
    }

    return (
        <div className={dialogStyle.dialogView}>
            {
                addFilter &&    <div className={dialogStyle.filterSelectionBox}>
                                    <h2 className={dialogStyle.selectionBoxTitle}>Selezionare il filtro</h2>
                                    <ul className={dialogStyle.filtersList}>
                                        {
                                            filtersArrayOrFilterObj.map( (filterObj, index) => 
                                                <li 
                                                    key={`Filter-Select-${index}`}
                                                    className={dialogStyle.filterItem}
                                                >
                                                    <button 
                                                        className={`${dialogStyle.filterName} ${setClasses(index)}`}
                                                        type="button"
                                                        onClick={ () => clickOnFilter(index) }
                                                    >
                                                        { filterItalianName(Object.keys(filterObj)[0]) }
                                                    </button>
                                                    {
                                                        (selectedFilter === index)
                                                        &&
                                                        <div className={dialogStyle.filterInputBox}>
                                                            
                                                        </div>
                                                    }
                                                </li>)
                                        }
                                    </ul>
                                    <div className={dialogStyle.buttonsGroup}>
                                        <button
                                            className={dialogStyle.buttonsInGroup}
                                            type="button"
                                            onClick={ () => onEventClick(false) }
                                        >
                                            Annulla
                                        </button>
                                        {
                                            (selectedFilter !== null) &&    <button 
                                                                                className={dialogStyle.buttonsInGroup}
                                                                                type="button"
                                                                            >
                                                                                Conferma
                                                                            </button>
                                        }
                                    </div>
                                </div>
            }
        </div>
    )
}

export default function PageCollection()
{
    const [collectionData, setCollectionData] = useState(   {
                                                                "collection"    :   null,
                                                                "pagingData"    :   { 
                                                                                        "current_page"      :   1,
                                                                                        "pictures_per_page" :   4
                                                                                    },                                                                
                                                                "validFilters"  :   "none"
                                                            });
    const [anyQuery, setAnyQuery] = useState(null);
    const [viewForFilterEditor, setViewForFilterEditor] = useState(null);
    const [dialogViewOn, setDialogViewOn] = useState(false);

    const { getPictures, getAllowedFilters } = useContextApi();
    const { incomingError, incomingDialog, resetOverlay } = useContextOverlay();
    const { getDefaultDialogParams, dialogOn, dialogForError } = useContextDialog();
    const { userIsLogged } = useContextUserAuthentication();
    const navigate = useNavigate();

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
            allowedFilters = allowedFiltersResponse.data.allowedFilters;
            console.log("FILTRI RECUPERATI: ", allowedFilters);
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
                                        "validFilters"      :   response.data.valid_filters ?? "none"
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
        if (collectionData.validFilters != "none")
            for (key in collectionData.validFilters)
                queryToReturn += "&filter[".concat(key, "]=", collectionData.validFilters[key]);
        return queryToReturn;
    }

    function clickInDialogView(newData)
    {
        setDialogViewOn(false);
        resetOverlay();
    }

    function addOrModifyFilter(filterToModify = undefined)
    {
        incomingDialog();
        setDialogViewOn(true);
        // In fase di aggiunta filtro, passare al sotto componente i filtri "allowed" non presenti tra i "valid". In questo contesto "filterToModify" è undefined.
        // In fase di modifica passare direttamente il filtro da modificare, ovvero "filterToModify" che, essendo un filtro valido è sicuramente definito.
        if (filterToModify)
            // setViewForFilterEditor(CompFiltersEditing(false, filterToModify));
        setViewForFilterEditor(
            <CompFiltersEditing 
                addFilter={false} 
                filtersArrayOrFilterObj={filterToModify} 
                onEventClick={ (newData) => clickInDialogView(newData) } 
            />);
        else
        {
            let filtersToSelectFrom = [...allowedFilters];
            if (collectionData.validFilters != "none")
            {
                const validFiltersKeys = Object.keys(collectionData.validFilters);
                filtersToSelectFrom = allowedFilters.filter( item =>  (!validFiltersKeys.includes(Object.keys(item)[0])));
            }
            // setViewForFilterEditor(CompFiltersEditing(true, filtersToSelectFrom));
            setViewForFilterEditor(
                <CompFiltersEditing 
                    addFilter={true} 
                    filtersArrayOrFilterObj={filtersToSelectFrom} 
                    onEventClick={ (newData) => clickInDialogView(newData) } 
                />);

        }
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
                                {  dialogViewOn && viewForFilterEditor }
                                {
                                    (userIsLogged)  &&  <div id="collectionVeticalNav">
                                                        </div>
                                }
                                <div id="collectionFiltersAndControls">
                                    <div id="controls">
                                        <div className={style.info}>
                                            <h3>Totale foto:</h3>
                                            <span>
                                                {collectionData.pagingData.total_pictures}
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
                                        <h3 className="text-xl text-blue-800">Filtri di ricerca</h3>
                                        <div id="filtersBox">
                                            {
                                                (collectionData.validFilters == "none")   
                                                ?   <h2 className="text-xl text-slate-950">
                                                        Assenti
                                                    </h2>
                                                :   <>
                                                        {
                                                            Object.keys(collectionData.validFilters).map( filterKey =>
                                                                <div className={style.filterView}>
                                                                    <div className={style.filterUpperGroup}>
                                                                        <span className={style.filterKey}>{filterKey}</span>
                                                                        <button className={`${style.filterBtn} bg-yellow-200 hover:bg-yellow-300`}>
                                                                            <i class="fa-solid fa-pencil"></i>
                                                                        </button>
                                                                        <button className={`${style.filterBtn} bg-red-400 hover:bg-red-700`}>
                                                                            <i class="fa-solid fa-trash-can"></i>
                                                                        </button>
                                                                    </div>
                                                                    <span className={style.filterValue}>{collectionData.validFilters[filterKey]}</span>
                                                                </div>)
                                                        }
                                                    </>
                                            }
                                        </div>
                                        <button className={style.addFilterBtn} type="button" onClick={ () => addOrModifyFilter() }>Aggiungi</button>
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