const fs = require('fs')

function parsingTableToCpp(parsingTable, grammar){
    let head = `#include <iostream>
    #include <fstream>
    #include <vector>
    #include <string>
    
    std::vector<std::string> inputBuf;
    std::vector<int> stateStack;
    std::vector<std::string> symbolStack;
    int reader = 0;
    
    std::string a;
    int s;
    
    void lrParsing();
    
    int actionTable(int s, std::string a);
    int gotoTable(int t, std::string vn);
    
    int main(int argc, const char * argv[]) {
        std::ifstream f(argv[1]);
        std::string s;
        while(getline(f, s)){
            inputBuf.push_back(s);
        }
        inputBuf.push_back("$");
        stateStack.push_back(0);
        lrParsing();
        return 0;
    }
    
    void lrParsing() {
        a = inputBuf[0];
        while(1){
            s = stateStack.back();
            switch (actionTable(s, a)) {
                case 1:
                    std::cout<<"success!"<<std::endl;
                    return;
                case -1:
                    std::cout<<"error!"<<std::endl;
                    return;
                default:
                    break;
            }
        }
    }
    
    void S(int state){
        stateStack.push_back(state);
        symbolStack.push_back(inputBuf[reader]);
        a = inputBuf[++reader];
    }
    
    void r(int length, std::string vn){
        for(int i = 0; i < length; i++){
            stateStack.pop_back();
            symbolStack.pop_back();
        }
        int t = stateStack.back();
        stateStack.push_back(gotoTable(t, vn));
        symbolStack.push_back(vn);
    }
    `


    let actionTableItem = []
    let gotoTableItem = []

    Object.keys(parsingTable).forEach( state => {
        let actionTable = parsingTable[state].action
        let actions = []
        Object.keys(actionTable).forEach( vt => {
            let job = actionTable[vt]
            if(job[0] === 'S'){
                actions.push(`
                if ( a == "${vt}" ) {
                    S(${job.slice(1)});
                    return 0;
                }
                `)
            } else if (job === 'r0') {
                actions.push(`
                if ( a == "${vt}" ) {
                    return 1;
                }
                `)
            } else if (job[0] === 'r') {
                let code = job.slice(1)
                let rightPart = grammar.getRightPart(code)
                let leftPart = grammar.getLeftPart(code)
                actions.push(`
                if ( a == "${vt}" ) {
                    r(${rightPart.length}, "${leftPart}");
                    std::cout << "归约：" << "${leftPart} => " << "${rightPart.join(' ')}" << std::endl;
                    return 0;
                }
                `)
            }
        })
        actionTableItem.push(`
            case ${state}:
                ${actions.join('\n')}
                return -1;
        `)
        // goto部分转换
        let gotoTable = parsingTable[state].goto
        let gotos = []
        Object.keys(gotoTable).forEach( vn => {
            gotos.push(`
            if (vn == "${vn}") return ${gotoTable[vn]};
            `)
        })
        gotoTableItem.push(
            `case ${state}:
                ${gotos.join('\n')}
                return -1;
            `
        )
    })

    let actionTableOutput =  `
    int actionTable(int s, std::string a) {
        switch (s) {
            ${actionTableItem.join('\n')}
            default:
                return -1;
        }
    }
    `
    
    let gotoTableOutput = `
    int gotoTable(int t, std::string vn) {
        switch (t) {
            ${gotoTableItem.join('\n')}
            default:
                return -1;
        }
    }
    `

    fs.writeFileSync('yacc.cpp', `${head}\n${actionTableOutput}\n${gotoTableOutput}`)
    
}

module.exports = {parsingTableToCpp}