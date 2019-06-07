const fs = require('fs')
function dfaToCpp(dfa){
    let coreOutput = dfa.stateList.map( stateName => {
        let stateCode = +stateName.slice(1)
        let head = `\tcase ${stateCode}:\n\tswitch (c) {\n`
        let body = Object.keys(dfa[stateName]).map( c => {
            cChar = JSON.stringify(c).slice(1, -1)
            if (cChar.length === 6) {
                cChar = `\\x${cChar.slice(-2)}`
            }
            if (cChar === "'"){
                cChar = "\\'"
            }
            return [
            `\t\tcase '${cChar}':`,
            `\t\t\tstate = ${dfa[stateName][c].slice(1)};`,
            `\t\t\tcp++;`,
            `\t\t\tbreak;`
            ].join('\n')
        })
        if(dfa.end[stateName]){
            body.push([
                `\t\tdefault:`,
                `\t\t\t${dfa.end[stateName][0].action}`,
                `\t\t\tprintf("\\n");`,
                `\t\t\tstate = 0;`,
                `\t\t\tbreak;`,
                `}`
                ].join('\n'))
    
            
        } else {
            body.push([
            `\t\tdefault:`,
            `\t\t\tprintf("ERROR!");`,
            `\t\t\tstate = 0;`,
            `\t\t\tthrow 2;`,
            `\t\t\tbreak;`,
            `}`
            ].join('\n'))
        }
        body.push('\nbreak;')
        body = body.join('\r\n')
        return head+body
    }) 
    
    let fullOutput = `
    #include <iostream>
    #include <string>
    #include <fstream>
    #include <streambuf>
    
    std::string inputSrc;
    
    int cp = 0;
    int state = 0;
    
    void dfa(char c);
    
    ${dfa.userDefineProgram}

    int main(int argc, const char * argv[]) {
        std::ifstream f(argv[1]);
        std::string str((std::istreambuf_iterator<char>(f)),
                        std::istreambuf_iterator<char>());
        inputSrc = str;
        while (cp < inputSrc.length()) {
            try {
                dfa(inputSrc[cp]);
            } catch(int e) {
                std::cout << "出现错误";
                break;
            }
        }
        return 0;
    }
    
    void dfa(char c){
        switch(state){
            ${coreOutput.join('\n')}
            default:
                throw 1;
                break;
        }
    }
    
    `
    
    fs.writeFileSync('lex.cpp', fullOutput)
}

module.exports = { dfaToCpp }

