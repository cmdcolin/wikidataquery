define([
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/_base/array',
    'dojo/request/xhr',
    'dojo/io-query',
    'JBrowse/Store/SeqFeature/SPARQL',
    'JBrowse/Store/LRUCache'
],
function(
    declare,
    lang,
    array,
    xhr,
    ioQuery,
    SPARQL,
    LRUCache
) {
    return declare(SPARQL, {
        constructor: function() {
            console.log('here');
            
        },

        getFeatures: function( query, featCallback, finishCallback, errorCallback ) {
            var thisB = this;
            var cache = this.featureCache = this.featureCache || new LRUCache({
                name: 'wikiDataFeatureCache',
                fillCallback: dojo.hitch( this, '_readChunk' ),
                sizeFunction: function( features ) {
                    return features.length;
                },
                maxSize: 100000 // cache up to 100,000 BAM features
            });
            query.toString = function() {
                return query.ref+','+query.start+','+query.end;
            };
            var chunkSize = 100000;

            var s = query.start - query.start % chunkSize;
            var e = query.end + (chunkSize - (query.end % chunkSize));
            var chunks = [];

            var chunksProcessed = 0;
            var haveError = false;
            for (var start = s; s < e; s += chunkSize) {
                var chunk = { ref: query.ref, start: s, end: s+chunkSize };
                chunk.toString = function() {
                    return query.ref+','+query.start+','+query.end;
                }
                chunks.push(chunk);
            }
            
            array.forEach( chunks, function( c ) {
                cache.get( c, function( f, e ) {
                    if( e && !haveError )
                        errorCallback(e);
                    if(( haveError = haveError || e )) {
                        return;
                    }
                    var feats = thisB._resultsToFeatures( f, function(feature) {
                        if( feature.get('start') > query.end ) // past end of range, can stop iterating
                            return;
                        else if( feature.get('end') >= query.start ) // must be in range
                            featCallback( feature );
                    });

                    if( ++chunksProcessed == chunks.length ) {
                        finishCallback();
                    }
                });
            });
        },
        _readChunk: function(query, callback) {
            var thisB = this;
            var backoff = 200;
            var headers = {
                "Accept": "application/json",
                "X-Requested-With": null
            };
            this.queryTemplate = "PREFIX wdt: <http://www.wikidata.org/prop/direct/> \
                PREFIX wd: <http://www.wikidata.org/entity/> \
                PREFIX qualifier: <http://www.wikidata.org/prop/qualifier/> \
                SELECT ?start ?end ?uniqueID ?strand ?uri ?entrezGeneID ?name ?description ?refSeq \
                WHERE { \
                    ?gene wdt:P279 wd:Q7187; wdt:P703 ?strain; wdt:P351 ?uniqueID; wdt:P351 ?entrezGeneID; wdt:P2393 ?name; rdfs:label ?description; wdt:P644 ?start; wdt:P645 ?end; wdt:P2548 ?wdstrand ; p:P644 ?chr. \
                  OPTIONAL { \
                        ?chr qualifier:P2249 ?refSeq. \
                          FILTER(LANG(?description) = \"en\"). \
                    } \
                  FILTER(?refSeq = \"{ref}\") ?strain wdt:P685 '{species}'. bind( IF(?wdstrand = wd:Q22809680, '1', '-1') as ?strand). bind(str(?gene) as ?uri). filter ( !(xsd:integer(?start) > {end} || xsd:integer(?end) < {start})) \
                }";

            console.log(thisB._makeQuery(query));

            xhr.get( this.url+'?'+ioQuery.objectToQuery({ query: thisB._makeQuery(query) }), {
                headers: headers,
                handleAs: "json",
                failOk: true
            }).then( function(o) {
                callback(o)
            }, function(e) {
                setTimeout(function() {
                    thisB._readChunk( query, callback );
                }, query.backoff);

                if(query.backoff) {
                    query.backoff *= 2;
                } else {
                    query.backoff = 200;
                }
            });
        }
    });
});

