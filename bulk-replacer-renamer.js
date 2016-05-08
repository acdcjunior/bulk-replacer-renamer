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
        var gitMV = 'git --git-dir="' + gitRoot + '/.git" --work-tree="' + gitRoot + '" mv "' + srcPath + '" "' + targetPath + '"';
        execSync(gitMV);
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

function replaceFileContent(filePath, searchAndReplaceTerms, fileEncoding, outputFunction) {
    var originalContent = fs.readFileSync(filePath, fileEncoding);
    var replacedContent = originalContent.replace(searchAndReplaceTerms.searchRegex, searchAndReplaceTerms.replaceTerm);
    
    if (originalContent !== replacedContent) {
        outputFunction("changing content: " + filePath);
        fs.writeFileSync(filePath, replacedContent, fileEncoding);
    }
}

function replaceFileName(filePath, searchAndReplaceTerms, outputFunction, gitRoot) {
    var replacedFilePath = filePath.replace(searchAndReplaceTerms.searchRegex, searchAndReplaceTerms.replaceTerm);

    if (filePath !== replacedFilePath) {
        outputFunction("changing name...: " + filePath + " -> " + replacedFilePath);
        renameFile(filePath, replacedFilePath, gitRoot);
    }
}

function outputFunction(silent) {
    if (!silent) {
        return function () {
            console.log.apply(this, arguments);
        };
    } else {
        return function () {};
    }
}

var DEFAULT_FILE_ENCODING = 'utf8';

/**
 *
 * @param baseDir the folder to look at
 * @param searchRegex /something-to-search-for/g/
 * @param replaceTerm 'what will replace'
 * @param options object { 
 *      fileExtensionsToReplace: (optional) Array of extensions. e.g. ["java", "js", "html", "css"],
 *      gitRoot: (optional) a dir, where supposedly the git repo is at. if specified the renames will be done using "git mv",
 *      fileEncoding: (optional) default is 'utf8',
 *      silent: (optional) if it should print what it is doing
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
    var resolvedOutputFunction = outputFunction(options.silent);
    filesToReplaceAndOrRename.forEach(function (filePath) {
        replaceFileContent(filePath, searchAndReplaceTerms, options.fileEncoding || DEFAULT_FILE_ENCODING, resolvedOutputFunction);
        replaceFileName(filePath, searchAndReplaceTerms, resolvedOutputFunction, options.gitRoot);
    });
}

module.exports = bulkReplacerRenamer;