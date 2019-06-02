
const keychar = ['(',')','+','|','[',']','?','*','.']
function escapeQuotation(regex){
    let input = regex.split('')
    let start = 0
    while(start < input.length){
        let end = start + 1
        if(input[start] === '"' && input[start-1] !== '\\'){
            while(end < input.length && !(input[end] === '"' && input[end-1] !== '\\')){
                end++
            }
            let head = input.slice(0, start)
            let tail = input.slice(end + 1)
            for(let i = start; i < end; i++){
                if(keychar.indexOf(input[i]) !== -1){
                    input[i]=`\\${input[i]}`
                }
            }
            input = head.concat('(', input.slice(start+1, end), ')', tail)
            start = end
        } else {
            start = end
        }
    }
    return input.join('')
}

function replacePredefinedElements(regex, predefinedMap){
    let replaced = regex
    let flag = true
    while(flag){
        flag = false
        Object.keys(predefinedMap).forEach(k => {
            if(replaced.indexOf(`{${k}}`) !== -1){
                flag = true
            }
            replaced = replaced.replace(`{${k}}`, predefinedMap[k])
        })
    }
    return replaced
}

module.exports = { replacePredefinedElements, escapeQuotation }