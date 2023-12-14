module.exports  =   function(value, slugObjTitles = false)
                    {
                        // Se non è richiesta la restituzione di un oggetto si ritorna la solo stringa dello slug
                        if (!slugObjTitles)
                            return slugSingleString(value);
                        else if ((typeof value != "object") || (!Array.isArray(value)) || (value.length == 0))
                                throw new Error("Array dei posts assente o parametro di tipo errato (deve essere un array)");
                        else
                        {
                            let arrayForChecks = [];
                            let resultingArray = [];
                            resultingArray = value.map( singleObj   =>
                                {
                                    const rawSlug = slugSingleString(singleObj.title);
                                    if (rawSlug == "")
                                    {
                                        // Caso che implica uno slug con la sola parte finale "-numericEndPoint". Non gestito in questa funzione
                                    }
                                    let numericEndPoint = 1;
                                    let candidateSlug = rawSlug.concat("-", numericEndPoint.toString().trim());
                                    for (let index = 0; index < arrayForChecks.length; index++)
                                    {
                                        const currentSlug = arrayForChecks[index].slug;
                                        if (currentSlug == candidateSlug)
                                        {
                                            numericEndPoint++;
                                            candidateSlug = rawSlug.concat("-", numericEndPoint.toString().trim());
                                            index = -1;
                                        }
                                    }
                                    arrayForChecks.push({slug : candidateSlug});
                                    return { ...singleObj, slug : candidateSlug, basicSlug : rawSlug };
                                });
                            return resultingArray;
                        }
                    }

function slugSingleString(value)
{
    // Arrays di riferimento
    const unAllowedChars    =   ["!", '"', "#", "$", "%", "&", "'", "(", ")", "=", "~", "^", "`", "@", "[", "{", "}", "]", ":", ";", "+", "*", "<", ",", ">", ".", "?", "/"];
    const unAllowedVowels   =   ["à", "è", "ì", "ò", "ù"];
    const allowedVowels     =   ["a", "e", "i", "o", "u"];
                        
    // Si verifica subito che il parametro "value" sia una stringa, altrimenti il programma lancia un errore e si interrompe
    if (typeof value !== "string")
        throw new Error("Tipo dato non conforme (non stringa)");

    let text = value;

    // La manipolazione della stringa inizia con la rimozione dei caratteri indesiderati
    for (let index = 0; index < text.length; index++)
    {
        if (unAllowedChars.includes(text[index]))
        {
            text = text.slice(0, index) + text.slice(index + 1);
            index--;
        }
    }

    // Si sostituiscono le vocali accentate con vocali atone
    for (let index = 0; index < unAllowedVowels.length; index++)
        text = text.replaceAll(unAllowedVowels[index], allowedVowels[index]);

    // Si sostituiscono spazi e underscores con "dashes"
    text = text.replaceAll(/[ _]/g, "-");

    // Si riducono ad un solo dash "-" tutti i dashes affiancati
    while (text.indexOf("--") != -1)
        text = text.replaceAll("--", "-");

    // Se agli estremi della stringa vi è un dash lo si rimuove
    if (text[0] == "-")
        text = text.slice(1);
    if (text[text.length - 1] == "-")
        text = text.slice(0, -1);

    // Si ritorna la stringa in lowercase
    return text.toLowerCase();
};