"use strict";

Range = ace.require("ace/range").Range;
var parserstate = PARSERSTATE.STOP;
var debug = false;
var code;
var input;
var output;
var result;
var linemarker;
var variables;
var config = {
    stdio: {
        write: function (s) {
            outputtxt.value += s;
        }
    },
    debug: debug
}
var mydebugger;


// BUTTON COMMANDS
function start()
{
    //Memory_Clear();
    myMicrocontroller.Registers.clear();
}

function Step()
{
    //code = fixCode();
    //alert(browser)

    if (parserstate === PARSERSTATE.STOP) {
        try {
            parserstate = PARSERSTATE.STEP;           
            myMicrocontroller.Registers.clear();//set all registers to 0 
            updateRegistersDisplay();
            myMicrocontroller.Memory.clear(); //remove all 
            updateMemoryDisplay();
            //read any high inputs
            config.debug = true;
            outputtxt.value = "";
            var regsnbits = myMicrocontroller.getRegisterDecls() + myMicrocontroller.bitNamesDecl;
            code = fixCode() + regsnbits;
            input = document.getElementById("inputtxt").value;
            
            if (browser.indexOf("IE") >= 0 ) { //other older browswers need testing too ??
                alert("you need to use a modern desktop version of Firefox or Chrome");
                return;
            }           

            mydebugger = JSCPP.run(code, input, config);

            //mydebugger.WriteRegister("PINB", 23); example of how to write a register

            //console.log(mydebugger.src);
        } catch (e) {
            resulttxt.value = e;
            resulttxt.value = mydebugger.stop();
            parserstate = PARSERSTATE.STOP
            return;
        }
    }
    if (parserstate === PARSERSTATE.STEP) {
        try {
            var done;
            done = mydebugger.next();
            showVariables();
            myMicrocontroller.Memory.update(mydebugger.Variables());
            myMicrocontroller.Registers.updateRegisterValues(mydebugger.Registers());
            updateRegistersDisplay();
            updateMemoryDisplay();
            updateLineHighlight();
            if (!done) {
                resulttxt.value = mydebugger.nextLine();
            } else {
                parserstate = PARSERSTATE.STOP
                resulttxt.value = 'finished';
            }
        } catch (e) {
            resulttxt.value = e;
        }
    }
}
function Run()
{
}
function Stop()
{
    parserstate = PARSERSTATE.STOP;
    if (linemarker !== undefined)
        codeEditor.getSession().removeMarker(linemarker)
    debug = null;
}
function fixCode()
{
    var arr = [];
    for (var i = 0; i < codeEditor.session.getLength(); i++) {
        arr[i] = codeEditor.session.getLine(i);
        if (arr[i].trim()==="")
            arr[i] = "#include<iostream>"
        if (arr[i].trim().indexOf("//")===0)
            arr[i] = "#include<iostream>"
        if (arr[i].indexOf("/*") > -1) { //begin a long comment
            while (arr[i].indexOf("*/") === -1) {                                           
                arr[i] = "#include<iostream>"
                i++;
                arr[i] = codeEditor.session.getLine(i);
            }
            arr[i] = "#include<iostream>"
        }
    }
    return arr.join(['\n'])
}
function updateLineHighlight() {
    var s, r;
    s = mydebugger.nextNode();
    if (linemarker !== undefined)
        codeEditor.getSession().removeMarker(linemarker)
    r = new Range(s.sLine -1, s.sColumn - 1, s.sLine-1, s.eColumn - 1); //remove effect of dummy function at beginning
    linemarker = codeEditor.getSession().addMarker(r, 'debug-highlight', 'token');
}
function showVariables() {
    //intially just show in textarea
    variablestxt.value = ""
    variables = mydebugger.Variables();
    for (var i = 0; i < variables.length; i++) {
        variablestxt.value += variables[i].scopelevel + " "
        variablestxt.value += variables[i].scopename + " "
        variablestxt.value += variables[i].gentype + " " //primitive or pointer
        variablestxt.value += variables[i].name + " "
        variablestxt.value += variables[i].type + " "
        variablestxt.value += variables[i].value
        variablestxt.value += '\n'
    }
}


var browser = (function () {
    var ua = navigator.userAgent, tem,
    M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
    if (/trident/i.test(M[1])) {
        tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
        return 'IE' + (tem[1] || '');
    }
    if (M[1] === 'Chrome') {
        tem = ua.match(/\b(OPR|Edge)\/(\d+)/);
        if (tem != null) return tem.slice(1).join(' ').replace('OPR', 'Opera');
    }
    M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
    if ((tem = ua.match(/version\/(\d+)/i)) != null) M.splice(1, 1, tem[1]);
    return M.join(' ');
})();

