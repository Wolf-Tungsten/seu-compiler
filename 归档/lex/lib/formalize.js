function transformRangeExp(exp) {
    let input = exp.split('')
    let start = 0
    try {
        while (start < input.length) {
            if (input[start] === '[' && input[start - 1] !== '\\' && input[start + 2] === '-' && input[start + 4] === ']') {
                let rangeStart = input[start + 1], rangeEnd = input[start + 3]
                let chars = [rangeStart]
                while (rangeStart.charCodeAt() < rangeEnd.charCodeAt()) {
                    rangeStart = String.fromCharCode(rangeStart.charCodeAt() + 1)
                    chars.push(rangeStart)
                }
                chars = chars.join('|')
                chars = `(${chars})`
                chars = chars.split('')
                let head = input.slice(0, start)
                let tail = input.slice(start + 5)
                input = head.concat(chars, tail)
            }
            start += 1
        }
    } catch (e) {
        throw '解析区间表达式时出现错误'
    }
    return input.join('')
}

// 转换 ()? 形式的表达式
function transformZeroOrMore(exp) {
    let input = exp.split('')
    let pointer = 0
    while (pointer < input.length) {
        if (input[pointer] === '?' && input[pointer - 1] !== '\\') {
            let end = pointer - 1
            let count = 1
            let start = end
            while (count > 0) {
                start--
                if (start < 0) {
                    throw '()?匹配出现问题'
                }
                if ((start !== 0 && input[start - 1] !== '\\' && input[start] === '(') ||
                    (start === 0 && input[start] === '(')) {
                    count--
                } else if ((start !== 0 && input[start - 1] !== '\\' && input[start] === ')') ||
                    (start === 0 && input[start] === ')')) {
                    count++
                }
                //console.log(`start:${start}, count:${count}, ${input[start]}, end:${end}, ${input[end]}`)
            }
            // start -> ( , end -> )
            let head = input.slice(0, start)
            let tail = input.slice(end + 2)
            let content = input.slice(start + 1, end)
            //console.log(head)
            input = head.concat(['(', '(', '('], content, [')', '*', ')', '|', 'ø', ')'], tail)
            pointer++
        } else {
            pointer++
        }
    }
    return input.join('')
}

// 转换 ()+ 形式的表达式
function transformOneOrMore(exp) {
    let input = exp.split('')
    let pointer = 0
    while (pointer < input.length) {
        if (input[pointer] === '+' && input[pointer - 1] !== '\\') {
            let end = pointer - 1
            let count = 1
            let start = end
            while (count > 0) {
                start--
                if (start < 0) {
                    throw '()?匹配出现问题'
                }
                if ((start !== 0 && input[start - 1] !== '\\' && input[start] === '(') ||
                    (start === 0 && input[start] === '(')) {
                    count--
                } else if ((start !== 0 && input[start - 1] !== '\\' && input[start] === ')') ||
                    (start === 0 && input[start] === ')')) {
                    count++
                }
                //console.log(`start:${start}, count:${count}, ${input[start]}, end:${end}, ${input[end]}`)
            }
            // start -> ( , end -> )
            let head = input.slice(0, start)
            let tail = input.slice(end + 2)
            let content = input.slice(start + 1, end)
            input = head.concat(['('], content, [')', '•','('], content, [')', '?'], tail)
            pointer++
        } else {
            pointer++
        }
    }
    return input.join('')
}

// 将表达式规范化 - BUG
function formalize(exp){
    // 假设()是完整加好的，需要添加•(option+8)符号
    /* 不需要添加 • 的位置： 
    | 的前后
    * 前后
    ) 前面
    ( 后面
    */
   let input = exp.split('')
   let start = 0
   while (start < input.length - 1) {
       // 跳过不加•的情况
       if (
           input[start] === '|' && input[start-1] !== '\\'||
           input[start-1] === '|' && input[start-2] !== '\\'||
           input[start] === '*' && input[start-1] !== '\\'||
           input[start-1] === '*' && input[start-2] !== '\\'||
           input[start] === '•' && input[start-1] !== '\\'||
           input[start-1] === '•' && input[start-2] !== '\\'||
           input[start] === '(' && input[start-1] !== '\\'||
           input[start] === ')' && input[start-1] !== '\\'
       ) {
           start++
           continue
       }
       let head = input.slice(0, start+1)
       let tail = input.slice(start+1)
       input = head.concat(['•'], tail)
       start ++
   }
   return input.join('')

}
// 测试 标准C变量名 ([A-Z]|[a-z])+([A-Z]|[a-z]|[0-9])?
//let testExp = '(([A-Z]|[a-z])+)•(([A-Z]|[a-z]|[0-9])?)'
//console.log(transformZeroOrMore(transformOneOrMore(transformRangeExp(testExp))))

function insertPoint(exp){
    let input = exp.split('')
    let start = 0
    let specialCase = ['(',')','|','*','•']
    while (start < input.length-1) {
        if(specialCase.indexOf(input[start]) === -1 
        && specialCase.indexOf(input[start+1]) === -1 && input[start+1]){
            if(input[start] === '\\'){
                if(input[start+2] && specialCase.indexOf(input[start+2]) === -1){
                    // 转义字符特殊处理
                    let head = input.slice(0, start+2)
                    let tail = input.slice(start+2)
                    input = head.concat(['•'], tail)
                }
                start += 3
                continue
            }
            let head = input.slice(0, start+1)
            let tail = input.slice(start+1)
            input = head.concat(['•'], tail)
            start += 2
            continue
        }
        start += 1
        
    }
    return input.join('')
}
module.exports = {transformOneOrMore, transformZeroOrMore, transformRangeExp, insertPoint}