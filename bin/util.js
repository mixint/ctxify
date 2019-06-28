/**
@ctxify/ctxify/bin/util

**/
const path = require('path')

module.exports = {
	getModuleConfig: fullpath => {
		let {dir} = path.parse(fullpath)
		return require(path.resolve(dir, 'package.json')).config
	},
	rollupPairs: (accumulator, current) => {
	  return Object.assign(accumulator, {[current.shift()]: current.shift()})
	},
	rollupObjects: (accumulator, current) => {
	  return Object.assign(accumulator, current)
	},
  realType: anyInput => {
		return Object.prototype.toString.call(anyInput).slice(8, -1)
	},
  isMagic: stringInput => {
		//assertSchema({type: 'string'}, stringInput)
		return stringInput[0] == '#' && stringInput[1] == '!'
	},
  parseMagic: stringInput => {
		//assertSchema({type: 'string'}, stringInput)
		let spaceIndex = stringInput.indexOf(' ')
		let magicWord = stringInput.slice(2, spaceIndex)
		let magicArg  = stringInput.slice(spaceIndex + 1)
		return [magicWord, magicArg]
	}
}