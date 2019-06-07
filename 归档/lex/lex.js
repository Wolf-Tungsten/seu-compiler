const {transformOneOrMore, transformZeroOrMore, transformRangeExp, insertPoint} = require('./lib/formalize')
const {postfix, thompson} = require('./lib/thompson')
const {nfa2dfa} = require('./lib/nfa2dfa')

const fs = require('fs')
const lexFilePath = process.argv[2]

console.log('正在将LexFile转换成DFA...')

let lex = fs.readFileSync(lexFilePath, 'utf8')
lex = JSON.parse(lex)
let stateBias = 1
let nfaList = []
Object.keys(lex).forEach(type => {
    let item = lex[type]
    let exp = insertPoint(transformZeroOrMore(transformOneOrMore(transformRangeExp(item.regExp))))
    console.log(exp)
    let nfa = thompson(postfix(exp), stateBias, type)
    stateBias = nfa.nextBias
    nfaList.push(nfa)
})
// 产生一系列nfa，下面将nfa合并
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
console.log(mainNfa)
let dfa = nfa2dfa(mainNfa)
fs.writeFileSync('./DFA.json', JSON.stringify(dfa))
console.log(dfa.end)

