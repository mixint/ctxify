/**
# CTXIFY
## Pure Functional Document Templates for Hypermedia



Describe web documents and subdocuments using JSON files using a 'Special Labeled Object' schema.

Either the single label of a 'labeled object' or the value of a property can be prefixed with a '#!' symbol to indicate special pre-processing.

At its simplest, this can be access to a 'data' object with a dot notation path.

As a transflect stream, the query object can be accessed to interpolate into an html structure.

/?somePropertyName=someValue
returned by `#!write url.query.somePropertyName`

Each magic word should have strict usage guidelines as to what it needs and what it returns
an upgrade to typescript would be great, of course
`#!write`   DotPath || FilePath ,, [options] -> String
`#!require` DotPath || FilePath ,, [options] -> Labeled Object
`#!ctx`     DotPath || FilePath ,, NextGlob  -> Labeled Object
`#!each`    DotPath             ,, NextGlob  -> Array of Labeled Objects
`#!sql`     DotPath || FilePath ,, NextGlob  -> Labeled Object

TODO Schema will have to be smart enough to check the return value of these labels, and decide where they're allowed to exist

check if the DotPath resolves to a FilePath
for write, read that file and interpret it as utf8
for require, read that file and use it as nextView
for ctx, read that file and merge it with data


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
			}}
		}
	}}
 }}
```

```json
{"#!sql ./somequery":
	{"#!switch sql.success": {
		"/true/i": {"div":{ 
			"class": "sql-success",
			"childNodes": {"#!each sql.results":
				{"li": {
					"textContent": "#!write each.content"
				}}
			}
		}},
		"default": {"div": {
			"class": "sql-error",
			"textContent": "#!write sql.errorMsg"
		}}
	}}
}}
```

tone:
a standard ordering of options, so that all future options are shifted left on the binary.
If there are 8 options to start off with, than 2^8, 00000000 - 11111111, unsigned byte, mode=ff, or mode=255, a short abreviation can send config preferences in the cookie or url. It would be kind of nice to keep the state of the url and cookie connected to each other, each request gets put back on the cookie. so mode will stay consistent between requests, and whether the font is monospace or not, whether the css animation is included, whether to include system performance and authentication presentation. Basically 'change your tone' can mean turn on and off features of presentation...

This will just be, consts that globjects can check for to decide whether to render a section of the globject.

alias:
you can add whatever magicWords you like from any repo / npm, but you need to define a map from magicwords used in globjects to npm/global name of the module you want to use for that magicword

so in mine so far: 
{config: {
	alias: {
		moment: @ctxify/moment,
		write:  @ctxify/write,
		each:   @ctxify/each,
	}
}}


{"#!if tone.NO_JS": {"noscript": "blah blah blah blah"}}

{"ul":[
	{"li":"one"},
	{"li":"two"},
	{"li": ["third",{"a":{"href":"#!write data.ex"}},"example"]}
])

As you're rendering the childNodes, render the string and concatenate the other nodes. 

So in the future, understand different kinds of innerHTML, including arrays of single 'tagname':'content' strings, 'tagname':''