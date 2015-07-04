"use strict";

function parserTests_test()
{
    //aceEditor.setValue("");
    //tokenEditor.setValue("");
    codeEditor.setValue("");
    codeEditor.focus();
    
    parserTests_simpleassignment();


}

function parserTests_simpleassignment() {
    codeEditor.insert("//simple assign");
    codeEditor.insert("\n");
    codeEditor.insert("int main()");
    codeEditor.insert("\n");
    codeEditor.insert("{");
    codeEditor.insert("\n");
    codeEditor.insert("int x = 44 + 2;");
    codeEditor.insert("\n");
    codeEditor.insert("int y = 44 / 2;");
    codeEditor.insert("\n");
    codeEditor.insert("int z = 44 - 2;");
    codeEditor.insert("\n");
    codeEditor.insert("x = 44 * 2;");
    codeEditor.insert("\n");
    codeEditor.insert("y = 44 % 3;");
    codeEditor.insert("\n");
    codeEditor.insert("return 0;");
    codeEditor.insert("\n");
    codeEditor.insert("}");
}
function parserTests_portassign() {
    codeEditor.insert("//portassign");
    codeEditor.insert("\n");
    codeEditor.insert("PORTB = 0x2F;");
    codeEditor.insert("\n");
}
function parserTests_simplesums() {
    codeEditor.insert("//simple sum");
    codeEditor.insert("\n");
    codeEditor.insert("5 + 4");
    codeEditor.insert("\n");
}
function parserTests_Strings_numeric()
{
    codeEditor.insert("//simple numerics test 0x6 0b11 -345");
    codeEditor.insert("\n");
    codeEditor.insert("somechars ('r') (\"word\")");
    codeEditor.insert("\n");
    codeEditor.insert("19e45 + -65e05 / 45e2");
    codeEditor.insert("\n");
    codeEditor.insert("0x55 - 0b10101010 ");
    codeEditor.insert("\n");
    codeEditor.insert("1.5 + -6.5");
    codeEditor.insert("\n");
    codeEditor.insert("32%6");
    codeEditor.insert("\n");
    codeEditor.insert("\n");
    codeEditor.insert("\n");
    codeEditor.insert("\n");
    codeEditor.insert("test0x6 test0b11test -345test");
    codeEditor.insert("\n");
}
