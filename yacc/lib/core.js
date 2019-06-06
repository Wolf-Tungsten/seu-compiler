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
    return dfaItem
}

module.exports = { yaccToGrammar, expandDFAItem, first }


