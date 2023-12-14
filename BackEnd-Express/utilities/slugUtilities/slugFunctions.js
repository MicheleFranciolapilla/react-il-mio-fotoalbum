const   createSlug  =   require("./createSlug");

function slugger(textToSlug, checkArray = false, arrayToCheck = [])
{
    let candidateSlug = createSlug(textToSlug);
    if ((candidateSlug != "") && checkArray && arrayToCheck && (arrayToCheck.length != 0))
    {
        let numericEndPoint = 1;
        let currentSlug = candidateSlug.concat("-1");
        for (let index = 0; index < arrayToCheck.length; index++)
        {
            if (currentSlug == arrayToCheck[index].slug)
            {
                numericEndPoint++;
                index = -1;
                currentSlug = candidateSlug.concat("-", numericEndPoint.toString().trim());
            }
        }
        return currentSlug;
    }
    if (candidateSlug != "")
        candidateSlug += "-1";
    return candidateSlug;
    
}

function pureSlug(textToSlug)
{
    return createSlug(textToSlug);
}

function purifySlug(sluggedText)
{
    if (!(typeof sluggedText === "string"))
        return null;
    let splitted = sluggedText.split("-");
    if ((splitted.length <= 1) || (isNaN(splitted[splitted.length - 1])))
        return sluggedText;
    splitted.splice(splitted.length - 1, 1);
    return splitted.join("-");
}

function changeObjKey(arrayToFormat, keyToChange, newKey = "title")
{
    if (!arrayToFormat || !Array.isArray(arrayToFormat) || (arrayToFormat.length == 0))
        return [];
    const arrayToReturn = arrayToFormat.map( singleObj=> 
        {
            if (singleObj.hasOwnProperty(keyToChange))
            {
                newObj = {...singleObj, [newKey] : singleObj[keyToChange]};
                delete newObj[keyToChange];
                return newObj;
            }
            else
                throw new Error(`Proprietà ${keyToChange} assente.`);
        });
    return arrayToReturn;
}

module.exports = { slugger, pureSlug, purifySlug, changeObjKey }