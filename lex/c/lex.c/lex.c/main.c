//
//  main.c
//  lex.c
//
//  Created by Wolf-Tungsten on 2019/6/8.
//  Copyright © 2019 Herald Studio. All rights reserved.
//

#include <stdio.h>

int state = 0;
int pointer = 0;

void dfa(char s){
    switch (state) {
        case 0:
            switch (s) {
                case 'a':
                    state = 1; // 下一个状态
                    pointer++;
                    break;
                    
                default:
                    // 终态动作
                    state = 0;
                    break;
            }
            break;
            
        default:
            break;
    }
}

int main(int argc, const char * argv[]) {
    // insert code here...
    const char * inputFilePath = argv[1];
    FILE *fp = fopen(inputFilePath, "r");
    
    return 0;
}
