/**
childNodes || globject
		|_ AnyElement
			|_ case: childNodes: AnyElement || StyleElement
			|_ case: style: cssRuleValuePairs
			|_ default: HTMLAttribute
				|_ value
		|_ StyleElement
			|_ cssSelectorSet
				|_ cssRuleValuePairs
					|_ value
			|_ cssAtRule
				|_ cssSelectorSet
					|_ cssRuleValuePairs
						|_ value

<AnyElement> an element of childNodes or top level globject -- every other tagName besides 'STYLE', which must handle CSS Syntax instead
<StyleElement> an element of childNodes or top level globject -- members are <CSSSelectorSet>s or <CSSAtRule>s
<CSSAtRule> Member of a StyleElement, has CSSSelectorSets as members
<CSSSelectorSet> every member of a SyleElement is a CSSSelectorSet{props: CSSRuleValuePair} or CSSAtRule{props: CSSSelectorSet}
<CSSRuleValuePair> member of a CSSSelectorSet or the 'style' attribute of <AnyElement>. Has Strings or MagicValues for memebers.
<Value> is used for CSSValues or HTML Attribute Values, just a string that can be self-replacing magic
**/

const {config} = require('./package.json')
if(!config) throw new Error("Must have a config that describes what modules to use for each magic word.")

const emptyElementList = [
	'area',
	'base',
	'br',
	'col',
	'embed',
	'hr',
	'img',
	'input',
	'link',
	'meta',
	'param',
	'source',
	'track',
	'wbr'
]

function rollupPairs(accumulator, current){
  return Object.assign(accumulator, {[current.shift()]: current.shift()})
}

function rollupObjects(accumulator, current){
  return Object.assign(accumulator, current)
}

function realType(anyInput){
	return Object.prototype.toString.call(anyInput).slice(8, -1)
}

function isMagic(stringInput){
	//assertSchema({type: 'string'}, stringInput)
	return stringInput[0] == '#' && stringInput[1] == '!'
}

function parseMagic(stringInput){
	//assertSchema({type: 'string'}, stringInput)
	let spaceIndex = stringInput.indexOf(' ')
	let magicWord = ~spaceIndex ? stringInput.slice(2, spaceIndex ) : stringInput.slice(2)
	let magicArg  = ~spaceIndex ? stringInput.slice(spaceIndex + 1) : undefined
	return [magicWord, magicArg]
}

function renderAnyElement(globject){

	switch(realType(globject)){
		case 'String': return globject; break;
		case 'Array':  return globject.map(renderAnyElement).join(''); break;
		case 'Object': /* assertSchema('AnyElement', globject) */ break;
		default: throw new TypeError("renderAnyElement expects a String, Array, or Object")
	}

 	let [element, attributePairs] = Object.entries(globject).pop()

	var outerHTML = new Array
	var innerHTML = new Array

	if(element == '!'){
		return `\n<!-- ${JSON.stringify(attributePairs)} -->\n`
	} else if(['String', 'Array'].includes(realType(attributePairs))){
		innerHTML.push(renderAnyElement(attributePairs))
		return interpolate(element, outerHTML, innerHTML)
	} else if(element == 'style'){
		return renderCSSSelectorSet(attributePairs)
	}

 	for(var attributeName in attributePairs){
 		if(attributePairs.hasOwnProperty(attributeName) == false){
 			continue
 		}
 		var attributeValue = attributePairs[attributeName]

		switch(attributeName){
 			case 'textContent':
 				innerHTML.push(...[].concat(attributeValue))
 				break
 			case 'childNodes':
 				innerHTML.push(...attributeValue.map(renderAnyElement))
 				break
 			case 'style':
 				attributeValue = renderCSSRuleValuePairs(attributeValue)
 				outerHTML.push(renderHTMLAttribute(attributeName, attributeValue))
 				break
 			default:
 				outerHTML.push(renderHTMLAttribute(attributeName, attributeValue))
 		}
	}
	return interpolate(element, outerHTML, innerHTML)
}

function renderStyleElement(globject){
	//assertSchema('StyleElement', globject)
 	let [element, cssSelectorSet] = Object.entries(globject).pop()
 	return interpolate(element, null, renderCSSSelectorSet(cssSelectorSet))
}

function renderCSSSelectorSet(cssSelectorSet){
	if(Array.isArray(cssSelectorSet)){
		return cssSelectorSet.map(renderCSSSelectorSet).join('\n')
	} else {
		return Object.entries(cssSelectorSet).map(
			([selector, ruleValuePair]) => 
				selector[0] == '@'
					? `${selector} {${renderCSSSelectorSet(ruleValuePair)}}`
					: `${selector} {${renderCSSRuleValuePairs(ruleValuePair)}}`
		).join('\n')
	}
}


/**
 * @param {object} style
 * @return {string}
 * Take object of form {width: "100px", height: "50px"}
 * and return a string `width: 100px; height: 50px;`
 * These values ARE compatible with {{ }} templating
 */
function renderCSSRuleValuePairs(RuleValuePairs, seperator = ' '){
	// assertSchema('CSSRuleValuePairs', RuleValuePairs)
	return Object.entries(RuleValuePairs).map(([rule, value]) => 
		`${rule}: ${Array.isArray(value) ? value.join('') : value};`
	).join(seperator)
}
/**
 * @param {string} prop
 * @param {string} attribute
 * @return {string}
 * the leading space is intentional by the way,
 * so space only exists in <tagName> before each attribute
 */
