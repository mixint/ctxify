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


const emptyElementList = require('./emptyElementList.json')
const {rollupObjects, realType, isMagic, parseMagic} = require('./util.js')

module.exports = class ctxify {
	constructor(config){
		this.config = config
	}

	/**
	@return {promise}  resolves to {String | Array | Object}
	**/
	ctxify(globject, ctx = {}){
		switch(realType(globject)){
			case 'Array' : return this.ctxifyArray(globject, ctx)
			case 'String': return this.ctxifyValue(globject, ctx)
			case 'Object': return this.ctxifyAnyElement(globject, ctx)
		}
	}

	/**
	@return {promise} resolves to {array}
	**/
	ctxifyArray(globjects, ctx){
		return Promise.all(
			globjects.map(globject => 
				this.ctxify(globject, ctx)
			)
		)
	}

	/**
	Requires the function described by the magic word,
	function may be async or not.
	If it is, calling it returns a promise. If it's not, it returns whatever it wants.
	@return {Promise|Any} resolves to {Any}
	**/
	async ctxifyValue(attributeValue, ctx){
		if(isMagic(attributeValue)){
			let [magicWord, magicArg] = parseMagic(attributeValue)
			return require(
				this.config[magicWord]
			).call(
				this, magicArg, null, ctx
			)		
		} else {
			return attributeValue
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
	async ctxifyAnyElement(globject, ctx){
		let [label, props] = Object.entries(globject).pop()

		if(isMagic(label)){
			//assertSchema('magicLabel', label)
			let [magicWord, magicArg] = parseMagic(label)
			return require(
				this.config[magicWord]
			).call(
				this, magicArg, props, ctx
			)
		} else if(label == 'style'){
			return this.ctxifyStyleElement(globject, ctx)
		} else {
			//assertSchema('AnyElement')
			return Promise.all(
				Object.entries(props).map(async ([propName, propValue]) => {
					if(propName == 'style'){
						return {[propName]: await this.ctxifyCSSRuleValuePairs(propValue, ctx)}
					} else {
						return {[propName]: await this.ctxify(propValue, ctx)}
					}
				})
			).then(propEntries => ({
				[label]: propEntries.reduce(rollupObjects, new Object)
			}))
		}
	}

	async ctxifyStyleElement(globject, ctx){
		let [label, props] = Object.entries(globject).pop()
		return {'style': await this.ctxifyCSSSelectorSet(props, ctx)}
	}

	/**
	a cssSelector Set exists as a member of a StyleElement or an At Rule,
	An object (TODO: or an array of objects to concatenate into duplicate keys), 
	must match schema CSSSelectorSet, 

	@param {object} cssSelectorSet
	@param {object} ctx
	@return {object} the same object structure with all the rule pairs checked for magic values.
	**/
	async ctxifyCSSSelectorSet(cssSelectorSet, ctx = {}){
		if(Array.isArray(cssSelectorSet)){
			return Promise.all(
				cssSelectorSet.map(each =>
					this.ctxifyCSSSelectorSet(each, ctx)
				)
			)
		}
		return Promise.all(
			Object.entries(cssSelectorSet).map(
				async ([selector, RuleValuePairs]) => {
					if(selector[0] == '@'){
						return {[selector]: await this.ctxifyCSSSelectorSet(RuleValuePairs, ctx)}
					} else {
						return {[selector]: await this.ctxifyCSSRuleValuePairs(RuleValuePairs, ctx)}
					}
				})
			)
			.then(cssSelectorEntries => 
				cssSelectorEntries.reduce(rollupObjects, new Object)
			)
	}

	async ctxifyCSSRuleValuePairs(cssRuleValuePairs, ctx){
		//assertSchema('cssRuleValuePairs', cssRuleValuePairs)
		return Promise.all(
			Object.entries(cssRuleValuePairs)
				.map(async ([rule, value]) => (
					{[rule]: await this.ctxify(value, ctx)}
				))
		).then(cssRuleValueEntries => 
			cssRuleValueEntries.reduce(rollupObjects, new Object)
		)
	}

	render(globject){
		switch(realType(globject)){
			case 'String': return globject; break;
			case 'Array':  return globject.map(each => this.render(each)).join(''); break;
			case 'Object': /* assertSchema('AnyElement', globject) */ break;
			default: throw new TypeError("render expects a String, Array, or Object")
		}

 		let [element, attributePairs] = Object.entries(globject).pop()
		let outerHTML = new Array
		let innerHTML = new Array

		if(element == '!'){
			return `\n<!-- ${JSON.stringify(attributePairs)} -->\n`
		} else if(['String', 'Array'].includes(realType(attributePairs))){
			innerHTML.push(this.render(attributePairs))
			return this.interpolate(element, outerHTML, innerHTML)
		} else if(element == 'style'){
			return this.renderCSSSelectorSet(attributePairs)
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
	 				innerHTML.push(...attributeValue.map(each => this.render(each)))
	 				break
	 			case 'style':
	 				attributeValue = this.renderCSSRuleValuePairs(attributeValue)
	 				outerHTML.push(this.renderHTMLAttribute(attributeName, attributeValue))
	 				break
	 			default:
	 				outerHTML.push(this.renderHTMLAttribute(attributeName, attributeValue))
	 		}
		}
		return this.interpolate(element, outerHTML, innerHTML)
	}

	renderStyleElement(globject){
		//assertSchema('StyleElement', globject)
	 	let [element, cssSelectorSet] = Object.entries(globject).pop()
	 	return this.interpolate(element, null, this.renderCSSSelectorSet(cssSelectorSet))
	}

	renderCSSSelectorSet(cssSelectorSet, seperator = '\n'){
		if(Array.isArray(cssSelectorSet)){
			return cssSelectorSet.map(each => this.renderCSSSelectorSet(each)).join(seperator)
		} else {
			return Object.entries(cssSelectorSet).map(
				([selector, ruleValuePair]) => 
					selector[0] == '@'
						? `${selector} {${this.renderCSSSelectorSet(ruleValuePair)}}`
						: `${selector} {${this.renderCSSRuleValuePairs(ruleValuePair)}}`
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
	renderCSSRuleValuePairs(RuleValuePairs, seperator = ' '){
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
	renderHTMLAttribute(attrName, attrValue){
		// assertSchema(attributeName, attrName)
		// assertSchema(attributeValue, attrValue)
		attrValue = attrValue.replace('"', '&quot;')
		attrValue = attrValue.replace('&', '&amp;')
		return ` ${attrName}="${attrValue}"`
	}

	interpolate(elementName, outerHTML = [], innerHTML = []){
		elementName = elementName.toLowerCase()
		// cant deal with arguments of improper type, will throw error calling join
		// how about a script tag with no innerHTML? leave out the end tag? spose it doesn't matter
		if(emptyElementList.includes(elementName)){
			return `\n<${elementName}${outerHTML.join(' ')}>`
		} else {
			return `\n<${elementName}${outerHTML.join(' ')}>${innerHTML.join('')}</${elementName}>`
		}
	}
}