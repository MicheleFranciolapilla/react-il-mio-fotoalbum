const   guestFilters = require("./allowedFilters/guestFilters.json");
const   adminFilters = require("./allowedFilters/adminFilters.json");

function retrieveValidFilters(filtersFromBody, admin)
{
    const allowedFilters = admin ? adminFilters : guestFilters;
    const filtersKeys = Object.keys(filtersFromBody).map( bodyKey => bodyKey.trim().toLowerCase());
    let finalFilters = [];
    console.log("*****************************************");
    console.log("***** RETRIEVE FUNCTION *****************");
    filtersKeys.forEach( bodyKey =>
        {
            console.log("KEY ATTUALE: ", bodyKey, " : ",filtersFromBody[bodyKey]);
            const index = allowedFilters.findIndex( validFilter => Object.keys(validFilter).includes(bodyKey));
            if (index >= 0)
            {
                console.log("VALID FILTER: ", validFilter);
                const validFilter = allowedFilters[index];
                console.log
                const validType = Object.values(validFilter)[0];
                if  ((validType === "number") && (!isNaN(parseInt(filtersFromBody[bodyKey]))))
                    finalFilters.push({ [bodyKey] : parseInt(filtersFromBody[bodyKey]) })
                else if (typeof filtersFromBody[bodyKey] === validType)
                    finalFilters.push({ [bodyKey] : filtersFromBody[bodyKey] })
            }
        });
    console.log("*****************************************");
    return finalFilters;
}

module.exports = { retrieveValidFilters };