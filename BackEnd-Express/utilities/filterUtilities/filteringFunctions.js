const   guestFilters = require("./allowedFilters/guestFilters.json");
const   adminFilters = require("./allowedFilters/adminFilters.json");

function retrieveValidFilters(filtersFromBody, admin)
{
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
    console.log("*****************************************");
    return finalFilters;
}

module.exports = { retrieveValidFilters };