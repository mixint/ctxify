const { ctxify, render } = require('../ctxify')

console.log(render(ctxify(
	{"li":{
		"textContent":"#!write url.query"
	}},
	{"url": {
		"query": 'colten'
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




// {"#!split url.query.list":
// 	{"#!each split":
// 		{"li":{
// 			"textContent":"#!write each"
// 		}}
// 	}
// }

