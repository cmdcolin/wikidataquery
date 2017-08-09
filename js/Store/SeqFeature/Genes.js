define([
    'dojo/_base/declare',
    'dojo/_base/lang',
    './SPARQL'
],
function (
    declare,
    lang,
    SPARQL
) {
    return declare(SPARQL, {
        _readChunk: function () {
            this.queryTemplate = 'PREFIX wdt: <http://www.wikidata.org/prop/direct/>' +
                ' PREFIX wd: <http://www.wikidata.org/entity/>  ' +
                ' PREFIX qualifier: <http://www.wikidata.org/prop/qualifier/> ' +
                ' SELECT ?start ?end ?uniqueID ?strand ?uri ?entrezGeneID ?name ?description ?refSeq ' +
                ' WHERE { ' +
                    ' ?featureType wdt:P279 wd:Q7187; wdt:P703 ?strain; wdt:P351 ?uniqueID; wdt:P351 ?entrezGeneID; wdt:P2393 ?name; rdfs:label ?description; wdt:P644 ?start; wdt:P645 ?end; wdt:P2548 ?wdstrand ; p:P644 ?chr. ' +
                    ' OPTIONAL {  ' +
                        ' ?chr qualifier:P2249 ?refSeq. ' +
                        "  FILTER(LANG(?description) = 'en'). " +
                    ' } ' +
                  " FILTER(?refSeq = '{ref}') ?strain wdt:P685 '{organism}'. bind( IF(?wdstrand = wd:Q22809680, '1', '-1') as ?strand). bind(str(?featureType) as ?uri). filter ( !(xsd:integer(?start) > {end} || xsd:integer(?end) < {start})) " +
                ' }';
            this.inherited(arguments);
        }
    });
});

