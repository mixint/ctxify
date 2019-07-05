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
	it('Takes a string and returns a text node', () => 
		ctxify('hello')
		.then(renderAnyElement)
		.then(result => {
			expect(result).to.equal('hello')
		})
	)

	/**
	Bear in mind the strings are joined with no space,
	so if you want a space you must specifiy where.
	**/
	it('Takes an array of strings and returns a text node', () => 
		ctxify(['hello'," ",'world'])
		.then(renderAnyElement)
		.then(result => {
			expect(result).to.equal('hello world')
		})
	)
})

/**
A magic word is prefixed with '#!' and must have an entry in the
config property of package.json in the topmost project file mapping
a magic word to a specific package. So in this instance, @ctxify/ctxify
includes in {config: {moment: @ctxify/moment}} so now we can use it.

Simplest case, with no arguments, uses defaults defined in
@ctxify/moment/defaults.json

**/
describe('An invocation of a magic word to return a text node', () => {
	it('concatenates the result of the magic word', () => 
		ctxify(["The date is ","#!moment"])
		.then(renderAnyElement)
		.then(result => {
			expect(result).to.match(
				/The date is \w+, \w+ \d+, \d+ \d+:\d+ (AM|PM)/
			)
		})
	)

	it('allows options to be passed to the magic word', () => 
		ctxify([
			"The time is ",
			{"#!moment":{format: 'LT'}}
		])
		.then(renderAnyElement)
		.then(result => {
			expect(result).to.match(
				/The time is \d+:\d+ (AM|PM)/
			)
		})
	)

	it('allows an array of arguments to be passed to magic word options', () => 
		ctxify([
			"In one week it will be ",
			{"#!moment": {"add": [7, "day"]} }
		])
		.then(renderAnyElement)
		.then(result => {
			expect(result).to.match(
				/In one week it will be \w+, \w+ \d+, \d+ \d+:\d+ (AM|PM)/
			)
		})
	)
})



/**
But text strings can't carry much style with them,
so ctxify is designed to deal with larger structures

The data structure that is transformed into HTML
is an object with one property, its label or tagName,
and an object containing the attributes.
**/
describe('More complex structures', () => {
	it('A simple transform from labeled object to HTML', () => 
		ctxify(
			{'div':{
				'id'         : 'myDiv',
				'textContent': 'Some text node'
			}}
		)
		.then(renderAnyElement)
		.then(result => {
			expect(result).to.equal('\n<div id="myDiv">Some text node</div>')
		})
	)

	it('Applies the same transform to childNodes, such as a list element', () =>
		ctxify(
			{'ul':{
				'id' : 'mylist',
				'childNodes': [
					{'li': {'textContent':'one'}},
					{'li': {'textContent':'two'}},
					{'li': {'textContent':'three'}},
				]
			}}
		)
		.then(renderAnyElement)
		.then(result => {
			expect(result).to.equal('\n' +
				'<ul id="mylist">' +  '\n' +
					'<li>one</li>'   +  '\n' +
					'<li>two</li>'   +  '\n' +
					'<li>three</li>' +
				'</ul>'
			)
		})
	)
})

describe('Deals with CSS in the same JSON syntax', () => {
	const {
		ctxifyCSSRuleValuePairs,
		ctxifyCSSSelectorSet,
		renderCSSSelectorSet,
		renderCSSRuleValuePairs
	} = require('../ctxify')

	it('renders rule value pairs into CSS syntax', () => 
		ctxifyCSSRuleValuePairs({
			"border":"none",
			"box-sizing":"border-box",
			"color": "pink",
			"text-decoration": "none",
		})
		.then(renderCSSRuleValuePairs)
		.then(result => {
			expect(result).to.equal(
				'border: none; '           +
				'box-sizing: border-box; ' +
				'color: pink; '            +
				'text-decoration: none;'  
			)
		})
	)

	it('renders the contents of a style tag', () => 
		ctxifyCSSSelectorSet({
			"*": {
				"box-sizing":"border-box",
				"padding":"none"
			},
			"li.selected": {
				"border-color": "red",
				"border-style": "dotted",
				"border-width": "3px"
			}
		})
		.then(renderCSSSelectorSet)
		.then(result => {
			expect(result).to.equal(
				'* {'                        +
					'box-sizing: border-box; ' +
					'padding: none;'           +
				'}'                          + '\n' +
				'li.selected {'              +
					'border-color: red; '      +
					'border-style: dotted; '   +
					'border-width: 3px;'       +
				'}'
			)
		})
	)

	/**
	When expressing a CSS Selector Set as a single object,
	you would lose the ability to have duplicate keys,
	but CSS explicitely does allow duplicate keys (hence the cascading part)
	so ctxifyCSSSelectorSet will apply itself to an array
	and concatentate the results.
	**/
	it('also accepts an array in order to support duplicate selectors', () =>
		ctxifyCSSSelectorSet([{
			"*": {
				"box-sizing":"border-box",
			}
		},{
			"*": {
				"padding":"none",
				"margin":"none"
			}
		}])
		.then(renderCSSSelectorSet)
		.then(result => {
			expect(result).to.equal(
				'* {'                       +
					'box-sizing: border-box;' +
				'}'                         + '\n' +
				'* {'                       +
					'padding: none; '         +
					'margin: none;'           +
				'}'
			)
		})
	)
})