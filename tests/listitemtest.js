const Ajv = require('ajv')

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