function arrayInclude(arr, value){
    return arr.indexOf(value) !== -1
}

/* 
Yacc文件转换为文法
文法：S、Vt、Vn、P
*/
function yaccToGrammar(yaccFile){
    let grammar = {}
    grammar.start = yaccFile.defineSegment.start
    grammar.vtList = yaccFile.defineSegment.tokens
    grammar.vtList.push('$')
    grammar.vnList = ['S']
    grammar.p = {'S':[{code:'0', rightPart:[grammar.start]}]}
    let pCounter = 1 // 用于给产生式编号的计数器
    yaccFile.grammarSegment.forEach( p => {
        // 根据表达式左部找出所有的非终结符
        if(grammar.vnList.indexOf(p.leftPart) === -1){
            grammar.vnList.push(p.leftPart)
        }
        grammar.p[p.leftPart] = []
        // 遍历产生式右部找出token中不包含的终结符
        p.rightPart.forEach( k => {
            k.forEach( v => {
                if(v.startsWith('\'')){
                    let vt = v.slice(1, -1)
                    if(!arrayInclude(grammar.vtList, vt)){
                        grammar.vtList.push(vt)
                    }
                }
            })
            grammar.p[p.leftPart].push({
                rightPart:k.map( v => {
                    if(v.startsWith('\'')){
                        v = v.slice(1, -1)
                    }
                    return v
                }),
                code:'' + pCounter++
            })
        })
    })
    grammar.isVn = (v) => {
        return arrayInclude(grammar.vnList, v)
    }
    grammar.getRightPart = (code) => {
        let res
        Object.keys(grammar.p).forEach((vn) => {
            grammar.p[vn].forEach(rightPart => {
                if(rightPart.code == code){
                    res = rightPart.rightPart
                }
            })
        })
        return res
    }

    return grammar
}

// 求 first 集
function first(p, grammar){
    let head = 0
    let firstSet = {}
    if(grammar.vtList.indexOf(p[head]) !== -1){
        firstSet[p[head]] = true
    } else if (grammar.vnList.indexOf(p[head]) !== -1 ) {
        // 如果是非终结符
        // 对所有产生式求 first
        grammar.p[p[head]].forEach( vnP => {
            if(vnP.rightPart[0] !== p[head]){
                first(vnP.rightPart, grammar).forEach( vt => {
                    firstSet[vt] = true
                })
            }
        })
    } else {
        throw '查找 first 集出错'
    }
    return Object.keys(firstSet)
}

function expandDFAItem(dfaItem, grammar){
    let expandFlag = true // 通过迭代扩展
    while(expandFlag){
        expandFlag = false
        Object.keys(dfaItem.items).forEach( item => {
            let pCode = item.split('-')[0]
            let position = dfaItem.items[item].position
            let predictor = dfaItem.items[item].predictor
            let rightPart = grammar.getRightPart(pCode)
            if(grammar.isVn(rightPart[position])){
                // 点的后面是非终结符
                let newPredictor = {}
                // 先计算新的预测符
                predictor.forEach( vt => {
                    let betaAlpha = [...rightPart.slice(position+1), vt]
                    first(betaAlpha, grammar).forEach( vtt => {
                        newPredictor[vtt] = true
                    })
                })
                newPredictor = Object.keys(newPredictor).sort()

                grammar.p[rightPart[position]].forEach( p => {
                    // 遍历该非终结符为左部的所有的产生式
                    let name = `${p.code}-0`
                    if(dfaItem.items[name]){
                        // 如果已经包含该产生式，检查是否需要扩展预测符
                        if(newPredictor.join('|') !== dfaItem.items[name].predictor.join('|')){
                            // 新的预测符和旧的不相等，判断是否属于包含关系
                            newPredictor.forEach( vt => {
                                if(dfaItem.items[name].predictor.indexOf(vt) === -1){
                                    dfaItem.items[name].predictor.push(vt)
                                    expandFlag = true // 有新的预测符加入
                                }
                            })
                            if(expandFlag){
                                dfaItem.items[name].predictor = dfaItem.items[name].predictor.sort() // 排好顺序
                            }
                        } 
                    } else {
                        dfaItem.items[name] = {
                            predictor:newPredictor,
                            position:0,
                            rightPart:p.rightPart
                        }
                        expandFlag = true
                    }
                })

            }
        })
    }
    // 对 dfaItem 计算签名，用于后续判断是否出现重复状态
    let signature = Object.keys(dfaItem.items).map( name => {
        return `${name}-${dfaItem.items[name].predictor.join('|')}`
    })
    signature = signature.sort().join('•')
    dfaItem.signature = signature
    return dfaItem
}

// 计算所有出边
function getOutEdge(dfaItem){
    let outEdge = {}
    Object.keys(dfaItem.items).forEach( i => {
        if(dfaItem.items[i].position < dfaItem.items[i].rightPart.length){
            outEdge[dfaItem.items[i].rightPart[dfaItem.items[i].position]] = true
        }
    })
    return Object.keys(outEdge)
}

// 给定项目和出边计算扩展项目
function nextStep(dfaItem, edge){
    let newDfaItem = { items:{} }
    Object.keys(dfaItem.items).forEach( i => {
        let pCode = i.split('-')[0]
        if(dfaItem.items[i].rightPart[dfaItem.items[i].position] === edge){
            newDfaItem.items[`${pCode}-${dfaItem.items[i].position + 1}`] = {
                position:dfaItem.items[i].position + 1,
                predictor:dfaItem.items[i].predictor,
                rightPart:dfaItem.items[i].rightPart
            }
        }
    })
    return newDfaItem
}

function generateLR1DFA(I0, grammar){
    let lr1Dfa = {
        items:{}
    } // lr1Dfa
    let lr1DfaSignatureSet = {} // 用于去重的签名hash
    let dfaItemQueue = [] // 等待计算队列
    let nameCounter = 1 // 命名计数器 I0、I1 ...
    I0 = expandDFAItem(I0, grammar)
    dfaItemQueue.push(I0)
    lr1DfaSignatureSet[I0.signature] = 'I0'
    while(dfaItemQueue.length > 0){
        let currentItem = dfaItemQueue.shift()
        currentItem.edge = {}
        let outEdges = getOutEdge(currentItem)
        outEdges.forEach(edge => {
            let nextItem = nextStep(currentItem, edge)
            nextItem = expandDFAItem(nextItem, grammar)
            if(!lr1DfaSignatureSet[nextItem.signature]){
                nextItem.name = `I${nameCounter++}`
                lr1DfaSignatureSet[nextItem.signature] = nextItem.name
                dfaItemQueue.push(nextItem)
                currentItem.edge[edge] = nextItem.name
            } else {
                // 查找签名对应的项目
                currentItem.edge[edge] = lr1DfaSignatureSet[nextItem.signature]
            }
        })
        lr1Dfa.items[currentItem.name] = currentItem
    }
    return lr1Dfa
}

module.exports = { yaccToGrammar, expandDFAItem, first, generateLR1DFA }


