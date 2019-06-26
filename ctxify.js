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

function ctxify(globject, ctx){
	switch(realType(globject)){
		case 'Array':  return ctxifyArray(globject, ctx)
		case 'String': return ctxifyValue(globject, ctx)
		case 'Object': return ctxifyAnyElement(globject, ctx)
	}
}

function ctxifyArray(globjects, ctx){
	return globjects.map(globject => ctxify(globject, ctx))
}

function ctxifyValue(attributeValue, ctx){
	if(isMagic(attributeValue)){
		let [magicWord, magicArg] = parseMagic(attributeValue)
		return require(magicWord)(magicArg, null, ctx)
	} else {
		return attributeValue
	}
}


// ctxifyAnyElement
// ctxifyStyleElement
// ctxifyCSSAtRule
// ctxifyCSSSelectorSet
// ctxifyCSSRuleValuePairs
// ctxifyValue 

function ctxifyAnyElement(globject, ctx){
	let [label, props] = Object.entries(globject).pop()
	// props is either:
	// - empty
	// - options for a magic word
	// - the 'nextglob' a magicWord is expected to process
	// - the name=attribute values for an HTML element (as a labeled object)
	if(isMagic(label)){
		//assertSchema('magicLabel', label)
		let [magicWord, magicArg] = parseMagic(attributeValue)
		let magicFunction = require('./magic/ctx.js')[magicWord] 
		return require(magicWord)(magicArg, props, ctx) // leaves out the options, magicword will use defaults for merge. 
	} else if(label == 'style'){
		// assertSchema('StyleElement')
		return {[label]: ctxifyCSSSelectorSet(props, ctx)}
	} else {
		//assertSchema('AnyElement')
		let propName, propValue
		for(propName in props){
			propValue = props[propName]

			if(propName == 'childNodes'){
				props[propName] = ctxifyArray(propValue, ctx)
			} else if(propName == 'style'){
				props[propName] = ctxifyCSSRuleValuePairs(propValue, ctx)
			} else if(realType(propValue) == 'String' && isMagic(propValue)){
				props[propName] = ctxifyValue(propValue, ctx)
			}
		}
		return {[label]: props}
	}
}

/**
a cssSelector Set exists as a member of a StyleElement or an At Rule,
An object (TODO: or an array of objects to concatenate into duplicate keys), 
must match schema CSSSelectorSet, 


**/
function ctxifyCSSSelectorSet(cssSelectorSet, ctx){
	if(Array.isArray(cssSelectorSet)){
		return cssSelectorSet.map(ctxifyCSSSelectorSet)
	}
	let selector, cssRuleValuePairs

	for(selector in cssSelectorSet){
		if(selector[0] == '@') {
			// the selector is an @Rule ! Like @media... 
			// return a call to the same function, since the value of an @Rule is a selectorset
			cssAtRuleValue = cssSelectorSet[selector]
			cssSelectorSet[selector] = ctxifyCSSSelectorSet(cssAtRuleValue, ctx)
		} else {
			cssRuleValuePairs = cssSelectorSet[selector]
			cssSelectorSet[selector] = ctxifyCSSRuleValuePairs(cssRuleValuePairs, ctx)
		}
	}
	return cssSelectorSet
}

function ctxifyCSSRuleValuePairs(cssRuleValuePairs, ctx){
	let ruleName, ruleValue
	for(ruleName in cssRuleValuePairs){
		ruleValue = cssRuleValuePairs[ruleName]
		if(isMagic(ruleValue)){
			cssRuleValuePairs[ruleName] = ctxifyValue(ruleValue)
		}
		// else, leave it, no need to overwrite it when there's no magic.
	}
	return cssRuleValuePairs
}

// renderAnyElement
// renderStyleElement
// renderCSSRuleValuePairs
// renderCSSSelectorSet 
// renderCSSAtRule 
// renderHTMLAttribute

// this is a bunch of depth first traversal by the way

function renderAnyElement(globject){

	switch(realType(globject)){
		case 'String': return anyinput; break;
		case 'Array':  return anyinput.map(renderAnyElement).join('\n'); break;
		case 'Object': /* assertSchema('AnyElement', globject) */ break;
		default: throw new TypeError("renderAnyElement expects a String, Array, or Object")
	}

 	let [element, attributePairs] = Object.entries(globject).pop()

	var outerHTML = new Array
	var innerHTML = new Array

	if(element == '!'){
		return `\n<!-- ${JSON.stringify(attributePairs)} -->\n`
	}

	if(['String', 'Array'].includes(realType(attributePairs))){
		innerHTML.push(renderAnyElement(attributePairs))
		return interpolate(element, null, innerHTML)
	}
	if(element == 'style'){
		innerHTML.push(renderCSSSelectorSet(attributePairs))
		return interpolate(element, null, innerHTML)
	}

 	for(var attributeName in attributePairs){
 		if(attributePairs.hasOwnProperty(attributeName) == false){
 			continue
 		}
 		var attributeValue = attributePairs[attributeName]

		switch(attributeName){
 			case 'textContent':
 				innerHTML.push(attributeValue)
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

function interpolate(elementName, outerHTML, innerHTML){
	// cant deal with arguments of improper type, will throw error calling join
	return `<${elementName}${outerHTML.join(' ')}>${innerHTML.join('')}</${elementName}>\n`
}

function renderStyleElement(globject){
	//assertSchema('StyleElement', globject)
 	let [element, cssSelectorSet] = Object.entries(globject).pop()
 	return interpolate(element, null, renderCSSSelectorSet(cssSelectorSet))
}

/**
A selector set looks like 
TODO: array of rules support,

[ {h2: {
	  font-size: 32pt;
	  font-weight: normal;
	}},
	{h3: {
		font-size: 24pt;
		font-family: monospace;
	}}
]

or, normally, one name per object.

{
	h2: {
	  font-size: 32pt;
	  font-weight: normal;
	},
	h3: {
		font-size: 24pt;
		font-family: monospace;
	}
}

otherwise, you'll miss out on cascading rules, it will simply omit earlier values in your object.

If you want them to cascade, put them in arrays.

*/
function renderCSSSelectorSet(cssSelectorSet){
	if(Array.isArray(cssSelectorSet)){
		return cssSelectorSet.map(cssSelectorSet).join('\n')
	}
	let innerCSS = []
	for(cssSelector in cssSelectorSet){
		if(cssSelector[0] == '@'){
			atRuleValue = cssSelectorSets[cssSelector]
			innerCSS.push(`${cssSelector} {${renderCSSSelectorSet(atRuleValue)}}`)
		} else {
			ruleValuePairs = cssSelectorSets[cssSelector]
			innerCSS.push(`${cssSelector} {${renderCSSRuleValuePairs(ruleValuePairs)}}`)
		}
	}
	return interpolate('style', null, innerCSS.join(''))
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
	return Object.entries(RuleValuePairs).map(tuple =>
		`${tuple[0]}: ${tuple[1]};`
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

// realType
// isMagic
// parseMagic

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
	let magicWord = stringInput.slice(2, spaceIndex)
	let magicArg  = stringInput.slice(spaceIndex + 1)
	return [magicWord, magicArg]
}

module.exports = {
	ctxify, renderAnyElement
}