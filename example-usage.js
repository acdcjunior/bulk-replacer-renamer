var bulkReplacerRenamer = require('./bulk-replacer-renamer');

var gitRoot = __dirname;
var baseDir = require('path').join(__dirname, "/test");

var seed = {regex: 'Stuff', replace: 'SumthingElse'};

var searchAndReplaceTermsList = [];
searchAndReplaceTermsList.push({searchRegex: new RegExp(seed.regex              , "g"), replaceTerm: seed.replace              });
searchAndReplaceTermsList.push({searchRegex: new RegExp(seed.regex.toUpperCase(), "g"), replaceTerm: seed.replace.toUpperCase()});
searchAndReplaceTermsList.push({searchRegex: new RegExp(seed.regex.toLowerCase(), "g"), replaceTerm: seed.replace.toLowerCase()});

var fileExtensionsToReplace = ["java", "js", "html", "css", "vm"];

searchAndReplaceTermsList.forEach(function (searchAndReplaceTerms) {
    bulkReplacerRenamer(
        baseDir,
        searchAndReplaceTerms.searchRegex,
        searchAndReplaceTerms.replaceTerm,
        {
            fileExtensionsToReplace: fileExtensionsToReplace,
            gitRoot: gitRoot,
            fileEncoding: 'utf8',
            silent: false
        }
    )
});

console.log("After executing this script, take a look at the /test/ folder diff through git.");