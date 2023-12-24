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
let authors = [];
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
    const [filterToHandle, setFilterToHandle] = useState( addFilter ? null : {...filtersArray[0]} );
    const [inputType, setInputType] = useState( addFilter ? null : getInputType() );

    useEffect( () =>
        {
            if ((selectedFilter !== null) && (addFilter))
            {
                console.log("Selected Filter ha cambiato stato");
                const initializedFilter = initializeSelectedFilter();
                setFilterToHandle(initializedFilter);
            }
        }, [selectedFilter]);

    useEffect( () =>
        {
            if (filterToHandle !== null)
            {
                const inputTypeToSet = getInputType();
                // console.log("INPUT TYPE: ", inputTypeToSet);
                setInputType(inputTypeToSet);
            }
        }, [filterToHandle]);

    function getKeyFromFilterToHandle()
    {
        const key = Object.keys(filterToHandle)[0];
        return key;
    }

    function getValueFromFilterToHandle()
    {
        const value = Object.values(filterToHandle)[0];
        return value;
    }

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
        return { [initializedFilterKey] : initializedFilterValue };
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

    function getInputType()
    {
        // console.log("INTERO FILTER TO HANDLE: ", filterToHandle);
        // console.log("INTERO ALLOWED FILTERS: ", allowedFilters);
        const filterKey = getKeyFromFilterToHandle();
        const filterFromAllowedArray = allowedFilters.find( filterToCheck => Object.keys(filterToCheck)[0] == filterKey );
        const filterType = Object.values(filterFromAllowedArray)[0];
        return filterType;
    }

    function updateValue(newValue, filterName, inputIdentifier)
    {
        let filterValue = newValue;
        if (inputIdentifier === "string")
            filterValue = filterValue.toLowerCase();
        const newFilterObj = { [filterName] : filterValue }
        setFilterToHandle(newFilterObj);
    }

    function isValidStringInput()
    {
        const inputToValidate = getValueFromFilterToHandle().trim();
        if (inputToValidate == "") 
            return false;
        const regex = /^[a-z0-9\s]*$/;
        return regex.test(inputToValidate);
    }

    function eventSubmit(event)
    {
        event.preventDefault();
        if (inputType == "string")
        {
            if (isValidStringInput())
                onEventClick({ [getKeyFromFilterToHandle()] : getValueFromFilterToHandle().trim() }, { "error" : false });
            else
                onEventClick(null, { "error" : true, "msg" : "Filtro non valido!" });
        }
        else if (inputType == "number")
            onEventClick({ [getKeyFromFilterToHandle()] : getValueFromFilterToHandle() }, { "error" : false });
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
                                                                        onSubmit={ (event) => eventSubmit(event) }
                                                                    >
                                                                        {
                                                                            (inputType !== null) &&
                                                                            (<>
                                                                                {
                                                                                    (inputType === "string") &&
                                                                                    <input
                                                                                        type="text"
                                                                                        placeholder="testo da cercare nel titolo..."
                                                                                        min="3"
                                                                                        max="100"
                                                                                        value={getValueFromFilterToHandle()}
                                                                                        onChange=   { 
                                                                                                        (event) => 
                                                                                                            updateValue(
                                                                                                                event.target.value, 
                                                                                                                getKeyFromFilterToHandle(),
                                                                                                                "string") 
                                                                                                    }
                                                                                    />
                                                                                }
                                                                                {
                                                                                    (inputType === "boolean") &&
                                                                                    <input type="radio" />
                                                                                }
                                                                                {
                                                                                    (inputType === "number") &&
                                                                                    <select 
                                                                                        className={dialogStyle.selectBox}
                                                                                        name={getKeyFromFilterToHandle()}
                                                                                        value={getValueFromFilterToHandle()}
                                                                                        onChange=   {
                                                                                                        (event) =>
                                                                                                            updateValue(
                                                                                                                event.target.value,
                                                                                                                getKeyFromFilterToHandle(),
                                                                                                                "select")
                                                                                                    }
                                                                                    >
                                                                                        {
                                                                                            (getKeyFromFilterToHandle() == "author_id")
                                                                                            &&
                                                                                            authors.map( author => 
                                                                                                <option
                                                                                                    key={`author-${author.id}`}
                                                                                                    value={author.id}
                                                                                                >
                                                                                                    { author.name }
                                                                                                </option>)
                                                                                        }
                                                                                        {
                                                                                            (getKeyFromFilterToHandle() == "category_id")
                                                                                            &&
                                                                                            categories.map( category => 
                                                                                                <option
                                                                                                    key={`category-${category.id}`}
                                                                                                    value={category.id}
                                                                                                >
                                                                                                    { category.name }
                                                                                                </option>)
                                                                                        }
                                                                                    </select>
                                                                                }
                                                                            </>)
                                                                        }
                                                                    </form>
                                }
                            </li>)
                    }
                </ul>
                <div className={dialogStyle.buttonsGroup}>
                    <button
                        className={dialogStyle.buttonsInGroup}
                        type="button"
                        onClick={ () => onEventClick(null, { "error" : false }) }
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
            const allAuthors = await getAllUsers();
            authors = allAuthors.data.users;
            authors.forEach( author => author.name += " ".concat(author.surname));
            // Inseriamo nell'array degli authors, in prima posizione, uno user con id negativo (-1) e name ("Tutti - Nessun filtro"), il che implica una NON SELEZIONE
            authors.splice(0,0, { "id" : -1, "name" : "Tutti (Nessun filtro)" });
            console.log("AUTORI RECUPERATI: ", authors);
            if (userIsLogged)
            {
                const allCategories = await getAllCategories();
                categories = allCategories.data.categories;
                // Inseriamo nell'array delle categorie, in prima posizione, una categoria con id negativo (-1) e name ("Tutte - Nessun filtro"), il che implica una NON SELEZIONE
                categories.splice(0, 0, { "id" : -1, "name" : "Tutte (Nessun filtro)" });
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
            for (let key in collectionData.validFilters)
                queryToReturn += "&filter[".concat(key, "]=", collectionData.validFilters[key]);
        return queryToReturn;
    }

    function clickInDialogView(newData, anyError)
    {
        console.log("DATI RICEVUTI DA SUB COMPONENTE: ",);
        console.log("NEWDATA: ", newData);
        console.log("ANYERROR: ", anyError);
        if (anyError.error)
        {
            incomingError();
            dialogForError();
            const errorDialogParams = getDefaultDialogParams();
            dialogOn(   {
                            ...errorDialogParams, 
                            "title"             :   "ERRORE", 
                            "message1"          :   anyError.msg,
                            "twoButtons"        :   false,
                            "timingClose"       :   true,
                            "timerMsec"         :   3000,
                            "functionTiming"    :   () =>
                                                        {
                                                            setDialogViewOn(false);
                                                            resetOverlay();
                                                        }
                        });
        }
        else
        {
            if (newData)
            {
                let validFiltersQuery = setFiltersQuery();
                console.log("VALID FILTERS QUERY PRE FIXING: ", validFiltersQuery);
                if (validFiltersQuery !== "")
                {
                    const splittedFiltersQuery = validFiltersQuery.split("&").filter( filterQuery => 
                        (!filterQuery.startsWith(`filter[${Object.keys(newData)[0]}]=`)));
                    validFiltersQuery = splittedFiltersQuery.join("&");
                    if (validFiltersQuery !== "")
                        validFiltersQuery = "&" + validFiltersQuery;
                }
                console.log("VALID FILTERS QUERY POST FIXING: ", validFiltersQuery);
                let currentQuery = `&filter[${Object.keys(newData)[0]}]=${Object.values(newData)[0]}`;
                if (["author_id", "category_id"].includes(Object.keys(newData)[0]) && (parseInt(Object.values(newData)[0]) < 1))
                    currentQuery = "";
                changeData("filters", currentQuery.concat(validFiltersQuery));
            }
            setDialogViewOn(false);
            resetOverlay();
        }
    }

    function addOrModifyFilter(filterToModify = undefined)
    {
        console.log("DATI PRONTI PER LA MODIFICA: ", filterToModify);
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
                onEventClick={ (newData, anyError) => clickInDialogView(newData, anyError) } 
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
                    onEventClick={ (newData, anyError) => clickInDialogView(newData, anyError) } 
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
        console.log("FILTERSQUERY IN CHANGE DATA: ", filtersQuery);
        setAnyQuery(`?page=${CP}&itemsxpage=${PPP}${filtersQuery}`);
    }

    function filterValueToShow(filterKey)
    {
        let valuesArray = null;
        if (filterKey === "author_id")
            valuesArray = authors;
        else if (filterKey === "category_id")
            valuesArray = categories;
        let valueToShow = collectionData.validFilters[filterKey];
        if (valuesArray)
        {
            const itemById = valuesArray.find( item => item.id == valueToShow );
            valueToShow = itemById.name;
        }
        return valueToShow;
    }

    function canAddMoreFilter()
    {
        if  (((collectionData.validFilters === "none") && (allowedFilters.length !== 0)) 
            ||
            (Object.keys(collectionData.validFilters).length) < allowedFilters.length)
            return true;
        else
            return false;
    }

    function deleteFilter(filterKey)
    {
        let validFiltersQuery = setFiltersQuery();
        const splittedFiltersQuery = validFiltersQuery.split("&").filter( filterQuery => 
            (!filterQuery.startsWith(`filter[${filterKey}]=`)));
        validFiltersQuery = splittedFiltersQuery.join("&");
        if (validFiltersQuery !== "")
            validFiltersQuery = "&" + validFiltersQuery;
        changeData("filters", validFiltersQuery);
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
                                                            Object.keys(collectionData.validFilters).map( (filterKey, index) =>
                                                                <div key={`valid-filter-nr-${index}`} className={style.filterView}>
                                                                    <div className={style.filterUpperGroup}>
                                                                        <span className={style.filterKey}>{filterKey}</span>
                                                                        <button 
                                                                            className={`${style.filterBtn} bg-yellow-200 hover:bg-yellow-300`}
                                                                            onClick=    { 
                                                                                            () => 
                                                                                                addOrModifyFilter({ [filterKey] : collectionData.validFilters[filterKey] }) 
                                                                                        }
                                                                        >
                                                                            <i class="fa-solid fa-pencil"></i>
                                                                        </button>
                                                                        <button 
                                                                            className={`${style.filterBtn} bg-red-400 hover:bg-red-700`}
                                                                            onClick={ () => deleteFilter(filterKey) }
                                                                        >
                                                                            <i class="fa-solid fa-trash-can"></i>
                                                                        </button>
                                                                    </div>
                                                                    <span className={style.filterValue}>
                                                                        {filterValueToShow(filterKey)}
                                                                    </span>
                                                                </div>)
                                                        }
                                                    </>
                                            }
                                        </div>
                                        <button 
                                            disabled={!canAddMoreFilter()}
                                            className={`${style.addFilterBtn} ${!canAddMoreFilter() && style.addFilterBtnDisabled}`} 
                                            type="button" 
                                            onClick={ () => addOrModifyFilter() }
                                        >
                                            Aggiungi
                                        </button>
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