/**
# CTXIFY
## Functional Document Templates for Hypermedia

Describe web documents and subdocuments using JSON files using a 'Special Labeled Object' schema.

Basic functionality is 

# Magic Words

A function named following magic numbers '#!' are called magic words. 

Magic functions may export an async function which accepts as its arguments, the rest of the text in the caller as a string, optionally an object, and a done function... 

The name of the magic function becomes a key in the ctx object passed onto the 

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
					{"filename": {textContent: "#! extrastat.filename"}},
					{"mimetype": {textContent: "#! extrastat.mimetype"}},
					{"filemode": {textContent: "#! extrastat.filemode"}},
					{"atime": {textContent: "#!moment extrastat.filestat.atime"}}
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
					"textContent": "#! each.content"
				}}
			}
		}},
		"default": {"div": {
			"class": "sql-error",
			"textContent": "#! sql.errorMsg"
		}}
	}}
}}
```

```json
{""}
```
**/
