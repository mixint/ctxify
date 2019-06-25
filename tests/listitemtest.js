const Ajv = require('ajv')
const {ctxify, render} = require('../ctxify')

let ajv = new Ajv({
	allErrors: true,
	schemas: [require('../schemas/anyElement.json')]
})


console.log(ajv.validate(
	"anyElement.json#/definitions/CSSRuleValuePairs", 
	{
			"border":"none",
			"box-sizing":"border-box",
			"color": "pink",
			"text-decoration": "none",
	}
))

console.log(ajv.errors)

console.log(ajv.validate(
	"anyElement.json#/definitions/CSSSelectorSet", 
	{
		"*":{
			"border":"none",
			"box-sizing":"border-box",
			"color": "pink",
			"text-decoration": "none",
		}
	}
))

console.log(ajv.errors)

console.log(ajv.validate(
	"anyElement.json#/definitions/AnyElement", 
	{
		"something":{
			"style":{
				"border":"none",
				"box-sizing":"border-box",
				"color": "pink",
				"text-decoration": "none",
			}
		}
	}
))

console.log(ajv.errors)

let test = {
		"my-div":{
			"style":{
				"border":"none",
				"box-sizing":"border-box"
			},
			"id":"somethingElse",
			"childNodes": [
				{"style":{
					"li.selected": {
						"border-color":"red",
						"border-style":"dotted",
						"border-width":3
					}
				}},
				{"ul":{
					"class":"someList",
					"style": {
						"list-decoration":"none",
					},
					"childNodes": [
						{"li": {
							"textContent": "one"
						}},
						{"li": {
							"class":"selected",
							"textContent": "two"
						}},
						{"li": {
							"textContent": "three"
						}}
					]
				}}
			]
		}
	}

console.log(ajv.validate(
	"anyElement.json#/definitions/AnyElement", test
))

console.log(ajv.errors)

console.log(ctxify(test))
console.log('\n', render(ctxify(test)), '\n')

