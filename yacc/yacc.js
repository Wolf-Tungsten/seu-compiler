const fs = require('fs')

const inputPath = process.argv[2]
//const dfaPath = process.argv[3]

const { loadYaccFile } = require('./lib/loader')
const { yaccToGrammar, expandDFAItem, generateLR1DFA, LR1toLALR1, dfaToParsingTable } = require('./lib/core')

let yaccFile = fs.readFileSync(inputPath, 'utf8')
yaccFile = loadYaccFile(yaccFile)
let grammar = yaccToGrammar(yaccFile)

let I0 = {
    name:'I0', // DFA 项目名称
    items:{
        '0-0':{ // 0 是产生式编号 0 是点的位置
            predictor:['$'], // 预测符的集合
            position:0, // 点的位置，在开头表示为0
            rightPart:[grammar.start]
        }
    }
}


let LR1DFA = generateLR1DFA(I0, grammar)
let LALR1DFA = LR1toLALR1(LR1DFA)
let parsingTable = dfaToParsingTable(LALR1DFA, grammar)
console.log(DFA)
