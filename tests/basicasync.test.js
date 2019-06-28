const {
	ctxify,
	ctxifyCSSRuleValuePairs,
	ctxifyCSSSelectorSet,
	
} = require('../ctxify')
const {
 	renderAnyElement
} = require('../bin/render')

let ruleValuePairs = {
	"border":"none",
	"box-sizing":"border-box",
	"color": "pink",
	"text-decoration": "none",
}

let selectorSet = {
	"*": {
		"box-sizing":"border-box",
		"padding":"none"
	},
	"li.selected": {
		"border-color": "red",
		"border-style": "dotted",
		"border-width": "3px"
	}
}

ctxify("hello").then(console.log)
ctxifyCSSRuleValuePairs(ruleValuePairs).then(console.log).catch(console.log)
ctxifyCSSSelectorSet(selectorSet).then(console.log).catch(console.log)

let test = {
	"my-div":{
		"style":{
			"border":"none",
			"box-sizing":"border-box"
		},
		"id":"somethingElse",
		"childNodes": [
			{"style":{
				"li.selected": {
					"border-color":"red",
					"border-style":"dotted",
					"border-width":"#!write width"
				}
			}},
			{"ul":{
				"class":"someList",
				"style": {
					"list-decoration":"none",
				},
				"childNodes": [
					{"li": {"textContent": "#!write width"}},
					{"li": {"textContent": {"#!moment date": {"format":'LLLL',"locale": "zh-cn"}}}},
					{"li": {
						"class":"selected",
						"textContent": "two"
					}},
					{"li": {
						"textContent": "three"
					}}
				]
			}}
		]
	}
}


ctxify(test, {width: "3px", date: new Date()}).then(glob => {
	console.log(glob)
	console.log(renderAnyElement(glob))
}).catch(console.log)
/**
{ border: 'none',
  'box-sizing': 'border-box',
  color: 'pink',
  'text-decoration': 'none' }
{ '*': { 'box-sizing': 'border-box', padding: 'none' },
  'li.selected':
   { 'border-color': 'red',
     'border-style': 'dotted',
     'border-width': '3px' } }
{ 'my-div':
   { style: { border: 'none', 'box-sizing': 'border-box' },
     id: 'somethingElse',
     childNodes:
      [ { style:
           { 'li.selected':
              { 'border-color': 'red',
                'border-style': 'dotted',
                'border-width': '3px' } } },
        { ul:
           { class: 'someList',
             style: { 'list-decoration': 'none' },
             childNodes:
              [ { li: { textContent: 'one' } },
                { li: { class: 'selected', textContent: 'two' } },
                { li: { textContent: 'three' } }
               ]
            }

  				}
				] 
			}
		}
  **/