import axios from "axios";

// Istanza di Axios che si occuperà di tutte le chiamate al server
const axiosApi = axios.create(
    {
        baseURL :   import.meta.env.VITE_API_URL,
        timeout :   3000,
    });

// Con l'interceptor sulla request, gestiamo la chiamata API prima che essa avvenga, eseguendo un middleware (la funzione passata in .use).
// Il middleware verifica l'eventuale presenza del token e, in caso affermativo, setta automaticamente la chiave di auth tra gli headers.
axiosApi.interceptors.request.use( 
    request     => 
        {
            const token = localStorage.getItem("token");
            if (token)
                request.headers["Authorization"] = `Bearer ${token}`;
            return request;
        });

// Con l'interceptor sulla response, gestiamo la risposta prima che axios risolva la Promise e settiamo opportunamente le chiavi della risposta stessa.
// Il middleware restituirà sempre una Promise risolta, evitando così l'uso del blocco try/catch nel chiamante
axiosApi.interceptors.response.use( 
    response    =>
        {
            response.data = { "outcome" : true, "data" : response.data };
            return response.data;
        },
    error       =>
        {
            let responseObj = { "outcome" : false, "errorBy" : "unknown" };
            if (error.response)
            {
                responseObj.errorBy = "response";
                responseObj["status"] = error.response.status;
                responseObj["errorMsg"] = error.response.data.message;
            }
            else if (error.request)
                responseObj.errorBy = "network";
            return Promise.resolve(responseObj);
        });

export default axiosApi;