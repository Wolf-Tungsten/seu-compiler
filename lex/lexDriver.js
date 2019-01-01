const fs = require('fs')

const inputPath = process.argv[2]
const dfaPath = process.argv[3]

let input = fs.readFileSync(inputPath, 'utf8')
let dfa = fs.readFileSync(dfaPath, 'utf8')

dfa = JSON.parse(dfa)

let state = 'I0'
let buf = []
let tokenList = []
let pointer = 0
while(pointer < input.length){
    if(input[pointer]==='\n' || input[pointer]===' '){
        // 检测到分隔符
        let possibleEnd = dfa.end[state];
        if(!possibleEnd){
            if(state === 'I0'){
                // 连续分隔符
                pointer++
            } else {
            // 不是终态也不是I0但是出现分隔符，出错
                console.log(`-词法分析错误-\n${input.slice(0, pointer+1)}<-`)
                console.log(tokenList)
                break
            }
        } else {
            tokenList.push({
                type:possibleEnd[0],
                literal:buf.join('')
            })
            buf = []
            state = 'I0'
            pointer++
        }
    } else {
        // 不是分隔符
        let currentChar = input[pointer]
        let nextState = dfa[state][currentChar]
        if(!nextState){
            //如果下一跳找不到，检查是否为终态
            let possibleEnd = dfa.end[state]
            if(!possibleEnd){
                // 不是终态但是没有下一步，出错
                console.log(`-词法分析错误-\n${input.slice(0, pointer+1)}<-`)
                break
            } else {
                tokenList.push({
                    type:possibleEnd[0],
                    literal:buf.join('')
                })
                buf = []
                state = 'I0'
            }
        } else {
            buf.push(input[pointer])
            state = nextState
            pointer++
        }
    }
}

if(buf.length !== 0){
    console.log('词法分析终止')
}

fs.writeFileSync('./lex-out.json', JSON.stringify({tokenList}))
let beautifulOut = []
tokenList.forEach(t => {
    beautifulOut.push(`<${t.type}, ${t.literal}>`)
})
beautifulOut = beautifulOut.join('\n')
fs.writeFileSync('./lex-out-beautiful.txt', beautifulOut)

console.log('词法分析完成，结果保存至 lex-out.json 和 lex-out-beautiful.txt')