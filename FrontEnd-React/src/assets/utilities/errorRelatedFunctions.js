export function returnErrorMsg(errorResponse)
{
    console.log("ERRORE ENTRANTE: ", errorResponse);
    let errorMsgs = ["Operazione non eseguibile al momento.", "Riprovare più tardi."];
    if (errorResponse.errorBy === "network")
        errorMsgs = ["Rete non disponibile o instabile.", "Riprovare più tardi."];
    else if (errorResponse.errorBy === "response")
        errorMsgs = [`Errore (${errorResponse.status})`, errorResponse.errorMsg];
    return errorMsgs;
}