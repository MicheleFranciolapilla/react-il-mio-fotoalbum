const   { test, expect }                =   require("@jest/globals");
// Si importano le funzioni da testare
const   { purifySlug, changeObjKey }    =   require("./slugFunctions");

test("Risultato atteso: stringa vuota di ritorno da stringa vuota", () =>
{
    const result = purifySlug("");

    expect(result).toBe("");
});

test("Risultato atteso: ritorno dell'argomento in assenza di dashes", () =>
{
    const result = purifySlug("stringa");

    expect(result).toBe("stringa");
});

test("Risultato atteso: ritorno dell'argomento in assenza di dashes anche se trattasi di stringa numerica", () =>
{
    const result = purifySlug("2");

    expect(result).toBe("2");
});

test("Risultato atteso: ritorno dell'argomento se la parte finale non è del tipo '-numero'", () =>
{
    const result = purifySlug("slugged-text-with-number-at-the-end-not-preceded-by-dash-this-way-x132");

    expect(result).toBe("slugged-text-with-number-at-the-end-not-preceded-by-dash-this-way-x132");
});

test("Risultato atteso: rimozione del numero finale se preceduto da dash", () =>
{
    const result = purifySlug("slug-to-be-purified-13");

    expect(result).toBe("slug-to-be-purified");
});

test("Risultato atteso: 'null' se l'argomento è di tipo number", () =>
{
    const result = purifySlug(116);

    expect(result).toBe(null);
});

test("Risultato atteso: 'null' se l'argomento è di tipo object", () =>
{
    const result = purifySlug({"key" : "value"});

    expect(result).toBe(null);
});

test("Risultato atteso: 'null' se l'argomento è un array", () =>
{
    const result = purifySlug(["array", "as", "argument"]);

    expect(result).toBe(null);
});

test("Risultato atteso: errore specifico per assenza della chiave in uno degli oggetti dell'array", () =>
{
    const arrayToFormat =   [
                                {
                                    "name"  :   "some name",
                                    "prop1" :   "some value"
                                },
                                {
                                    "name"  :   "other name",
                                    "prop2" :   "some value"
                                },
                                {
                                    "prop1" :   "some value"
                                }
                            ];
    const result        =   () => changeObjKey(arrayToFormat, "name");

    expect(result).toThrowError("Proprietà name assente.");
});

test("Risultato atteso: nuovo array copia dell'array passato ma con la proprietà 'name' cambiata in 'title'", () =>
{
    const arrayToFormat =   [
                                {
                                    "name"  :   "some name",
                                    "prop1" :   "some value"
                                },
                                {
                                    "name"  :   "other name",
                                    "prop2" :   "some value"
                                }
                            ];
    const expectedArray =   [
                                {
                                    "title" :   "some name",
                                    "prop1" :   "some value"
                                },
                                {
                                    "title" :   "other name",
                                    "prop2" :   "some value"
                                }
                            ];
    const result        =   changeObjKey(arrayToFormat, "name", "title");

    expect(result).toEqual(expect.arrayContaining(expectedArray));
});