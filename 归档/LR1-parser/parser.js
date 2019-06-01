const parserTable = require("./LR1-parserTable.json")
const fs = require('fs')

let input = process.argv[2]
input = fs.readFileSync(input, 'utf8')
input = JSON.parse(input)
 
input.tokenList.push({type:"$"}) // 在序列尾部增加 $
let reader = 0 // 读头位置

let stateStack = ["0"]
let symbolStack = []

while(true){
    let currentState = stateStack[stateStack.length - 1]
    let currentToken = input.tokenList[reader]
    if( parserTable.ACTION[currentState][currentToken.type] &&
        parserTable.ACTION[currentState][currentToken.type][0] === 'S') {
        // S的情况
        let t = parserTable.ACTION[currentState][currentToken.type].slice(1)
        stateStack.push(t)
        symbolStack.push(input.tokenList[reader])
        reader++
    } else if (parserTable.ACTION[currentState][currentToken.type] &&
        parserTable.ACTION[currentState][currentToken.type][0] === 'r') {
        // r的情况
        let n = parserTable.ACTION[currentState][currentToken.type].slice(1)
        let expression = parserTable.expression[n]
        for (let i = 0; i < expression.right.length; i++) {
            symbolStack.pop()
            stateStack.pop()
        }
        let t = stateStack[stateStack.length-1]
        stateStack.push(parserTable.GOTO[t][expression.left.name])
        symbolStack.push(expression.left)
        let right = []
        expression.right.forEach( k => {
            if(k.name){
                right.push(k.name)
            } else {
                right.push(k.type)
            }
        })
        console.log(`${expression.left.name} -> ${right.join(' ')}`)
    } else if (parserTable.ACTION[currentState][currentToken.type] &&
        parserTable.ACTION[currentState][currentToken.type] === 'acc') {
        // 成功
        console.log('完成')
        break
    } else {
        // 出错
        console.log('分析出错')
        break
    }
}