// 加载读取 .y 文件

function loadYaccFile(fileContent){
    let yaccSegements = fileContent.split(/\r\n%%\r\n/)
    return {
        defineSegment : parseDefineSegment(yaccSegements[0]),
        grammarSegment : parseGrammarSegment(yaccSegements[1]),
        programSegment : yaccSegements[2]
    }
}

function parseDefineSegment(defineSegment){
    defineSegment = defineSegment.split(/(\r\n)+/).filter(l => l.startsWith('%token') || l.startsWith('%start'))
    let tokens = []
    let start = ''
    defineSegment.forEach(l => {
        if(l.startsWith('%token')){
            l = l.split(' ').slice(1)
            tokens = tokens.concat(l)
        } else if(l.startsWith('%start')) {
            start = l.split(' ')[1].trim()
        }
        
    })
    console.log(tokens.length)
    return { tokens, start }
}

function parseGrammarSegment(grammarSegment){
    grammarSegment = grammarSegment.split(';\r\n')
    grammarSegment = grammarSegment.map(l => l.trim()).filter(l => l.length > 0)
    grammarSegment = grammarSegment.map( g => {
        g = g.split(':')
        let leftPart = g[0].trim()
        let rightPart = g[1].trim()
        rightPart = rightPart.split('|').map(exp => exp.trim().split(' '))
        return {leftPart, rightPart}
    })
    return grammarSegment
}

module.exports = { loadYaccFile }