/**
# CTXIFY
## Compose HTML with Declarative, Functional Templates

Describe web documents and subdocuments using JSON files using a 'general layout object' schema, a.k.a. `.glo.json` or `globject`.

Either the single label of a `globject` or the value of a property can be prefixed with a magic word using `#!`. 

At its simplest, this can be access to a 'data' object with a dot notation path. If we passed a glo template and a context with an url object, it might look like:

/?somePropertyName=someValue
returned by `#!write url.query.somePropertyName`

Each magic word must have a schema property that described what it can accept and what it can return.

an upgrade to typescript would be great, of course

`#!write`   DotPath || FilePath ,, [options] -> String
`#!require` DotPath || FilePath ,, [options] -> Labeled Object
`#!ctx`     DotPath || FilePath ,, NextGlob  -> Labeled Object
`#!each`    DotPath             ,, NextGlob  -> Array of Labeled Objects
`#!sql`     DotPath || FilePath ,, NextGlob  -> Labeled Object

TODO Schema will have to be smart enough to check the return value of these labels, and decide where they're allowed to exist

check if the DotPath resolves to a FilePath
for write, read that file and interpret it as utf8
for require, read that file and use it as nextglob
for ctx, read that file and merge it with ctx

GLOM
General Layout Object Manipulation
A single syntax for style and markup with in-line replacement of an object's subbranches with the use of magic words. 

# Magic Words

A function named following magic numbers '#!' are called magic words. 

Magic functions may export an async function which accepts as its arguments: the rest of the text in the caller as a string, optionally an object, and a done function... 

The name of the magic function becomes a key in the ctx object passed onto the next 'view'

function extrastat(ctx, argument, target, callback)

don't forget the debug statements, you can print performance stats to determine how long different functions take....

\\\
If given a string, check for hashbang.
	Call hashbang, passing ctx, argument, target, and continue (a callback function to continue parsing...)
	Else just return the string ? Support text nodes ???

If given an array, map ctxify over the array.

If given an object, check for hashbang.
	Call hashbang, passing ctx
\\\



```json
 {"#!extrastat url.path": {
	"#!each extrastat.parents": {
		"#!extrastat each":
			{"ul": {
				"childNodes": [
					{"filename": {"textContent": "#!write extrastat.filename"}},
					{"mimetype": {"textContent": "#!write extrastat.mimetype"}},
					{"filemode": {"textContent": "#!write extrastat.filemode"}},
					{"atime": {"textContent":    "#!moment extrastat.filestat.atime"}}
					{"today": {"#!moment extrastat.filestat.mtime":{
												"format":"Day Locale",
												"TIMEZONE": "local/server",
												"comment": "returns a string from the moment magicWord, can only be used as an attributeValue..."
										}}
					}
				]
			}}i
		}
	}}
 }}
```

extrastat
takes a filename, and a nextglob to ctxify with a new ctx
ctx is merged with an extrastat property which points to,
A stat object that looks like the output of extrastat as is, but with, an array that is the names of children [null if file is not a directory : empty directories still have ['.','..'], 

default options config.json, include
'parents':'true',
'siblings':'true',
'children':'true',
'realuid':'false',
'resolve_guid':'false',

but you can set these to false if your doing something different and just want the smallest possible stat object.

your esc always focuses on the immediate frame then outwards, and you can always hit alt to show a bunch of numbers to jump to via focus. Once you focus on a different frame, you can 'enter' back into the menu or focusing within, maybe tab to step into, shifttab to step out. 

If a component crashes in error, write html to say so, if its iframed it will be an impressive localized crash, with helpful version information in the case it was a regression, you could spin up a different version as quick as a 'git checkout' and 'npm start', 

I think handling these different transflect classes for each route, actually starting them at different 'npm start' child processes, and getting the port number from all those routes, and each class gets to have its own jsonf connection log, which you can easily merge and see how connections come in cascades and see what really slows you down, what routes / properties end up taking way too long.

having a timestamped log of transactions is the highest resolution tracking you could want, no clientside javascript necessary, just cold hard timers between form submissions.



```json
{"#!sql ./somequery":
	{"#!switch sql.success": {
		"true":
			{"div":{ 
				"class": "sql-success",
				"childNodes": 
					{"#!each sql.results":
						{"li":  "#!write each.content"}
					}
			}},
		"default":
			{"div":{
				"class": "sql-error",
				"textContent": "#!write sql.errorMsg"
			}}
	}}
}}
```