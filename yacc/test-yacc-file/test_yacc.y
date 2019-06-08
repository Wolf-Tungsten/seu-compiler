%token NUMBER

%start E

%%
	
E
	: E '+' T
	| T
	;
	
T
	: T '*' F
	| F
	;
	
F
	: '(' E ')'
	| NUMBER
	;

%%
#include <stdio.h>

void yyerror()
{
}