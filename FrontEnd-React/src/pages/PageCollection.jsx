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
let users = [];
let categories = [];

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

// Nel caso di aggiunta di un nuovo filtro, addFilter sarà true e filtersArray sarà un array con uno o più filtri (oggetti)
// Nel caso di modifica di un filtro già valido, addFilter è false e filtersArray è un array con all'interno un unico oggetto, quello da modificare
function CompFiltersEditing(props)
{
    const { addFilter, filtersArray, onEventClick } = props;

    console.log("VALORE BOOLEANO: ", addFilter);
    console.log("FILTERS: ", filtersArray);

    // Se siamo in fase di aggiunta di un filtro allora, all'avvio del componente, selectedFilter dovrà essere null, in caso contrario sarà definito (0)
    const [selectedFilter, setSelectedFilter] = useState( addFilter ? null : 0 );
    const [filterToHandle, setFilterToHandle] = useState( addFilter ? null : filtersArray[0] );

    useEffect( () =>
        {
            if (selectedFilter !== null)
            {
                console.log("Selected Filter ha cambiato stato");
                const initializedFilter = initializeSelectedFilter();
                setFilterToHandle(initializedFilter);
            }
        }, [selectedFilter]);

    function initializeSelectedFilter()
    {
        const initializedFilterKey =  Object.keys(filtersArray[selectedFilter])[0];
        let initializedFilterValue = "";
        switch (filtersArray[selectedFilter][initializedFilterKey])
        {
            case "boolean"  :   break;
            case "number"   :   initializedFilterValue = 0;
                                break;
        }
        return { initializedFilterKey : initializedFilterValue };
    }

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

    function inputType()
    {
    }

    return (
        <div className={dialogStyle.dialogView}>
            <div className={dialogStyle.filterSelectionBox}>
                <h2 className={dialogStyle.selectionBoxTitle}>
                    { addFilter ? "Selezionare il filtro" : "Modifica filtro" }
                </h2>
                <ul className={dialogStyle.filtersList}>
                    {
                        filtersArray.map( (filterObj, index) => 
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
                                    (selectedFilter === index) &&   <form 
                                                                        id="addOrModifyFilterForm" 
                                                                        className={dialogStyle.filterInputBox}
                                                                    >

                                                                    </form>
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
                                                            type="submit"
                                                            form="addOrModifyFilterForm"
                                                        >
                                                            Conferma
                                                        </button>
                    }
                </div>
            </div>
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

    const { getPictures, getAllowedFilters, getAllUsers, getAllCategories } = useContextApi();
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
            // Prevedere il caso in cui outcome sia false (per ogni chiamata) e lanciare opportuno messaggio di errore
            const allowedFiltersResponse = await getAllowedFilters(userIsLogged);
            allowedFilters = allowedFiltersResponse.data.allowedFilters;
            console.log("FILTRI RECUPERATI: ", allowedFilters);
            // Ci sarà sicuramente almeno uno user (il super admin)
            const allUsers = await getAllUsers();
            users = allUsers.data.users;
            console.log("USERS RECUPERATI: ", users);
            if (userIsLogged)
            {
                const allCategories = await getAllCategories();
                categories = allCategories.data.categories;
                // Inseriamo nell'array delle categorie, in prima posizione, una categoria con id negativo (-1) e name ("Nessuna"), quindi, anche questo array non potrà essere vuoto
                categories.splice(0, 0, { "id" : -1, "name" : "Nessuna" });
                console.log("CATEGORIE RECUPERATE: ", categories);
            }
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
        // Nella fase di modifica, il filtro da modificare lo si passa come elemento unico di un array, in questo modo, nel componente si gestisce sempre un array con uno o più filtri al proprio interno
        if (filterToModify)
            // setViewForFilterEditor(CompFiltersEditing(false, filterToModify));
        setViewForFilterEditor(
            <CompFiltersEditing 
                addFilter={false} 
                filtersArray={[filterToModify]} 
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
                    filtersArray={filtersToSelectFrom} 
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