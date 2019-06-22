const ctxify = require('../ctxify')

console.log(ctxify(
	{"li":{
		"textContent":"#!write url.query.name"
	}},
	{"url": {
		"query": {
			"name": "colten"
		}
	}}
).toHTML())

console.log(ctxify(
	{"body":{
		"childNodes": [
			{"span":{"textContent":"Hello "}},
			{"span":{"textContent":"#!write url.query.name"}},
			{"span":{"textContent":"!"}}
		]
	}},
	{"url":{
		"query":{
			"name": "Colten"
		}
	}}
).toHTML())

//ctxify().htmlify() // ctxify().toHTML()

console.log(ctxify(
    {"head": {
		"childNodes": [
			{"style":{
				"div.square": {
					"width": "#!write style.height",
					"height": "#!write style.height"
				}
			}}
		]
	}},{
		"style":{
			"width":"40px",
			"height":"40px"
		}
	}).toHTML())

// TODO properly reach into style tags....
// right now I'm expected all attribute values to be strings,
// but in the case of style, I can accept an object
// console.log(ctxify(
//     {"head": {
// 		"style":{
// 			"width": "#!write style.height",
// 			"height": "#!write style.height"
// 		}
// 	}},{
// 		"style":{
// 			"width":"40px",
// 			"height":"40px"
// 		}
// 	}).toHTML())

console.log(ctxify(
	{"body":{
		"childNodes": [
			{"h2":{"textContent":"Can we Require?"}},
			{"#!require ./tests/someTemplate.json":{
				"class":"somethingUnique",
				"code-src":"./tests/someTemplate"
			}}
		]
	}},
	{"url": {
		"query": {
			"name": "colten"
		}
	}}
).toHTML())

output = `
<body>
	<h2>Can we Require?</h2>
	<div id="hellodiv" class="somethingUnique" code-src="./tests/someTemplate">
		<span>Hello </span>
		<span>colten</span>
		<span>!</span>
	</div>
</body>
`
// console.log(ctxify(
// 	{"#!ctx ./someDataFile":
// 		{""}}
// ))

//{"#!ctx someDataFile.json": "#!require someTemplate.json"}



// {"#!split url.query.list":
// 	{"#!each split":
// 		{"li":{
// 			"textContent":"#!write each"
// 		}}
// 	}
// }

