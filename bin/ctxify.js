const {
	realType,
	isMagic,
	parseMagic,
	rollupObjects,
	getModuleConfig
} = require('./util.js')

module.exports = {
	ctxify,
	ctxifyArray,
	ctxifyValue,
	ctxifyAnyElement,
	ctxifyStyleElement,
	ctxifyCSSSelectorSet,
	ctxifyCSSRuleValuePairs
}

const config = getModuleConfig('..')

/**
@return {promise}  resolves to {String | Array | Object}
**/
function ctxify(globject, ctx = {}){
	switch(realType(globject)){
		case 'String': return ctxifyValue(globject, ctx)
		case 'Array':  return ctxifyArray(globject, ctx)
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
	if(isMagic(attributeValue)){
		let [magicWord, magicArg] = parseMagic(attributeValue)
		return require(config[magicWord])(magicArg, null, ctx)
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
				if(propName == 'childNodes'){
					return {[propName]: await ctxifyArray(propValue, ctx)}
				} else if(propName == 'style'){
					return {[propName]: await ctxifyCSSRuleValuePairs(propValue, ctx)}
				} else if(realType(propValue) == 'String' && isMagic(propValue)){
					return {[propName]: await ctxifyValue(propValue, ctx)}
				} else if(realType(propValue) == 'Object'){
					return {[propName]: await ctxifyAnyElement(propValue, ctx)}
				} else {
					return {[propName]: propValue}
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
	// if(Array.isArray(cssSelectorSet)){
	// 	return cssSelectorSet.map(ctxifyCSSSelectorSet)
	// }
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
/**
cssRuleValuePairs looks like 
{
	rule: value,
	rule: value
}

Wait for all entries in the rules to return and resolve,
then reduce them into one big object and return that.
**/
async function ctxifyCSSRuleValuePairs(cssRuleValuePairs, ctx){
	//assertSchema('cssRuleValuePairs', cssRuleValuePairs)
	return Promise.all(
		Object.entries(cssRuleValuePairs)
			.map(async ([rule, value]) => {
				if(realType(value) == 'Object'){
					return {[rule]: await ctxifyValue(value, ctx)}
				}else if(isMagic(value)){
					return {[rule]: await ctxifyValue(value, ctx)}
				} else {
					return {[rule]: value}
				}
			})
	).then(cssRuleValueEntries => 
		cssRuleValueEntries.reduce(rollupObjects, new Object)
	)
}