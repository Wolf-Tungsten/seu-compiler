//
//  main.cpp
//  seuYacc
//
//  Created by Wolf-Tungsten on 2019/6/8.
//  Copyright © 2019 Herald Studio. All rights reserved.
//

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
        s = stateStack.front();
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
            if(a == "id"){
                S(5);
                return 0;
                break;
            }
            if(a == "+"){
                r(10, "E");
                std::cout << "..." << std::endl;
                return 0;
                break;
            }
            if(a == "$"){
                return 1;
            }
            return -1 
            
        default:
            return -1;
            break;
    }
}

int gotoTable(int t, std::string vn) {
    switch (t) {
        case 0:
            if(vn == "E") return 1;
            
            return -1;
            
            break;
            
        default:
            
            return -1;
            
            break;
    }
    
}


