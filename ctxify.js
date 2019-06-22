
function realType(anyInput){
	return Object.prototype.toString.call(anyInput).slice(8, -1)
}
function isMagic(stringInput){
	return stringInput[0] == '#' && stringInput[1] == '!'
}


function ctxify(view, data){
	// upgrade strings to labeled objects with empty attributes - doesn't mean it will resolved to SLO, each magic word decides what it resolves to.
	if(realType(view) == 'String'){
		view = {[view]:{}}
	}
	// check if string or object...
	let [label, props] = Object.entries(view).pop()
	// props is either:
	// - empty
	// - props for a magic word
	// - the 'nextView' a magicWord is expected to process
	// - the name=attribute values for an HTML element (as a labeled object)


	if(isMagic(label)){
		let spaceIndex = label.indexOf(' ')

		if(spaceIndex < 0){
			throw new Error("Found a malformed special label: Must contain a magic word followed by an argument separated by a space")
		}
		if(spaceIndex == 2){
			throw new Error("Found a malformed special label, cannot have a space after the magic marker '#!', must have magic word.")
		}

		let magicWord = label.slice(2, spaceIndex);
		let magicArg  = label.slice(spaceIndex + 1);
		let magicFunction = require('./magic/ctx.js')[magicWord] 
		return magicFunction(magicArg, props, data)

	} else {
		// really you could just ctxify the whole graph recursively
		// but to save call stack space we'll skip anything thats not a child or magic.
		// this means magic inside of style objects won't be reached?
		// go over the allowed structure and decide where ctxify should be called
		// if ctxify can take an array and return an array, there's no need to check type in childNodes

		//labeled object, leave label intact, check each attribute
		for(var propName in props){ // props[propName] yields propValue
			if(propName == 'childNodes' || propName == 'children'){
				switch(realType(props[propName])){
					case 'Object':
						props[propName] = ctxify(props[propName]); break;
					case 'Array':
						props[propName] = props[propName].map(e => ctxify(e, data))
				}
			}
			if(propName == 'style'){
				// check each attribute, maybe break this function out to call on each attr
			}
			if(isMagic(props[propName])){
				// overwrite propName with resolved 
				props[propName] = ctxify(props[propName], data)
			}
		}
		console.log({[label]: props})
		return {[label]: props}
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
	// should throw an error if style is not a simple
	// string:string schema...
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
function formatAttribute(attrName, attrValue){
	return ` ${attrName}="${attrValue}"`
}

Object.prototype.toHTML = function(){
 	var [element, props] = Object.entries(this).pop()
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
 				innerHTML.push(...attribute.map(child => child.toHTML()))
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


module.exports = ctxify