
let ctx = {
	test: {
		dot: {
			path: "success!"
		}
	}
}

/**
### ctxifyValue
The simplest ctxification is executing a magicWord in a string or passing it along if no magic word exists

"#!write data.test"
**/

var result = ctxifyValue("#!write test.dot.path", ctx)

assert.equal(result, test.dot.path)

var result = ctxifyValue("leave me alone", ctx)

assert.equal(result, "leave me alone")

/**
### ctxifyRuleValuePairs

**/

var examplePairs = {
	"width": "#!format ${test.width}${test.unit}",
	"height": "#!format ${test.height}${test.unit}"
}

var exampleCtx = {
	"test": {
		"width": 100,
		"height": 300,
		"unit": "px"
	}
}

var result = ctxifyRuleValuePairs(examplePairs, exampleCtx)

assert.equal(result, {
	width: "100px",
	height: "300px"
})

/**
### ctxifyCSSSelectorSet

**/

/**
### ctxifyAtRule
Should be able to keep different @media globjects around, so you can...

{style:{
	"@media min-width 800px": "#!require largeLayout.glo.json",
	"@media max-width 600px": "#!require minLayout.glo.json"
}}


**/

/**
###

**/

/**
###

**/

/**
###

**/