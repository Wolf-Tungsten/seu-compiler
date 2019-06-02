const fs = require('fs')

const inputPath = process.argv[2]
//const dfaPath = process.argv[3]

let lexFile = fs.readFileSync(inputPath, 'utf8')
let lexSegements = lexFile.split(/\r\n%%\r\n/)
let preDefine = lexSegements[0]
let regexDefine = lexSegements[1]
let userDefine = lexSegements[2]

let preDefineProgram = preDefine.split('\r\n%}\r\n')[0]
let preDefineRegexs = preDefine.split('\r\n%}\r\n')[1].split('\r\n').slice(1, -1)
// 正则表达式的替换字符
let preDefineRegex = {} 
preDefineRegexs.forEach( l => {
    preDefineRegex[l.split(/[\t\s]+/)[0]] = l.split(/[\t\s]+/)[1].trim()
})
//console.log(preDefineRegex)

//console.log(regexDefine.split(/\}[\r\n]+/))

const { replacePredefinedElements, escapeQuotation } = require('./lib/lexFileParse')
regexDefine = regexDefine.split(/\}[\r\n]+/).slice(0, -1).map(l => {
    let lineSplit = l.split(/[\t\s]+{/);
    return [escapeQuotation(replacePredefinedElements(lineSplit[0], preDefineRegex)), lineSplit[1].trim()]
})

const { formalize, processUnicodeEscape, processRegexEscape, transformRangeExpAdvanced, transformNegRangeExp } = require('./lib/formalize')
regexDefine = regexDefine.map(k => [formalize(k[0]), k[1]])

console.log(regexDefine)
