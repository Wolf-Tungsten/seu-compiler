# SEU-Lex and SEU-Yacc

## SEU-Lex 操作

生成cpp

```
cd lex
node ./lex.js ./test-lex-file/lex.l
```

编译生成可执行文件

```
g++ ./lex.cpp -o seuLex
```