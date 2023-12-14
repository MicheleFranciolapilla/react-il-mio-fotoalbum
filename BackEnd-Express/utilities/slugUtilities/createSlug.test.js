// Si importano i metodi necessari dalla libreria Jest
const   { test, expect }    =   require("@jest/globals");
// Si importa la funzione da testare
const   createSlug          =   require("./createSlug");

// Si implementano i vari tests:
// In tutti i casi si può selezionare un ritorno di stringa (returnObj = false [DEFULT]) o di oggetto (returnObj = true)

test("Risultato atteso: lowercase del testo", () =>
    {
        const   testo   =   "tANto";
        const   result  =   createSlug(testo);

        expect(result).toBe("tanto");
    });

test("Risultato atteso: errore specifico con tipo dato non conforme (non stringa)", () =>
    {
        const   testo   =   1625.373;
        const   result  =   ()  =>  createSlug(testo);

        expect(result).toThrowError("Tipo dato non conforme (non stringa)");
    });

test("Risultato atteso: sostituzione di spazi e underscore con dash", () =>
    {
        const   testo   =   " tANto va_LA gaTTa AL LARdo cHe_ci LascIa lO ZamPiNO ";
        const   result  =   createSlug(testo);

        expect(result).toBe("tanto-va-la-gatta-al-lardo-che-ci-lascia-lo-zampino");
    });   

test("Risultato atteso: rimozione dei dash ripetuti e del dash alla fine o all'inizio", ()  =>
    {
        const   testo   =   "-  tANto __-- _va_LA gaTTa  --- AL LARdo_ _cHe_ci-  _ LascIa__ lO ZamPiNO-_ _";
        const   result  =   createSlug(testo);

        expect(result).toBe("tanto-va-la-gatta-al-lardo-che-ci-lascia-lo-zampino");
    });

test("Risultato atteso: rimozione dei caratteri speciali", ()  =>
    {
        const   testo   =   "% -  tAN;<to __-+- _va_LA gaT==Ta  --- AL L##ARdo_ _cH@@e_ci- @ _ LascIa__ ??<lO ZamPiNO-_ _. @";
        const   result  =   createSlug(testo);

        expect(result).toBe("tanto-va-la-gatta-al-lardo-che-ci-lascia-lo-zampino"); 
    });

test("Risultato atteso: rimozione degli accenti dalle vocali", ()  =>
    {
        const   testo   =   "è più bello partecipare senza vincere anzichè restare lì in città in disparte a guardare ";
        const   result  =   createSlug(testo);

        expect(result).toBe("e-piu-bello-partecipare-senza-vincere-anziche-restare-li-in-citta-in-disparte-a-guardare"); 
    });

test("Risultato atteso: errore specifico per assenza dell'array dei posts", () =>
    {
        const   result  =   ()  =>  createSlug([], true);
    
        expect(result).toThrowError("Array dei posts assente o parametro di tipo errato (deve essere un array)");
    });
    
test("Risultato atteso: errore specifico per variabile relativa all'array dei posts, diversa da array", () =>
    {
        const   result  =   ()  =>  createSlug({}, true);
    
        expect(result).toThrowError("Array dei posts assente o parametro di tipo errato (deve essere un array)");
    });

test("Risultato atteso: array di oggetti in cui vengono mantenute tutte le proprietà pregresse con l'aggiunta di due nuove proprietà, ovvero: 'basicslug', cui è assegnato il valore dello slug ''puro'' (del titolo) e 'slug', che sarà uguale allo slug ''puro'' con aggiunta, in coda, del dash (-) seguito da un numero indicante il numero delle occorrenze precedenti + 1. (Per chiarezza vedere gli array riportati di seguito)", () =>
{
    const   postsArray  =   [
                                {
                                   "id": 100,
                                   "title": "Ciambellone"
                                },
                                {
                                   "id": 105,
                                   "title": "Barbabietola buona"
                                },
                                {
                                   "id": 110,
                                   "title": "Barbabietola buona-1",
                                   "image": "/imgs/pasta_barbabietola.jpeg"
                                },
                                {
                                   "title": "Pane fritto dolce",
                                   "tags":  [
                                                "Ricette vegetariane"
                                            ]
                                },
                                {
                                    "title": "Barbabietola buona"
                                }
                            ];
    const   expArray    =   [
                                {
                                   "id": 100,
                                   "title": "Ciambellone",
                                   "slug": "ciambellone-1",
                                   "basicSlug": "ciambellone",
                                },
                                {
                                   "id": 105,
                                   "title": "Barbabietola buona",
                                   "slug": "barbabietola-buona-1",
                                   "basicSlug": "barbabietola-buona",
                                },
                                {
                                   "id": 110,
                                   "title": "Barbabietola buona-1",
                                   "slug": "barbabietola-buona-1-1",
                                   "basicSlug": "barbabietola-buona-1",
                                   "image": "/imgs/pasta_barbabietola.jpeg"
                                },
                                {
                                   "title": "Pane fritto dolce",
                                   "slug": "pane-fritto-dolce-1",
                                   "basicSlug": "pane-fritto-dolce",
                                   "tags":  [
                                                "Ricette vegetariane"
                                            ]
                                },
                                {
                                    "title": "Barbabietola buona",
                                    "slug": "barbabietola-buona-2",
                                    "basicSlug": "barbabietola-buona",
                                }
                            ];
    const   result      =   createSlug(postsArray, true);
    expect(result).toEqual(expect.arrayContaining(expArray));
});