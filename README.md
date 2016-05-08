# bulk-replacer-renamer

Search and **replace** all files in a folder by regex.

Search and **rename** all files in a folder by a regex.

# Usage

    npm install bulk-replacer-renamer

Then run a script like:

```javascript
var bulkReplacerRenamer = require('bulk-replacer-renamer');

bulkReplacerRenamer(
    'C:/docs/files',
    /robot/g,
    'cyborg',
    {
        fileExtensionsToReplace: ["java", "js", "html", "css"],
        fileEncoding: 'utf8',
        silent: false
    }
)
```

For a full example, see [example-usage.js](example-usage.js).