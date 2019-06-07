const {postfix, thompson} = require('./thompson')

function mergeName(stateList){
    return (stateList.sort((a,b)=>{
        a = parseInt(a.slice(1))
        b = parseInt(b.slice(1))
        return a-b
    })).join('')
}

// 搜索eplison闭包
let closureCache = {}
function searchClosure(nfa, startStates){
    let cacheName = mergeName(startStates)
    if(closureCache[cacheName]){
        return closureCache[cacheName]
    }
    let closure = {}
    startStates.forEach(k=>{
        closure[k] = true
    })
    let startLength = Object.keys(closure).length
    while(true){
        // 迭代法
        let currentKeys = Object.keys(closure)
        let nextStep = []
        currentKeys.forEach(k=>{
            nextStep = nextStep.concat(nfa[k]['ø'])
        })
        nextStep.forEach(k=>{
            closure[k] = true
        })
        let endLength = Object.keys(closure).length
        if(startLength === endLength){
            // 没有扩展出新的状态，迭代终止
            break
        }
        startLength = endLength
    }
    let closureList = Object.keys(closure)
    closureList = closureList.sort((a,b)=>{
        a = parseInt(a.slice(1))
        b = parseInt(b.slice(1))
        return a-b
    })
    closureCache[cacheName] = closureList
    return closureList
}

// NFA的确定化
function nfa2dfa(nfa){
    let dfa = {}
    // merge 表 - 存储合并状态的对应关系，例如S1S2 -> I1
    let merge = {}
    let stateNo = 0 // 合并后状态的标号
    // 构造初始状态
    let startState = searchClosure(nfa, [nfa.start])
    startState = {
        stateList: startState,
        mergeName: `I${stateNo++}`
    }
    merge[startState.stateList.join('')] = startState
    // 初始化dfa
    dfa.start = 'I0'
    dfa.end = []
    dfa.stateList = ['I0']
    // 迭代法扩展状态
    let hasNextStep = true
    while(hasNextStep){
        hasNextStep = false
        dfa.stateList.forEach( state => {
            if(!dfa[state]){
                // 如果没有, 构造当前状态的下一步
                dfa[state] = {}
                // 查找当前状态包含的状态
                let stateList
                Object.keys(merge).forEach(k => {
                    if(merge[k].mergeName === state){
                        stateList = merge[k].stateList
                    }
                })
                
                // 遍历字母表，构造epsilon闭包
                nfa.alphabet.forEach(letter => {
                    let extendState = {}
                    stateList.forEach(nfaState => {
                        //extendState[nfaState] = true
                        if(nfa[nfaState][letter]){
                            // 包含当前字符的下一跳
                            // Object.keys(nfa[nfaState][letter]).forEach( nextNfaState => {
                            //     if(nextNfaState!=='ø'){
                            //         extendState[nextNfaState] = true
                            //     }
                            // })
                            extendState[nfa[nfaState][letter]] = true
                        }
                    })
                    extendState = Object.keys(extendState)
                    extendState = searchClosure(nfa, extendState)
                    // 执行到此处，已经构造出当前状态的下一个状态
                    let stateNameString = mergeName(extendState)
                    if(stateNameString && !merge[stateNameString]){
                        // 发现了一个新的状态
                        hasNextStep = true
                        let newStateName = `I${stateNo++}`
                        if(letter.length === 2){
                            letter = letter[1]
                        }
                        dfa[state][letter] = newStateName
                        dfa.stateList.push(newStateName)
                        merge[stateNameString] = {
                            mergeName: newStateName,
                            stateList: extendState
                        }
                    } else if(stateNameString && merge[stateNameString]){
                        dfa[state][letter] = merge[stateNameString].mergeName
                    }
                })
            }
        })
    }
    // 重新确定终态
    dfa.end={}
    nfa.end.forEach(nfaEndState => {
        Object.keys(nfaEndState).forEach(nfaState => {
            Object.keys(merge).forEach(k => {
                if(merge[k].stateList.indexOf(nfaState) !== -1){
                    let dfaState = merge[k].mergeName
                    if(!dfa.end[dfaState]){
                        dfa.end[dfaState] = [nfaEndState[nfaState]]
                    } else {
                        dfa.end[dfaState].push(nfaEndState[nfaState])
                    }
                }
            })
        })
    })
    
    return(dfa)
}

module.exports = {nfa2dfa}

// console.log(postfix('(a*)•(b|c)'))
// let nfa = thompson(postfix('(a*)•(b|c)•a'), 0, 'test') 
// console.log(nfa2dfa(nfa))