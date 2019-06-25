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
	// - props for a magic word
	// - the 'nextView' a magicWord is expected to process
	// - the name=attribute values for an HTML element (as a labeled object)
	if(isMagic(label)){

		//assertSchema('magicLabel', label)
		let [magicWord, magicArg] = parseMagic(attributeValue)
		let magicFunction = require('./magic/ctx.js')[magicWord] 
		return require(magicWord)(magicArg, props, ctx)
	} else if(label == 'style'){
		// assertSchema('StyleElement')
		return {'style': ctxifyCSSSelectorSet(props, ctx)}
	} else {
		//assertSchema('AnyElement')
		let propName, propValue
		for(propName in props){
			propValue = props[propName]

			if(propName == 'childNodes'){
				props[propName] = ctxifyArray(propValue, ctx)
			} else if(propName == 'style'){
				props[propName] = ctxifyCSSRuleValuePairs(propValue)
			} else if(realType(propValue) == 'String' && isMagic(propValue)){
				props[propName] = ctxifyValue(propValue, ctx)
			}
		}
		return {[label]: props}
	}
}

function ctxifyCSSAtRule(cssAtRule, ctx){

}

/**
a cssSelector Set exists as a member of a StyleElement or an At Rule,
An object (TODO: or an array of objects to concatenate into duplicate keys), 
must match schema CSSSelectorSet, 


**/
function ctxifyCSSSelectorSet(cssSelectorSet, ctx){
	let selector, cssRuleValuePairs

	for(selector in cssSelectorSet){
		cssRuleValuePairs = cssSelectorSet[selector]
		cssSelectorSet[selector] = ctxifyCSSRuleValuePairs(cssRuleValuePairs)
	}

	return cssSelectorSet
}

function ctxifyCSSRuleValuePairs(cssRuleValuePairs, ctx){
	let ruleName, ruleValue
	for(ruleName in cssRuleValuePairs){
		ruleValue = cssRuleValuePairs[ruleName]
		cssRuleValuePairs[ruleName] = ctxifyValue(ruleValue)
	}
}

// renderAnyElement
// renderStyleElement
// renderCSSRuleValuePairs
// renderCSSSelectorSet 
// renderCSSAtRule 
// renderHTMLAttribute


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
	return `<${element}${outerHTML.join(' ')}>${innerHTML.join('')}</${element}>\n`
}

function renderStyleElement(globject){
	//assertSchema('StyleElement', globject)
 	let [element, cssSelectorSets] = Object.entries(globject).pop()

	let selectorSets = []

	for(cssSelector in cssSelectorSets){
		if(cssSelectorSet[0] == '@'){
			cssAtRule = cssSelectorSets[cssSelector]
			selectorSets.push(`${cssSelector}{${renderCSSAtRule(cssAtRule)}}`)
		} else {
			ruleValuePairs = cssSelectorSets[cssSelector]
			selectorSets.push(`${cssSelector}{${renderCSSRuleValuePairs(ruleValuePairs)}}`)
		}
	}
	return `<style>${selectorSets.join('\n')}</style>\n`
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
	let spaceIndex = label.indexOf(' ')
	let magicWord = label.slice(2, spaceIndex)
	let magicArg  = label.slice(spaceIndex + 1)
	return [magicWord, magicArg]
}

module.exports = {
	ctxify, renderAnyElement
}