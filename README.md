# Semantic Dependencies

This tool converts the node_modules dependencies of an npm project to RDF.
Currently this is done by parsing the output of the `npm ls` command,
while in the future we also want to be able to simply parse a given `node_modules` folder.

Note that this is not the same as the dependencies that can be found in a `package.json` file!
The output will contain the actually installed versions,
not the semantic ranges.

Sample output when this is executed on its own folder:
```
@prefix doap: <http://usefulinc.com/ns/doap#>.
@prefix npm: <https://linkedsoftwaredependencies.org/vocabularies/npm#>.
@prefix doc: <https://www.w3.org/2000/10/swap/pim/doc#>.

<#software> npm:engine <https://linkedsoftwaredependencies.org/engines/node/v6.5.0>, <https://linkedsoftwaredependencies.org/bundles/npm/3.10.3>;
    doap:name "node-dependency-parser";
    doap:revision "0.1.1".
<https://linkedsoftwaredependencies.org/bundles/npm/minimist/1.2.0> doap:revision "1.2.0";
    doap:name "minimist".
<#software> doc:dependsOn <https://linkedsoftwaredependencies.org/bundles/npm/minimist/1.2.0>.
<https://linkedsoftwaredependencies.org/bundles/npm/minimist/1.2.0> doap:file-release <https://registry.npmjs.org/minimist/-/minimist-1.2.0.tgz>.
<https://linkedsoftwaredependencies.org/bundles/npm/n3/0.10.0> doap:revision "0.10.0";
    doap:name "n3".
<#software> doc:dependsOn <https://linkedsoftwaredependencies.org/bundles/npm/n3/0.10.0>.
<https://linkedsoftwaredependencies.org/bundles/npm/n3/0.10.0> doap:file-release <https://registry.npmjs.org/n3/-/n3-0.10.0.tgz>.
<https://linkedsoftwaredependencies.org/bundles/npm/valid-url/1.0.9> doap:revision "1.0.9";
    doap:name "valid-url".
<#software> doc:dependsOn <https://linkedsoftwaredependencies.org/bundles/npm/valid-url/1.0.9>.
<https://linkedsoftwaredependencies.org/bundles/npm/valid-url/1.0.9> doap:file-release <https://registry.npmjs.org/valid-url/-/valid-url-1.0.9.tgz>.
```

This output shows the packages that were installed for this package when this was executed.

The exact command line options are
```
usage: semantic-dependencies [-r root] [-f format] FOLDER
  -r root   : URI to use for the root module.
  -f format : Output format, see below for a full list of supported formats
format: text/turtle, application/n-triples, etc. (all those supported by N3.js)
```
`FOLDER` needs to be the root folder of the project.
`-r` is for changing the root URI that needs to be used for this project.
The default is `#software`.