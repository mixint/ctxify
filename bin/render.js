
// renderAnyElement
// renderStyleElement
// renderCSSRuleValuePairs
// renderCSSSelectorSet 
// renderCSSAtRule 
// renderHTMLAttribute

// this is a bunch of depth first traversal by the way

const {
	rollupPairs,
	rollupObjects,
	realType,
	isMagic,
	parseMagic
} = require(__dirname + '/util.js')

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
		return interpolate(element, outerHTML, innerHTML)
	}
	if(element == 'style'){
		innerHTML.push(renderCSSSelectorSet(attributePairs))
		return interpolate(element, outerHTML, innerHTML)
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
			atRuleValue = cssSelectorSet[cssSelector]
			innerCSS.push(`${cssSelector} {${renderCSSSelectorSet(atRuleValue)}}`)
		} else {
			ruleValuePairs = cssSelectorSet[cssSelector]
			innerCSS.push(`${cssSelector} {${renderCSSRuleValuePairs(ruleValuePairs)}}`)
		}
	}
	return interpolate('style', undefined, innerCSS)
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

function interpolate(elementName, outerHTML = [], innerHTML = []){
	// cant deal with arguments of improper type, will throw error calling join
	return `<${elementName}${outerHTML.join(' ')}>${innerHTML.join('')}</${elementName}>\n`
}

module.exports = {
	renderAnyElement,
	renderStyleElement,
	renderCSSSelectorSet,
	renderCSSRuleValuePairs,
	renderHTMLAttribute
}