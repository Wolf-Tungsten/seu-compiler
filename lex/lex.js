const fs = require('fs')

const inputPath = process.argv[2]

process.stdout.write('正在读取lex输入...')
let lexFile = fs.readFileSync(inputPath, 'utf8')
let lexSegements = lexFile.split(/\r\n%%\r\n/)
let preDefine = lexSegements[0]
let regexDefine = lexSegements[1]
let userDefineProgram = lexSegements[2]

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
    return [replacePredefinedElements(lineSplit[0], preDefineRegex), lineSplit[1].trim()]
})

console.log('完成')
const { test, formalize, processUnicodeEscape, processRegexEscape, transformRangeExpAdvanced, transformNegRangeExp, insertPoint } = require('./lib/formalize')
const {postfix, thompson} = require('./lib/thompson')
const {nfa2dfa} = require('./lib/nfa2dfa')

process.stdout.write('规范化正则表达式...')
regexDefine = regexDefine.map((k, index) => {return {
    type:''+index,
    regex:formalize(k[0].trim()),
    action:k[1]
}})
console.log('完成')

process.stdout.write('通过thompson算法生成NFA...')
let stateBias = 1
let nfaList = []

regexDefine.forEach(define => {
    let nfa = thompson(postfix(define.regex), stateBias, define.type, define.action)
    stateBias = nfa.nextBias
    nfaList.push(nfa)
})
console.log('完成')

process.stdout.write('NFA转换成DFA.....')
let mainNfa = {
    start:'S0',
    end:[],
    stateList:[],
    S0:{'ø':[]},
    alphabet:{}
}


nfaList.forEach(nfa => {
    mainNfa.S0['ø'].push(nfa.start)
    mainNfa.stateList = mainNfa.stateList.concat(nfa.stateList)
    mainNfa.end = mainNfa.end.concat(nfa.end)
    nfa.stateList.forEach(stateName => {
        mainNfa[stateName] = nfa[stateName]
    })
    nfa.alphabet.forEach( letter => {
        mainNfa.alphabet[letter] = true
    })
})

mainNfa.alphabet = Object.keys(mainNfa.alphabet)

let dfa = nfa2dfa(mainNfa)
console.log('完成')

process.stdout.write('保存DFA为JSON格式...')
dfa.userDefineProgram = userDefineProgram
fs.writeFileSync('./DFA.json', JSON.stringify(dfa))
console.log('完成')

process.stdout.write('将DFA转换成CPP...')
const { dfaToCpp } = require('./lib/dfaToCpp')
dfaToCpp(dfa)
console.log('完成')

