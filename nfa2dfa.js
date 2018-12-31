const {postfix, thompson} = require('./thompson')

function mergeName(stateList){
    return (stateList.sort((a,b)=>{
        a = parseInt(a.slice(1))
        b = parseInt(b.slice(1))
        return a-b
    })).join('')
}

// 搜索eplison闭包
function searchClosure(nfa, startStates){
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
            nextStep = nextStep.concat(nfa[k]['@'])
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
    return closureList
}

// NFA的确定化
function nfa2dfa(nfa){
    // merge 表 - 存储合并状态的对应关系，例如S1S2 -> I1
    let merge = {}
    let stateNo = 0 // 合并后状态的标号
    // 构造初始状态
}

let nfa = thompson(postfix('a•b'), 0, 'test')
console.log(nfa)
console.log(searchClosure(nfa, [nfa.start, 'S1']))