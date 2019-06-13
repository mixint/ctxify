const magicWords = require('./magic/ctx.js')

function realType(anyInput){
	return Object.prototype.toString.call(anyInput).slice(8, -1)
}
function isMagic(stringInput){
	return stringInput[0] == '#' && stringInput[1] == '!'
}

module.exports.ctxify = function ctxify(view, data){
	// upgrade strings to labeled objects with empty attributes - doesn't mean it will resolved to SLO, each magic word decides what it resolves to.
	if(realType(view) == 'String'){
		view = {[view]:{}}
	}
	// check if string or object...
	let space = ' ' // literally just a space
	let [label, options] = Object.entries(view).pop()
	// options is either:
	// - empty
	// - options for a magic word
	// - the 'nextView' a magicWord is expected to process
	// - the name=attribute values for an HTML element (as a labeled object)


	if(isMagic(label)){
		let spaceIndex = label.indexOf(space)
		// label is special, of the form
		// '#!magicWord argument' ... if there is no space ?
		if(spaceIndex < 0){
			throw new Error("Found a malformed special label: Must contain a magic word followed by an argument separated by a space")
		}
		if(spaceIndex == 2){
			throw new Error("Found a malformed special label, cannot have a space after the magic marker '#!', must have magic word.")
		}

		let magicWord = label.slice(2, spaceIndex);
		let magicArg  = label.slice(spaceIndex + 1);
		let magicFunction = magicWords[magicWord] // this is cached, doesn't read from disk every time
		// target from above...		
		return magicFunction(magicArg, options, data, ctxify)

	} else {
		//labeled object, leave label intact, check each attribute
		for(var attribute in options){
			if(attribute == 'childNodes' || attribute == 'children'){
				switch(realType(options[attribute])){
					case 'Object':
						options[attribute] = ctxify(options[attribute]); break;
					case 'Array':
						options[attribute] = options[attribute].map(e => ctxify(e, data))
				}
			}
			if(isMagic(options[attribute])){
				// overwrite attribute with resolved 
				options[attribute] = ctxify(options[attribute], data)
			}
		}
		return {[label]: options}
	}
}

/**
 * @param {object} style
 * @return {string}
 * Take object of form {width: "100px", height: "50px"}
 * and return a string `width: 100px; height: 50px;`
 * These values ARE compatible with {{ }} templating
 */
function formatStyleRules(style, seperator = ' '){
	return Object.entries(style).map(tuple =>
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
function formatAttribute(prop, attribute){
	return ` ${prop}="${attribute}"`
}

module.exports.render = function renderHTML(graph){
 	var [element, props] = Object.entries(graph).pop()
	var outerHTML = new Array
	var innerHTML = new Array

	if(element == '!')
		return `<!-- ${props} -->\n`

 	for(var prop in props){
 		if(props.hasOwnProperty(prop) == false){
 			continue
 		}
 		var attribute = props[prop]
 		if(element.toUpperCase() == 'STYLE'){
 				// this is building the inner text of a style tag, 
 				// with a css rule match expected as a key and a rule as an object with rule/value pairs.
 				innerHTML.push(`\n${prop} {${formatStyleRules(attribute)}}\n`)
 		} else switch(prop){
 			case 'textContent':
 				innerHTML.push(attribute)
 				break
 			case 'style':
 				outerHTML.push(formatAttribute('style', formatStyleRules(attribute)))
 				break
 			case 'childNodes':
 				innerHTML.push(...attribute.map(child => renderHTML(child)))
 				break
 			default:
 				outerHTML.push(formatAttribute(prop, attribute))
 		}
	}
	return `<${element}${outerHTML.join(' ')}>${innerHTML.join('')}</${element}>`
}

// function handleString(){}
// function handleObject(){}
// function handleArray(){}

// switch(realType(view)){
// 	case 'Array':
// 	case 'Object':
// 	case 'String':
// 	default: throw new TypeError("ctxify can only handle Arrays, Objects, and Strings")
// }