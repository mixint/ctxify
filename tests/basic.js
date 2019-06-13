const { ctxify, render } = require('../ctxify')

console.log(render(ctxify(
	{"li":{
		"textContent":"#!write url.query.name"
	}},
	{"url": {
		"query": {
			"name": "colten"
		}
	}}
)))

console.log(render(ctxify(
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
)))

//ctxify().htmlify() // ctxify().toHTML()

console.log(render(ctxify(
	{"body":{
		"childNodes": [
			{"h2":{"textContent":"Can we Require?"}},
			"#!require ./tests/someTemplate.json"
		]
	}},
	{"url": {
		"query": {
			"name": "colten"
		}
	}}
)))

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

