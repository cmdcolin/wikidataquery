define([
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/_base/array',
    'dojo/request/xhr',
    'dojo/io-query',
    'JBrowse/Store/SeqFeature/SPARQL'
],
function(
    declare,
    lang,
    array,
    xhr,
    ioQuery,
    SPARQL
) {
    return declare( SPARQL, {
        getFeatures: function( query, featCallback, finishCallback, errorCallback ) {
            if( this.queryTemplate ) {
                var thisB = this;
                var backoff = 200;
                var headers = {
                    "Accept": "application/json",
                    "X-Requested-With": null
                };
                console.log('wtf',this.urlTemplate)
                xhr.get( this.url+'?'+ioQuery.objectToQuery({ query: thisB._makeQuery(query) }), {
                    headers: headers,
                    handleAs: "json",
                    failOk: true
                }).then( function(o) {
                    thisB._resultsToFeatures( o, featCallback );
                    finishCallback();
                }, function(e) {
                    setTimeout(function() {
                        thisB.getFeatures( query, featCallback, finishCallback, errorCallback );
                    }, query.backoff);

                    if(query.backoff) {
                        query.backoff *= 2;
                    } else {
                        query.backoff = 200;
                    }
                });
            } else {
                finishCallback();
            }
        }
    });
});

