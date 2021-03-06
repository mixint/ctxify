module.exports = {
	rollupPairs: (accumulator, current) => {
	  return Object.assign(accumulator, {[current.shift()]: current.shift()})
	},
	rollupObjects: (accumulator, current) => {
		// this function is spoonfed each object that is being committed to the graph
		// so here's the opportunity to
		// this.emit(new Event('glitch', 'timecode namespace+dotaccess JSON encoded value'))
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
		let magicWord = ~spaceIndex ? stringInput.slice(2, spaceIndex ) : stringInput.slice(2)
		let magicArg  = ~spaceIndex ? stringInput.slice(spaceIndex + 1) : undefined
		return [magicWord, magicArg]
	}
}