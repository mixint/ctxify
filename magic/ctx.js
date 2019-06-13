const path = require('path')

Object.prototype.dotAccess = function(dotpath){
	let localctx = Object.assign({}, this) // create copy of ctx
	let keys = dotpath.split('.')
	while(keys.length && localctx){
		localctx = localctx[keys.shift()] 
	}
	return localctx
}

module.exports.ctx = function _ctx(magicArg, nextView, data){
	// ctx will have been the magicWord,
	// magicArg the latter half of the special label

	//magicArg will typically be pulled as a dot notation into data
	//but may be a path if it begins with / or ./
	let newData = {
		ctx: require(magicArg)
	}
	//we're using magicArg to get new data,
	//merging new data with the old data ? or using instead of ...
	//then returning the result of ctxifying the target with this new data
	let modifiedData = Object.assign({}, newData, data)

	return ctxify(target, modifiedData)
}

module.exports.split = function _split(magicArg, nextView, data){
	let workingData = data.dotAccess(magicArg)
	if(realType(workingData) != 'String'){
		throw new TypeError("I can only split a string")
	}

	if(workingData.indexOf(',') >= 0){
		split = workingData.split(/\s*,\s*/)
	} else {
		split = workingData.split(/\s+/)
	}

	let newData = {split}

	let modifiedData = Object.assign({}, newData, data)

	return ctxify(target, modifiedData)
}

/***
    @param String magicArg
 	@param Object [options]
 	@param Object data

    @return String
 */
module.exports.write = function _write(magicArg, options, data){
	return data.dotAccess(magicArg)
}

module.exports.require = function _require(magicArg, options, data, ctxify){
	// arg is the name of the file
	// target is the options object in this case
	// {"#!require ./somecomponent":{}}
	// maybe these attributes get merged with the top level... could be useful...
	let pathName = path.join(process.cwd(), magicArg)
	console.log("pathname", pathName)

	let newTarget = require(pathName)
	//Object.assign(newTarget, target)

	let tagName = Object.keys(newTarget).pop()

	Object.assign(newTarget[tagName], options)

	return ctxify(newTarget, data)
}