// 中缀表达式转后缀表达式
function postfix(exp){
    let stack = [], output = []
    let pointer = 0
    while(pointer < exp.length){
        // 运算符和左括号
        if ( exp[pointer] === '*' && exp[pointer-1] !== '\\' ||
        exp[pointer] === '|' && exp[pointer-1] !== '\\' ||
        exp[pointer] === '(' && exp[pointer-1] !== '\\' ||
        exp[pointer] === '•' && exp[pointer-1] !== '\\' 
        ) {
            stack.push(exp[pointer])
        } else if (exp[pointer] === ')' && exp[pointer-1] !== '\\') {
            // 右括号
            let top = stack.pop()
            while(top!=='('){
                output.push(top)
                top = stack.pop()
            }
        } else {
            output.push(exp[pointer])
        }
        pointer++
    }
    while(stack.length>0){
        output.push(stack.pop())
    }
    return output.join('')
}

console.log(postfix('((a|(b)))*'))