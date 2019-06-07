let escapeMap = {
    '+':'\\+',
    '*':'\\*',
    '•':'\\•',
    '(':'\\(',
    ')':'\\)',
    '[':'\\[',
    ']':'\\]',
    '-':'\\-',
    '^':'\\^',
    '?':'\\?',
    '|':'\\|',
    '.':'\\.',
    '\\':'\\\\'
}

let escapeMapReverse = {
    '\\+':'+',
    '\\*':'*',
    '\\•':'•',
    '\\(':'(',
    '\\)':')',
    '\\[':'[',
    '\\]':']',
    '\\-':'-',
    '\\^':'^',
    '\\?':'?',
    '\\|':'|',
    '\\.':'.',
    '\\\\':'\\'
}
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

function transformRangeExpAdvanced(exp){
    let input = processRegexEscape(exp)
    let start = 0
    try{
        while(start < input.length){
            if(input[start]==='['){
                let end = start
                while(!(input[end]===']')){end++}
                // start 指向区间表达开始的 [
                // end 指向区间表达式结束的 ]
                let rangeContent = []
                for(let i = start; i < end; i++){
                    if(input[i]==='-'){
                        // i 指向区间中的 - 
                        let rangeStart = input[i-1]
                        if(escapeMapReverse[rangeStart]){
                            rangeStart = escapeMapReverse[rangeStart]
                        }
                        let rangeEnd = input[i+1]
                        if(escapeMapReverse[rangeEnd]){
                            rangeEnd = escapeMapReverse[rangeEnd]
                        }
                        for(let charCode = rangeStart.charCodeAt(); charCode <= rangeEnd.charCodeAt(); charCode++){
                            let char = String.fromCharCode(charCode)
                            if(escapeMap[char]){
                                char = escapeMap[char]
                            }
                            rangeContent.push(char)
                        }
                    } else if(i!==start && i!==end && input[i-1] !== '-' && input[i+1] !== '-'){
                        rangeContent.push(input[i])
                    }
                }
                let head = input.slice(0, start)
                let tail = input.slice(end+1) 
                input = head.concat('(',rangeContent.join('|'),')', tail)               
            }
            start = start + 1
        }
    }catch(e){
        console.log('解析区间表达式时出错')
        throw e
    }
    return input.join('')
}

// 转换 [^]形式表达式
function transformNegRangeExp(exp) {
    let input = processRegexEscape(exp)
    let start = 0
    while(start < input.length){
        if(input[start] === '[' && input[start+1] === '^'){
            let end = start+1
            while(!(input[end]===']')){ end++ }
            let negCharSet = input.slice(start+2, end)
            let charSet = []
            for(let charCode=0; charCode < 127; charCode++){
                let c = String.fromCharCode(charCode)
                if(escapeMap[c]){
                    c = escapeMap[c]
                }
                if(negCharSet.indexOf(c) !== -1){
                    continue
                }
                charSet.push(c)
            }
            charSet = charSet.join('|')
            let head = input.slice(0, start)
            let tail = input.slice(end+1)
            input = head.concat('(', charSet, ')', tail)
        }
        start++
    }
    return input.join('')
}

