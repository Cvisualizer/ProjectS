CC = gcc
OBJFILES = lex.yy.o y.tab.o VSM.o SymTable.o NameTable.o MainFunc.o

Compiler : ${OBJFILES}
	${CC} ${OBJFILES} -ly -ll -o Compiler

MainFunc.o : MainFunc.c VSM.h SymTable.h

SymTable.o : SymTable.c SymTable.h

NameTable.o : NameTable.c 

VSM.o : VSM.c VSM.h SymTable.h

lex.yy.o : lex.yy.c y.tab.h VSM.h SymTable.h 

lex.yy.c : FuncL.l
	flex -l FuncL.l

y.tab.o : y.tab.c VSM.h 

y.tab.c y.tab.h : FuncL.y
	bison -dv -y FuncL.y
