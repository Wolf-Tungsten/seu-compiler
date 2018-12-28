function transformRangeExp (exp) {
    let input = exp.split('')
    let start = 0
    while (start < input.length) {
        if(input[start] === '[' && input[start+2] === '-' && input[start+4] === ']'){
            let rangeStart = input[start+1], rangeEnd = input[start+3]
            let chars = [rangeStart]
            while(rangeStart.charCodeAt() < rangeEnd.charCodeAt()){
                rangeStart = String.fromCharCode(rangeStart.charCodeAt()+1)
                chars.push(rangeStart)
            }
            chars = chars.join('|')
            chars = `(${chars})`
            chars = chars.split('')
            let head = input.slice(0, start)
            let tail = input.slice(start+5)
            input = head.concat(chars, tail)
        }
        start+=1
    }
    return input.join('')
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
            input = head.concat(['(','('], content, [')','|','@',')'], tail)
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
console.log(transformRangeExp('a[1-9]123212[a-z]b'))
