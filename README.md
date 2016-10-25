# S
Project "S" is a project related to software visualization for ORF.
Please clone this project and execute make command.
As a result, you could get our compiler (with some errors).
You can ignore these errors and execute our compiler.

# How to use
> make  
> ./Compiler tests/test1.c  
> ./Compiler tests/test1.c > first.json  
> python jsonParse.py  

# Reference
  「コンパイラ構成法」原田賢一

#サーバー設営
NodeServerに移動し、
node exec.js
と入力して実行する

#ツールの使い方
visualizer/index.htmlを開く
テキストエリアにC言語のプログラムを入力し、「Play」ボタンを押して実行する
解析可能な言語は独自仕様であるため、tests以下のソースコードを用いるとよい

