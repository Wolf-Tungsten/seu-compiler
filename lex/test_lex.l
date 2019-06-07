%{
#include <stdio.h>


void comment();
%}

D			[0-9]
L			[a-zA-Z_]
H			[a-fA-F0-9]
E			((E|e)(\+|\-)?{D}+)
P           ((P|p)(\+|\-)?{D}+)
FS			(f|F|l|L)
IS          ((u|U)|(u|U)?(l|L|ll|LL)|(l|L|ll|LL)(u|U))

%%

(L)?"(((\\.)|[^\\"\n])*)"	{ 
	 printf("STRING_LITERAL"); 
	}
    
%%

void comment(){
	char c,prev=0;
	while(++yy_cp!=0)
	{
		c=*yy_cp;
		if(c=='/'&&prev=='*')
			return;
		prev=c;
	}
	printf("ERROR: unterminated comment!");
}
