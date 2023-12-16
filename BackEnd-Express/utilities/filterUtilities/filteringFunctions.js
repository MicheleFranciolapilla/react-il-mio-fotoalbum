const   guestFilters = require("./allowedFilters/guestFilters.json");
const   adminFilters = require("./allowedFilters/adminFilters.json");
const   guestQueries = require("./allowedQueries/guestQueries.json");
const   adminQueries = require("./allowedQueries/adminQueries.json");

function boolOf(boolStr)
{
    console.log("BOOLSTR: ", boolStr, " - ", typeof boolStr);
    return ["true", "1"].includes(boolStr.trim().toLowerCase());
}

function retrieveValidFilters(filtersFromBody, admin)
{
    // OGGETTO IN ENTRATA, ARRAY DI OGGETTI IN USCITA
    const allowedFilters = admin ? adminFilters : guestFilters;
    const filtersKeys = Object.keys(filtersFromBody).map( bodyKey => bodyKey);
    let finalFilters = [];
    filtersKeys.forEach( bodyKey =>
        {
            const bodyKeyLC = bodyKey.trim().toLowerCase();
            const index = allowedFilters.findIndex( validFilter => Object.keys(validFilter).includes(bodyKeyLC));
            if (index >= 0)
            {
                const validFilter = allowedFilters[index];
                const validType = Object.values(validFilter)[0];
                if  ((validType === "number") && (!isNaN(parseInt(filtersFromBody[bodyKey]))))
                    finalFilters.push({ [bodyKeyLC] : parseInt(filtersFromBody[bodyKey]) });
                else if ((validType === "boolean") && (["false", "0", "true", "1"].includes(filtersFromBody[bodyKey].trim().toLowerCase())))
                    finalFilters.push({ [bodyKeyLC] : boolOf(filtersFromBody[bodyKey]) });
                else if (typeof filtersFromBody[bodyKey] === validType)
                    finalFilters.push({ [bodyKeyLC] : filtersFromBody[bodyKey] });
            }
        });
    return finalFilters;
}

function avoidDuplicates(filtersToFix, firstIsValid, stringValueToLowerCase)
{
    // ARRAY DI OGGETTI IN ENTRATA, OGGETTO IN USCITA
    let arrayToReduce = [...filtersToFix];
    if (firstIsValid)
        arrayToReduce.reverse();
    let objToReturn = {};
    arrayToReduce.forEach( item =>
        {
            const itemKey = Object.keys(item)[0];
            let itemValue = Object.values(item)[0];
            if (stringValueToLowerCase && typeof itemValue === "string")
                itemValue = itemValue.trim().toLowerCase();
            objToReturn[itemKey] = itemValue;
        });
    return objToReturn;
}

function buildWhereQuery(initialWhereQuery, filtersObj, admin)
{
    // OGGETTO IN ENTRATA E QUERY OBJECT (WHERE) IN USCITA
    const queryPattern = admin ? adminQueries : guestQueries;
    let query = { ...initialWhereQuery["where"] };
    for (key in filtersObj)
    {
        const currentPattern = queryPattern.find( item => Object.keys(item).includes(key) );
        const pattern = Object.values(currentPattern)[0];
        const splittedPattern = pattern.split("//");
        let currentObjectValue = filtersObj[key];
        for (let index = splittedPattern.length - 1; index >= 1; index--)
        {
            let currentObjectKey = splittedPattern[index];
            let currentObject = { [currentObjectKey] : currentObjectValue };
            currentObjectValue = currentObject;
        }

        query[splittedPattern[0]] = currentObjectValue;
    }
    const result = {where : query};
    return result;
}

module.exports = { retrieveValidFilters, avoidDuplicates, buildWhereQuery };