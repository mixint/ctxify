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
const {
	ctxify,
	ctxifyArray,
	ctxifyValue,
	ctxifyAnyElement,
	ctxifyStyleElement,
	ctxifyCSSSelectorSet,
	ctxifyCSSRuleValuePairs
} = require('bin/ctxify.js')
const {
	renderAnyElement,
	renderStyleElement,
	renderCSSSelectorSet,
	renderCSSRuleValuePairs,
	renderHTMLAttribute
} = require('bin/render.js')

module.exports = {
	ctxify,
	ctxifyAnyElement,
	ctxifyStyleElement,
	ctxifyCSSSelectorSet,
	ctxifyCSSRuleValuePairs,
	renderAnyElement,
	renderStyleElement,
}