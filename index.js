
const child_process = require('child_process');
const N3 = require('n3');
const validUrl = require('valid-url');


let args = require('minimist')(process.argv.slice(2));
if (args.h || args.help || args._.length !== 1)
{
    console.error('usage: node index.js [-r root] [-f format] FOLDER');
    console.error('  -r root   : URI to use for the root module.');
    console.error('  -f format : Output format, see below for a full list of supported formats');
    console.error('format: text/turtle, application/n-triples, etc. (all those supported by N3.js)');
    return process.exit((args.h || args.help) ? 0 : 1);
}

let folder = args._[0];
let format = args.f || 'text/turtle';
let root   = args.r || '#software';

let domain = 'https://linkedsoftwaredependencies.org/';
let blankID = 1;

let writer = new N3.Writer({ format,
    prefixes:
        {
            doap: 'http://usefulinc.com/ns/doap#',
            npm: 'https://linkedsoftwaredependencies.org/vocabularies/npm#',
            doc: 'https://www.w3.org/2000/10/swap/pim/doc#'
        }
});

function execPromise(cmd)
{
    return new Promise((resolve, reject) =>
    {
        child_process.exec(cmd, { cwd: folder }, function (err, stdout, stderr)
        {
            if (err)
                return reject(err);
            resolve(stdout);
        });
    });
}

let node = execPromise('node -v');
let npm = execPromise('npm -v');
let ls = execPromise('npm ls --json').then(JSON.parse);

let exec = Promise.all([node, npm]).then(([nodeV, npmV]) =>
{
    writer.addTriple(root, 'npm:engine', domain + 'engines/node/' + nodeV.trim());
    writer.addTriple(root, 'npm:engine', domain + 'bundles/npm/' + npmV.trim());
    return ls;
});

function handleRoot (json)
{
    if (json.name)
        writer.addTriple(root, 'doap:name', `"${json.name}"`);
    if (json.version)
        writer.addTriple(root, 'doap:revision', `"${json.version}"`);
    
    if (json.dependencies)
        for (let child in json.dependencies)
            handleDependency(root, child, json.dependencies[child]);
}

function handleDependency (parent, key, json)
{
    let uri;
    if (json.from.startsWith(key + '@'))
        uri = domain + 'bundles/npm/' + key + '/' + json.version;
    else if (validUrl.isUri(json.resolved))
        uri = json.resolved;
    else
        uri = '_:b' + blankID++;
    
    writer.addTriple(uri, 'doap:revision', `"${json.version}"`);
    
    writer.addTriple(uri, 'doap:name', `"${key}"`);
    
    if (parent)
        writer.addTriple(parent, 'doc:dependsOn', uri);
    
    if (json.resolved)
        writer.addTriple(uri, 'doap:file-release', json.resolved);
    
    if (json.dependencies)
        for (let child in json.dependencies)
            handleDependency(uri, child, json.dependencies[child]);
}

function write()
{
    return new Promise((resolve, reject) =>
    {
        writer.end((error, result) =>
        {
            if (error)
                reject(error);
            else
                resolve(result);
        })
    });
}

exec.then(handleRoot).then(write).then(console.log).catch(e => { console.error(e); throw e });