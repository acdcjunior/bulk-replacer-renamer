var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var execSync = require('child_process').execSync;

function fileWalker(currentDirPath, callback) {
    var filesAndFolders = fs.readdirSync(currentDirPath);
    filesAndFolders.forEach(function (name) {
        var filePath = path.join(currentDirPath, name);
        var stat = fs.statSync(filePath);
        if (stat.isFile()) {
            callback(filePath, false);
        } else if (stat.isDirectory()) {
            callback(filePath, true);
            fileWalker(filePath, callback);
        }
    });
}

function ensurePathExists(filePath) {
    var fileDir = path.dirname(filePath);
    if (!fs.existsSync(fileDir)) {
        mkdirp.sync(fileDir);
    }
}

function renameFile(srcPath, targetPath, gitRoot) {
    ensurePathExists(targetPath);
    if (gitRoot) {
        var comandoGit = 'git  --work-tree=' + gitRoot + ' mv ' + srcPath + ' ' + targetPath;
        execSync(comandoGit);
    } else {
        fs.renameSync(srcPath, targetPath);
    }
}

function fileHasExtension(filePath, fileExtensions) {
    if (!fileExtensions) {
        // no file extensions were specified
        return true;
    }
    var pathParts = filePath.split(".");
    if (pathParts.length === 1) {
        // file has no extension
        return false;
    }
    var fileExtension = pathParts[pathParts.length - 1];
    return fileExtensions.indexOf(fileExtension) !== -1;
}

function replaceFileContent(filePath, searchAndReplaceTerms) {
    var originalContent = fs.readFileSync(filePath, 'utf8');
    var replacedContent = originalContent.replace(searchAndReplaceTerms.searchRegex, searchAndReplaceTerms.replaceTerm);
    
    if (originalContent !== replacedContent) {
        fs.writeFileSync(filePath, replacedContent, 'utf8');
    }
}

function replaceFileName(filePath, searchAndReplaceTerms, gitRoot) {
    var replacedFilePath = filePath.replace(searchAndReplaceTerms.searchRegex, searchAndReplaceTerms.replaceTerm);

    if (filePath !== replacedFilePath) {
        console.log("mv " + filePath + " -> " + replacedFilePath);
        renameFile(filePath, replacedFilePath, gitRoot);
    }
}

var defaultFileEncoding = 'utf8';

/**
 *
 * @param baseDir the folder to look at
 * @param searchRegex /something-to-search-for/g/
 * @param replaceTerm 'what will replace'
 * @param options object { 
 *      fileExtensionsToReplace: (optional) Array of extensions. e.g. ["java", "js", "html", "css"],
 *      gitRoot: (optional) a dir, where supposedly the git repo is at. if specified the renames will be done using "git mv",
 *      fileEncoding: (optional) default is 'utf8'
 * }      
 */
function bulkReplacerRenamer(baseDir, searchRegex, replaceTerm, options) {
    var filesToReplaceAndOrRename = [];

    fileWalker(baseDir, function (filePath, isDir) {
        if (!isDir && fileHasExtension(filePath, options.fileExtensionsToReplace)) {
            filesToReplaceAndOrRename.push(filePath);
        }
    });

    var searchAndReplaceTerms = {searchRegex: searchRegex, replaceTerm: replaceTerm};
    filesToReplaceAndOrRename.forEach(function (filePath) {
        replaceFileContent(filePath, searchAndReplaceTerms, options.fileEncoding || defaultFileEncoding);
        replaceFileName(filePath, searchAndReplaceTerms, options.gitRoot);
    });
}

module.exports = bulkReplacerRenamer;