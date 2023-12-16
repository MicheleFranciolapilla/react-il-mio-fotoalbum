const   guestFilters = require("./allowedFilters/guestFilters.json");
const   adminFilters = require("./allowedFilters/adminFilters.json");

function retrieveValidFilters(filtersFromBody, admin)
{
    // OGGETTO IN ENTRATA, ARRAY DI OGGETTI IN USCITA
    const allowedFilters = admin ? adminFilters : guestFilters;
    const filtersKeys = Object.keys(filtersFromBody).map( bodyKey => bodyKey);
    let finalFilters = [];
    console.log("*****************************************");
    console.log("***** RETRIEVE FUNCTION *****************");
    filtersKeys.forEach( bodyKey =>
        {
            console.log("KEY ATTUALE: ", bodyKey, " : ",filtersFromBody[bodyKey]);
            const bodyKeyLC = bodyKey.trim().toLowerCase();
            const index = allowedFilters.findIndex( validFilter => Object.keys(validFilter).includes(bodyKeyLC));
            if (index >= 0)
            {
                const validFilter = allowedFilters[index];
                console.log("VALID FILTER: ", validFilter);
                console.log
                const validType = Object.values(validFilter)[0];
                if  ((validType === "number") && (!isNaN(parseInt(filtersFromBody[bodyKey]))))
                    finalFilters.push({ [bodyKeyLC] : parseInt(filtersFromBody[bodyKey]) })
                else if (typeof filtersFromBody[bodyKey] === validType)
                    finalFilters.push({ [bodyKeyLC] : filtersFromBody[bodyKey] })
            }
        });
    console.log("FINALE: ", finalFilters);
    console.log("*****************************************");
    return finalFilters;
}

function avoidDuplicates(filtersToFix, firstIsValid)
{
    // ARRAY DI OGGETTI IN ENTRATA, OGGETTO IN USCITA
    let arrayToReduce = [...filtersToFix];
    if (firstIsValid)
        arrayToReduce.reverse();
    let objToReturn = {};
    arrayToReduce.forEach( item =>
        {
            const itemKey = Object.keys(item)[0];
            const itemValue = Object.values(item)[0];
            objToReturn[itemKey] = itemValue;
        });
    return objToReturn;
}

module.exports = { retrieveValidFilters, avoidDuplicates };