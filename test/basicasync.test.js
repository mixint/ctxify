const {
	ctxify,
	ctxifyValue,
	renderAnyElement
} = require('../ctxify')
const {
	expect
} = require('chai')

describe('Basic string concatenation', () => {
	/**
	The base case for ctxify and render would be to return a 'text node'
	(aka a plain string) from a string or array of strings.

	This is not so useful until you start embedding magic words
	into this string or array of strings.
	**/
	it('Takes a string and returns a text node', done => {
		ctxify('hello')
		.then(renderAnyElement)
		.then(result => {
			expect(result).to.equal('hello')
		})
		.then(done, done)
	})

	/**
	Bear in mind the strings are joined with no space,
	so if you want a space you must specifiy where.
	**/
	it('Takes an array of strings and returns a text node', done => {
		ctxify(['hello'," ",'world'])
		.then(renderAnyElement)
		.then(result => {
			expect(result).to.equal('hello world')
		})
		.then(done, done)
	})
})



/**
A magic word is prefixed with '#!' and must have an entry in the
config property of package.json in the topmost project file mapping
a magic word to a specific package. So in this instance, @ctxify/ctxify
includes in {config: {moment: @ctxify/moment}} so now we can use it.

Simplest case, with no arguments, uses defaults defined in
@ctxify/moment/defaults.json


ctxify(["The date is ","#!moment"])
.then(renderAnyElement)
.then(console.log)
.catch(console.error)


ctxify([
	"The time is ",
	{"#!moment":{format: 'LT'}}
])
.then(renderAnyElement)
.then(console.log)
.catch(console.error)


ctxify([
	"In one week it will be ",
	{"#!moment": {"add": [7, "day"]} }
])
.then(renderAnyElement)
.then(console.log)
.catch(console.error)

/**
But text strings can't carry much style with them,
so ctxify is designed to deal with larger structures

The data structure that is transformed into HTML
is an object with one property, its label or tagName,
and an object containing the attributes.


ctxify(
	{'div':{
		'id'         : 'myDiv',
		'textContent': 'Some text node'
	}}
)
.then(renderAnyElement)
.then(console.log)
.catch(console.error)


ctxify(
	{'div':{
		'id'         : 'myDiv',
		'textContent': 'Some text node'
	}}
)
.then(renderAnyElement)
.then(output => {
	expect(output).to.equal(`<>`)
})
.then(done).catch(done)

ctxify(
	{'ul':{
		'id'        : 'mylist',
		'childNodes': [
			{'li': {'textContent':'one'}},
			{'li': {'textContent':'two'}},
			{'li': {'textContent':'three'}},
		]
	}}
)
.then(renderAnyElement)
.then(console.log)
.catch(console.error)



/**

const {ctxifyCSSRuleValuePairs} = require('../ctxify')


const {ctxifyCSSSelectorSet} = require('../ctxify')


let ruleValuePairs = {
	"border":"none",
	"box-sizing":"border-box",
	"color": "pink",
	"text-decoration": "none",
}

let selectorSet = {
	"*": {
		"box-sizing":"border-box",
		"padding":"none"
	},
	"li.selected": {
		"border-color": "red",
		"border-style": "dotted",
		"border-width": "3px"
	}
}

ctxifyCSSRuleValuePairs(ruleValuePairs).then(console.log).catch(console.log)
ctxifyCSSSelectorSet(selectorSet).then(console.log).catch(console.log)

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
					"border-width": ["#!write width","px"]
				},
				"li:not(.selected)": {
					"color": "gray"
				}
			}},
			{"ul":{
				"class":"someList",
				"style": {
					"list-decoration":"none",
				},
				"childNodes": [
					{"li": {
						"textContent":"#!write width"
					}},
					{"li": {
						"textContent": {
							"#!moment date": {
								"format":'LLLL',
								"locale": "zh-cn"
							}
						}
					}},
					{"li": {
						"class":"selected",
						"textContent": ["two","#!write width", "four"]
					}},
					{"li": {"textContent": "three"}}
				]
			}}
		]
	}
}


ctxify(test, {width: "3", date: new Date()}).then(glob => {
	console.log(glob)
	console.log(renderAnyElement(glob))
}).catch(console.log)

/**
{ border: 'none',
  'box-sizing': 'border-box',
  color: 'pink',
  'text-decoration': 'none' }
{ '*': { 'box-sizing': 'border-box', padding: 'none' },
  'li.selected':
   { 'border-color': 'red',
     'border-style': 'dotted',
     'border-width': '3px' } }
{ 'my-div':
   { style: { border: 'none', 'box-sizing': 'border-box' },
     id: 'somethingElse',
     childNodes:
      [ { style:
           { 'li.selected':
              { 'border-color': 'red',
                'border-style': 'dotted',
                'border-width': '3px' } } },
        { ul:
           { class: 'someList',
             style: { 'list-decoration': 'none' },
             childNodes:
              [ { li: { textContent: 'one' } },
                { li: { class: 'selected', textContent: 'two' } },
                { li: { textContent: 'three' } }
               ]
            }

  				}
				] 
			}
		}
  **/
/**
ctxify(["hello ",{"img": {"src": "/img/world"}}," world"]).then(ctx => renderAnyElement(ctx)).then(console.log)
ctxify(["hello ",{"a": {"href": "/img/world", "textContent":"clicky"}}," world"]).then(ctx => renderAnyElement(ctx)).then(console.log)
**/

/**
var examplePairs = {
	"width": ["#!write test.width","#!write test.unit"],
	"height": ["#!write test.height","#!write test.unit"],
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
**/
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