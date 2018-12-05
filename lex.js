function transformRangeExp (exp) {
    let input = exp.split('')
    let start = 0
    while (start < exp.length) {
        
    }
    // let start = rangeExp[1], end = rangeExp[3]
    // let chars = [start]
    // while (start.charCodeAt() < end.charCodeAt()) {
    //     start = String.fromCharCode(start.charCodeAt()+1)
    //     chars.push(start)
    // }
    // chars = chars.join('|')
    // return `(${chars})`
}

// 转换 ()? 形式的表达式
function transformZeroOrMore( exp ) {
    let input = exp.split('')
    let pointer = 0
    while (pointer < input.length) {
        if(input[pointer] === '?' && input[pointer-1] !== '\\') {
            let end = pointer - 1
            let count = 1
            let start = end
            while (count > 0) {
                start--
                if(start < 0){
                    throw '()?匹配出现问题'
                }
                if ((start !== 0 && input [start - 1] !== '\\' && input[start] === '(') ||
                    (start === 0 && input[start] === '(' )) {
                    count--
                } else if ((start !== 0 && input [start - 1] !== '\\' && input[start] === ')') ||
                           (start === 0 && input[start] === ')' )){
                    count++
                }
                //console.log(`start:${start}, count:${count}, ${input[start]}, end:${end}, ${input[end]}`)
            }
            // start -> ( , end -> )
            let head = input.slice(0, start)
            let tail = input.slice(end+2)
            let content = input.slice(start+1, end)
            //console.log(head)
            input = head.concat(['(','('], content, [')','|','@',')','*'], tail)
            pointer++
        } else {
           pointer++ 
        }
    }
    return input.join('')
}

// 转换 ()+ 形式的表达式
function transformOneOrMore( exp ) {
    let input = exp.split('')
    let pointer = 0
    while (pointer < input.length) {
        if(input[pointer] === '+' && input[pointer-1] !== '\\') {
            let end = pointer - 1
            let count = 1
            let start = end
            while (count > 0) {
                start--
                if(start < 0){
                    throw '()?匹配出现问题'
                }
                if ((start !== 0 && input [start - 1] !== '\\' && input[start] === '(') ||
                    (start === 0 && input[start] === '(' )) {
                    count--
                } else if ((start !== 0 && input [start - 1] !== '\\' && input[start] === ')') ||
                           (start === 0 && input[start] === ')' )){
                    count++
                }
                //console.log(`start:${start}, count:${count}, ${input[start]}, end:${end}, ${input[end]}`)
            }
            // start -> ( , end -> )
            let head = input.slice(0, start)
            let tail = input.slice(end+2)
            let content = input.slice(start+1, end)
            input = head.concat(['('], content, [')','('], content, [')','?'], tail)
            pointer++
        } else {
           pointer++ 
        }
    }
    return input.join('')
}
console.log(transformZeroOrMore(transformOneOrMore('((12)?a)+')))
