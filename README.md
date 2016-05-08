# bulk-replacer-renamer

Search and **replace** all files in a folder by regex.

Search and **rename** (or git rename) all files in a folder by a regex.

# What?

When you call `bulkReplacerRenamer('C:/mydocs', /aaa/g, 'bbb')`, the script
will look for `aaa` inside every file at any folder within `C:/mydocs` and replace it with `bbb`.

Also will rename any file or folder that have `aaa` in its name, replacing it with `bbb`.

So, some file like: `C:/mydocs/hi-aaa-there/Xaaa.java` would become `C:/mydocs/hi-bbb-there/Xbbb.java`.

# Usage

    npm install acdcjunior/bulk-replacer-renamer

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