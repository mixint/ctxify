
class ctxify extends transflect {
    constructor(){ super() }

    /**
     * @param {ParsedMessage} source
     * @return {WriteStream}
     * return newly created file writeStream so that it is closed on error or end
     * in the event the connection is aborted before writing is finished,
     * simplewrite does NOT delete the unfinished file, but it will close it to avoid fd leak
     * perhaps a more sophisticated transfect would write to a /tmp/ folder and only copy to overwrite
     * the destination once the connection is closes, to avoid destroying the original file
     */
    async _open(source){

        this.view = source.query.v || source.query.view || '~/.view.slo.json'
        this.error = '~/.error.json'
        this.preview = '~/.preview.json'
        this.data = {
            url: source.parsedUrl,
            env: process.env
            path: source.parsedPath
        }

        // before moving on, just check if the requested directory exists
        // if it doesn't exist, pull ~/.error.slo.json
        //                           ~/.preview.slo.json

        // have to grab path....
        // maybe.... render() takes null, data 
        // if first argument is an object, render error.slo.json, 
    }
    
    /* if we've got this far without throwing an error we're home free */
    // TODO this returns a Content-Length 0, well the response body is empty.
    // I've been thinking that content-length and hash could be returned.
    // This would be useful to copy the File API used in npm formidable
    async _end(done){
        // a series of wait... wait.... wait...
        // send version and module info + preview of page,
        // when preview graph is resolved, send that one too,
        // then render HTML
        // a future ctxify-lookalive will keep the connection open and resend the graph when something changes
        // or simple send a meta tag refresh

        done(null, ctxify(this.view, this.data))
    }

    documentWriteHead(){

    }

    documentWrite(labeledObject){
        var [element, props] = Object.entries(labeledObject).pop()
        var outerHTML = new Array
        var innerHTML = new Array

        if(element == '!')
            return `<!-- ${props} -->\n`

        for(var prop in props){
            if(props.hasOwnProperty(prop) == false){
                continue
            }
            var attribute = props[prop]
            if(element.toLowerCase() == 'style'){
                    // this is building the inner text of a style tag, 
                    // with a css rule match expected as a key and a rule as an object with rule/value pairs.
                    innerHTML.push(`\n${prop} {${formatStyleRules(attribute)}}\n`)
            } else switch(prop.toLowerCase()){
                case 'textcontent':
                    innerHTML.push(attribute)
                    break
                case 'style':
                    outerHTML.push(formatAttribute('style', formatStyleRules(attribute)))
                    break
                case 'childnodes':
                    innerHTML.push(...attribute.map(child => this.documentWrite(child)))
                    break
                default:
                    outerHTML.push(formatAttribute(prop, attribute))
            }
        }
        return `<${element}${outerHTML.join(' ')}>${innerHTML.join('')}</${element}>`
    }
    }
}