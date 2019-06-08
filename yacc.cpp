#include <iostream>
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
    

    int actionTable(int s, std::string a) {
        switch (s) {
            
            case 0:
                
                if ( a == "(" ) {
                    S(4);
                    return 0;
                }
                

                if ( a == "NUMBER" ) {
                    S(5);
                    return 0;
                }
                
                return -1;
        

            case 1:
                
                if ( a == "+" ) {
                    S(6);
                    return 0;
                }
                

                if ( a == "$" ) {
                    return 1;
                }
                
                return -1;
        

            case 2:
                
                if ( a == "*" ) {
                    S(7);
                    return 0;
                }
                

                if ( a == "$" ) {
                    r(1, "E");
                    std::cout << "归约：" << "E => " << "T" << std::endl;
                    return 0;
                }
                

                if ( a == "+" ) {
                    r(1, "E");
                    std::cout << "归约：" << "E => " << "T" << std::endl;
                    return 0;
                }
                

                if ( a == ")" ) {
                    r(1, "E");
                    std::cout << "归约：" << "E => " << "T" << std::endl;
                    return 0;
                }
                
                return -1;
        

            case 3:
                
                if ( a == "$" ) {
                    r(1, "T");
                    std::cout << "归约：" << "T => " << "F" << std::endl;
                    return 0;
                }
                

                if ( a == "*" ) {
                    r(1, "T");
                    std::cout << "归约：" << "T => " << "F" << std::endl;
                    return 0;
                }
                

                if ( a == "+" ) {
                    r(1, "T");
                    std::cout << "归约：" << "T => " << "F" << std::endl;
                    return 0;
                }
                

                if ( a == ")" ) {
                    r(1, "T");
                    std::cout << "归约：" << "T => " << "F" << std::endl;
                    return 0;
                }
                
                return -1;
        

            case 4:
                
                if ( a == "(" ) {
                    S(4);
                    return 0;
                }
                

                if ( a == "NUMBER" ) {
                    S(5);
                    return 0;
                }
                
                return -1;
        

            case 5:
                
                if ( a == "$" ) {
                    r(1, "F");
                    std::cout << "归约：" << "F => " << "NUMBER" << std::endl;
                    return 0;
                }
                

                if ( a == "*" ) {
                    r(1, "F");
                    std::cout << "归约：" << "F => " << "NUMBER" << std::endl;
                    return 0;
                }
                

                if ( a == "+" ) {
                    r(1, "F");
                    std::cout << "归约：" << "F => " << "NUMBER" << std::endl;
                    return 0;
                }
                

                if ( a == ")" ) {
                    r(1, "F");
                    std::cout << "归约：" << "F => " << "NUMBER" << std::endl;
                    return 0;
                }
                
                return -1;
        

            case 6:
                
                if ( a == "(" ) {
                    S(4);
                    return 0;
                }
                

                if ( a == "NUMBER" ) {
                    S(5);
                    return 0;
                }
                
                return -1;
        

            case 7:
                
                if ( a == "(" ) {
                    S(4);
                    return 0;
                }
                

                if ( a == "NUMBER" ) {
                    S(5);
                    return 0;
                }
                
                return -1;
        

            case 8:
                
                if ( a == ")" ) {
                    S(11);
                    return 0;
                }
                

                if ( a == "+" ) {
                    S(6);
                    return 0;
                }
                
                return -1;
        

            case 9:
                
                if ( a == "*" ) {
                    S(7);
                    return 0;
                }
                

                if ( a == "$" ) {
                    r(3, "E");
                    std::cout << "归约：" << "E => " << "E + T" << std::endl;
                    return 0;
                }
                

                if ( a == "+" ) {
                    r(3, "E");
                    std::cout << "归约：" << "E => " << "E + T" << std::endl;
                    return 0;
                }
                

                if ( a == ")" ) {
                    r(3, "E");
                    std::cout << "归约：" << "E => " << "E + T" << std::endl;
                    return 0;
                }
                
                return -1;
        

            case 10:
                
                if ( a == "$" ) {
                    r(3, "T");
                    std::cout << "归约：" << "T => " << "T * F" << std::endl;
                    return 0;
                }
                

                if ( a == "*" ) {
                    r(3, "T");
                    std::cout << "归约：" << "T => " << "T * F" << std::endl;
                    return 0;
                }
                

                if ( a == "+" ) {
                    r(3, "T");
                    std::cout << "归约：" << "T => " << "T * F" << std::endl;
                    return 0;
                }
                

                if ( a == ")" ) {
                    r(3, "T");
                    std::cout << "归约：" << "T => " << "T * F" << std::endl;
                    return 0;
                }
                
                return -1;
        

            case 11:
                
                if ( a == "$" ) {
                    r(3, "F");
                    std::cout << "归约：" << "F => " << "( E )" << std::endl;
                    return 0;
                }
                

                if ( a == "*" ) {
                    r(3, "F");
                    std::cout << "归约：" << "F => " << "( E )" << std::endl;
                    return 0;
                }
                

                if ( a == "+" ) {
                    r(3, "F");
                    std::cout << "归约：" << "F => " << "( E )" << std::endl;
                    return 0;
                }
                

                if ( a == ")" ) {
                    r(3, "F");
                    std::cout << "归约：" << "F => " << "( E )" << std::endl;
                    return 0;
                }
                
                return -1;
        
            default:
                return -1;
        }
    }
    

    int gotoTable(int t, std::string vn) {
        switch (t) {
            case 0:
                
            if (vn == "E") return 1;
            

            if (vn == "T") return 2;
            

            if (vn == "F") return 3;
            
                return -1;
            
case 1:
                
                return -1;
            
case 2:
                
                return -1;
            
case 3:
                
                return -1;
            
case 4:
                
            if (vn == "E") return 8;
            

            if (vn == "T") return 2;
            

            if (vn == "F") return 3;
            
                return -1;
            
case 5:
                
                return -1;
            
case 6:
                
            if (vn == "T") return 9;
            

            if (vn == "F") return 3;
            
                return -1;
            
case 7:
                
            if (vn == "F") return 10;
            
                return -1;
            
case 8:
                
                return -1;
            
case 9:
                
                return -1;
            
case 10:
                
                return -1;
            
case 11:
                
                return -1;
            
            default:
                return -1;
        }
    }
    