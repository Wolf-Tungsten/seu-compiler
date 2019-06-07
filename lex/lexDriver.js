const fs = require('fs')

const inputPath = process.argv[2]
const dfaPath = process.argv[3]

let input = fs.readFileSync(inputPath, 'utf8')
let dfa = fs.readFileSync(dfaPath, 'utf8')

dfa = JSON.parse(dfa)

let state = 'I0'
let pointer = 0

while(pointer < input.length){
    let currentChar = input[pointer]
    if(dfa[state][currentChar]){
        // 有下一跳
        state = dfa[state][currentChar]
        pointer++
    } else if(dfa.end[state]) {
        // 当前是终态
        console.log(dfa.end[state][0].action)
        state = 'I0'
    } else {
        // 出错了
        console.log('出错')
    }
}