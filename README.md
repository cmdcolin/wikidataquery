# wikidataquery

A small JBrowse plugin to query wikidata, used on http://wikigenomes.org

# Setup

An example track can be declared like this in tracks.conf

    [tracks.genes_canvas_mod]
    key = Genes
    type = JBrowse/View/Track/CanvasFeatures
    variables.organism = 115713
    storeClass = WikiData/Store/SeqFeature/Genes
    urlTemplate = https://query.wikidata.org/sparql
    style.color = #5C99F3


See test/data/ for sample data directory (or browse to http://localhost/jbrowse/?data=plugins/WikiData/test/data for example instance)


## Intallation

Clone the repository to the jbrowse plugins subdirectory and name it WikiData

    git clone https://github.com/cmdcolin/wikidataquery WikiData

Then add the plugin to your configuration, e.g. "plugins": ["WikiData"]

See http://gmod.org/wiki/JBrowse_FAQ#How_do_I_install_a_plugin for details