function transformAllExp(exp){
    let input = processRegexEscape(exp)
    let start = 0
    let charSet = []
    for(let charCode=0; charCode < 127; charCode++){
        let c = String.fromCharCode(charCode)
        if(escapeMap[c]){
            c = escapeMap[c]
        }
        charSet.push(c)
    }
    charSet = charSet.join('|')
    charSet = `(${charSet})`
    while(start < input.length){
        if(input[start]==='.'){
            input[start] = charSet
        }
        start++
    }
    return input.join('')
}
// 转换 ()? 形式的表达式
function transformZeroOrMore(exp) {
    let input = processRegexEscape(exp)
    let pointer = 0
    while (pointer < input.length) {
        if (input[pointer] === '?') {
            let end = pointer - 1
            let count = 1
            let start = end
            while (count > 0) {
                start--
                if (start < 0) {
                    throw '()?匹配出现问题'
                }
                if ((start !== 0 && input[start] === '(') ||
                    (start === 0 && input[start] === '(')) {
                    count--
                } else if ((start !== 0 && input[start] === ')') ||
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
    let input = processRegexEscape(exp)
    let pointer = 0
    while (pointer < input.length) {
        if (input[pointer] === '+') {
            let end = pointer - 1
            let count = 1
            let start = end
            while (count > 0) {
                start--
                if (start < 0) {
                    throw '()+匹配出现问题'
                }
                if ((start !== 0 && input[start] === '(') ||
                    (start === 0 && input[start] === '(')) {
                    count--
                } else if ((start !== 0 && input[start] === ')') ||
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

// 测试 标准C变量名 ([A-Z]|[a-z])+([A-Z]|[a-z]|[0-9])?
//let testExp = '(([A-Z]|[a-z])+)•(([A-Z]|[a-z]|[0-9])?)'
//console.log(transformZeroOrMore(transformOneOrMore(transformRangeExp(testExp))))

function insertPoint(exp){
    let input = processRegexEscape(exp)
    let start = 0
    let specialCase = ['(',')','|','*','•']
    while (start < input.length-1) {
        if(specialCase.indexOf(input[start]) === -1 
        && specialCase.indexOf(input[start+1]) === -1 && input[start+1]){
            
            let head = input.slice(0, start+1)
            let tail = input.slice(start+1)
            input = head.concat(['•'], tail)
            start += 2
            continue
        } else if (specialCase.indexOf(input[start]) === -1 
        && input[start+1] === '(' && input[start+1]){
            let head = input.slice(0, start+1)
            let tail = input.slice(start+1)
            input = head.concat(['•'], tail)
            start += 2
            continue
        } else if (input[start] === ')' 
        && specialCase.indexOf(input[start+1]) === -1 && input[start+1]){
            let head = input.slice(0, start+1)
            let tail = input.slice(start+1)
            input = head.concat(['•'], tail)
            start += 2
            continue
        } else if (input[start] === ')' 
        && input[start+1] === '(' && input[start+1]){
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

/* 处理转译字符的函数
* ascii中本身的转译字符 \t \n \b \f \v \r \\
* 读取到这些字符时应该将他们换成一个字符
* 正则表达式中比ascii多出了一些额外的关键字符 + * • ( ) [ ] - ^ ? |
* 如果输入的lex需要「匹配」这些字符（而不是使用的功能），需要加转译符号
*/
function processUnicodeEscape(exp){
    let input = exp.split('')
    let start = 0
    let escapeMap = {
        't':'\t',
        'n':'\n',
        'b':'\b',
        'f':'\f',
        'v':'\v',
        'r':'\r',
        's':' '
    }
    while(start < input.length){
        if(input[start]==='\\'){
            // 遇到 \ 时就要开始处理了
            if(escapeMap[input[start+1]]){
                // 如果存在直接的映射
                input[start] = ''
                input[start+1] = escapeMap[input[start+1]]
            } else if(input[start+1] === 'u'){
                // unicode类型字符
                let charCode = parseInt(input.slice(start+2, start+6).join(''), 16)
                input[start] = String.fromCharCode(charCode)
                for(let i=1; i < 6; i++){
                    input[start+i] = ''
                }
            }
        }
        start++
    }
    return input.join('')
}

function processRegexEscape(exp){
    let input = exp.split('')
    let start = 0
    while(start < input.length){
        if(input[start]==='\\'){
            // 遇到 \ 时就要开始处理了
            if(escapeMap[input[start+1]]){
                // 如果存在直接的映射
                input[start] = escapeMap[input[start+1]]
                let head = input.slice(0, start+1)
                let tail = input.slice(start+2)
                input = head.concat(tail)
            }
        }
        start++
    }
    return input
}

// 将所有扩展正则表达式的转义字符恢复成普通字符
function escapeEscape(exp){
    let escapeMapReverse = {
        '\\+':'+',
        '\\[':'[',
        '\\]':']',
        '\\-':'-',
        '\\^':'^',
        '\\?':'?',
        '\\.':'.'
    }
    let input = processRegexEscape(exp)
    input = input.map(c => {
        return escapeMapReverse[c] ? escapeMapReverse[c] : c
    })
    return input.join('')
}

// 将表达式规范化 - BUG
function formalize(exp){
    
    return insertPoint(
    escapeEscape(
    transformZeroOrMore(
    transformOneOrMore(
    transformRangeExpAdvanced(
    transformNegRangeExp(
    transformAllExp(
    processUnicodeEscape(exp))))))))
}

function test(exp){
    exp = processUnicodeEscape(exp)
    exp = transformAllExp(exp)
    return exp
}


module.exports = {transformOneOrMore, transformZeroOrMore, transformRangeExp, insertPoint, transformRangeExpAdvanced, transformNegRangeExp, transformAllExp, formalize, processUnicodeEscape, processRegexEscape, test}