function renderHTMLAttribute(attrName, attrValue){
	// assertSchema(attributeName, attrName)
	// assertSchema(attributeValue, attrValue)
	attrValue = attrValue.replace('"', '&quot;')
	attrValue = attrValue.replace('&', '&amp;')
	return ` ${attrName}="${attrValue}"`
}

function interpolate(elementName, outerHTML = [], innerHTML = []){
	elementName = elementName.toLowerCase()
	// cant deal with arguments of improper type, will throw error calling join
	// how about a script tag with no innerHTML? leave out the end tag? spose it doesn't matter
	if(emptyElementList.includes(elementName)){
		return `\n<${elementName}${outerHTML.join(' ')}>`
	} else {
		return `\n<${elementName}${outerHTML.join(' ')}>${innerHTML.join('')}</${elementName}>`
	}
}

/**
@return {promise}  resolves to {String | Array | Object}
**/
function ctxify(globject, ctx = {}){
	switch(realType(globject)){
		case 'String': return ctxifyValue(globject, ctx)
		case 'Array' : return ctxifyArray(globject, ctx)
		case 'Object': return ctxifyAnyElement(globject, ctx)
	}
}

/**
@return {promise} resolves to {array}
**/
function ctxifyArray(globjects, ctx){
	return Promise.all(globjects.map(globject => ctxify(globject, ctx)))
}

/**
Requires the function described by the magic word,
function may be async or not.
If it is, calling it returns a promise. If it's not, it returns whatever it wants.
@return {Promise|Any} resolves to {Any}
**/
async function ctxifyValue(attributeValue, ctx){
	try {
		if(isMagic(attributeValue)){
			let [magicWord, magicArg] = parseMagic(attributeValue)
			return require(config[magicWord])(magicArg, null, ctx)
		} else {
			return attributeValue
		}
	} catch(e){
		console.error(e)
	}
}

/**
@return {promise} resolves to a object with all the magic words resolved 
props is either:
- empty
- options for a magic word
- the 'nextglob' a magicWord is expected to process
- the name=attribute values for an HTML element (as a labeled object)
**/
async function ctxifyAnyElement(globject, ctx){
	let [label, props] = Object.entries(globject).pop()

	if(isMagic(label)){
		//assertSchema('magicLabel', label)
		let [magicWord, magicArg] = parseMagic(label)
		return require(config[magicWord])(magicArg, props, ctx) // leaves out the options, magicword will use defaults for merge. 
	} else if(label == 'style'){
		return ctxifyStyleElement(globject, ctx)
	} else {
		//assertSchema('AnyElement')
		return Promise.all(
			Object.entries(props).map(async ([propName, propValue]) => {
				if(propName == 'style'){
					return {[propName]: await ctxifyCSSRuleValuePairs(propValue, ctx)}
				} else {
					return {[propName]: await ctxify(propValue, ctx)}
				}
			})
		).then(propEntries => ({
			[label]: propEntries.reduce(rollupObjects, new Object)
		}))
	}
}

async function ctxifyStyleElement(globject, ctx){
	let [label, props] = Object.entries(globject).pop()
	return {'style': await ctxifyCSSSelectorSet(props, ctx)}
}

/**
a cssSelector Set exists as a member of a StyleElement or an At Rule,
An object (TODO: or an array of objects to concatenate into duplicate keys), 
must match schema CSSSelectorSet, 

@param {object} cssSelectorSet
@param {object} ctx
@return {object} the same object structure with all the rule pairs checked for magic values.
**/
async function ctxifyCSSSelectorSet(cssSelectorSet, ctx = {}){
	if(Array.isArray(cssSelectorSet)){
		return Promise.all(
			cssSelectorSet.map(each =>
				ctxifyCSSSelectorSet(each, ctx)
			)
		)
	}
	return Promise.all(
		Object.entries(cssSelectorSet).map(
			async ([selector, RuleValuePairs]) => {
				if(selector[0] == '@'){
					return {[selector]: await ctxifyCSSSelectorSet(RuleValuePairs, ctx)}
				} else {
					return {[selector]: await ctxifyCSSRuleValuePairs(RuleValuePairs, ctx)}
				}
			})
		)
		.then(cssSelectorEntries => 
			cssSelectorEntries.reduce(rollupObjects, new Object)
		)
}

async function ctxifyCSSRuleValuePairs(cssRuleValuePairs, ctx){
	//assertSchema('cssRuleValuePairs', cssRuleValuePairs)
	return Promise.all(
		Object.entries(cssRuleValuePairs)
			.map(async ([rule, value]) => (
				{[rule]: await ctxify(value, ctx)}
			))
	).then(cssRuleValueEntries => 
		cssRuleValueEntries.reduce(rollupObjects, new Object)
	)
}

module.exports = {
	ctxify,
	ctxifyAnyElement,
	ctxifyValue,
	ctxifyStyleElement,
	ctxifyCSSSelectorSet,
	ctxifyCSSRuleValuePairs,
	renderAnyElement,
	renderStyleElement,
	renderCSSSelectorSet,
	renderCSSRuleValuePairs
}