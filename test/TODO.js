
//TODO
// let test = {
// 	"my-div":{
// 		"style":{
// 			"border":"none",
// 			"box-sizing":"border-box"
// 		},
// 		"id":"somethingElse",
// 		"childNodes": [
// 			{"style":{
// 				"li.selected": {
// 					"border-color":"red",
// 					"border-style":"dotted",
// 					"border-width": ["#!write width","px"]
// 				},
// 				"li:not(.selected)": {
// 					"color": "gray"
// 				}
// 			}},
// 			{"ul":{
// 				"class":"someList",
// 				"style": {
// 					"list-decoration":"none",
// 				},
// 				"childNodes": [
// 					{"li": {
// 						"textContent":"#!write width"
// 					}},
// 					{"li": {
// 						"textContent": {
// 							"#!moment date": {
// 								"format":'LLLL',
// 								"locale": "zh-cn"
// 							}
// 						}
// 					}},
// 					{"li": {
// 						"class":"selected",
// 						"textContent": ["two","#!write width", "four"]
// 					}},
// 					{"li": {"textContent": "three"}}
// 				]
// 			}}
// 		]
// 	}
// }


// ctxify(test, {width: "3", date: new Date()}).then(glob => {
// 	console.log(glob)
// 	console.log(renderAnyElement(glob))
// }).catch(console.log)

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
/**
ctxify(["hello ",{"img": {"src": "/img/world"}}," world"]).then(ctx => renderAnyElement(ctx)).then(console.log)
ctxify(["hello ",{"a": {"href": "/img/world", "textContent":"clicky"}}," world"]).then(ctx => renderAnyElement(ctx)).then(console.log)
**/

/**
var examplePairs = {
	"width": ["#!write test.width","#!write test.unit"],
	"height": ["#!write test.height","#!write test.unit"],
}

var exampleCtx = {
	"test": {
		"width": 100,
		"height": 300,
		"unit": "px"
	}
}

var result = ctxifyRuleValuePairs(examplePairs, exampleCtx)

assert.equal(result, {
	width: "100px",
	height: "300px"
})
**/
/**
### ctxifyCSSSelectorSet

**/

/**
### ctxifyAtRule
Should be able to keep different @media globjects around, so you can...

{style:{
	"@media min-width 800px": "#!require largeLayout.glom.json",
	"@media max-width 600px": "#!require minLayout.glom.json"
}}
**/
/**
A selector set looks like 
TODO: array of rules support,

[ {h2: {
	  font-size: 32pt;
	  font-weight: normal;
	}},
	{h3: {
		font-size: 24pt;
		font-family: monospace;
	}}
]

or, normally, one name per object.

{
	h2: {
	  font-size: 32pt;
	  font-weight: normal;
	},
	h3: {
		font-size: 24pt;
		font-family: monospace;
	}
}

otherwise, you'll miss out on cascading rules, it will simply omit earlier values in your object.

If you want them to cascade, put them in arrays.

*/