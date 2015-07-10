﻿"use strict";

var Controller;
Controller = function () {
    this.PARSERSTATE = {
        START: "START",
        RUN: "RUN",
        RUNNING: "RUNNING",
        PAUSE: "PAUSE",
        STEP: "STEP",
        STOP: "STOP",
        ERROR: "ERROR"
    }
    Range = ace.require("ace/range").Range;
    this.parserstate = this.PARSERSTATE.STOP;
    this.debug = false;
    this.code;
    this.input=""
    this.linemarker;
    this.variables;
    this.config = {
        stdio: {
            write: function (s) {
                View.Message(s)
            }
        },
        debug: this.debug
    }
    this.mydebugger;
    this.runid;
    this.rundelay = 500;
}
// BUTTON COMMANDS
Controller.prototype.B = function () {
    mf.updateOutput("PORTB", 5, 1);
}
Controller.prototype.C = function () {
    mf.updateOutput("PORTB", 5, 0);
}

Controller.prototype.Start = function(startokstate)
{
    try {
        myMicrocontroller.Registers.clear();//set all registers to 0 
        updateRegistersDisplay();
        myMicrocontroller.Memory.clear(); //remove all 
        updateMemoryDisplay();
        //read any high inputs
        this.config.debug = true;
        View.Message("");
        var regsnbits = myMicrocontroller.getRegisterDecls() + myMicrocontroller.bitNamesDecl;
        this.code = this.fixCode()
        //this.code = this.replaceMacros()
        this.code = this.code + regsnbits;
        //this.input = document.getElementById("inputtxt").value;
        if (browser.indexOf("IE") >= 0) { //other older browswers need testing too ??
            View.Message("you need to use a modern desktop version of Firefox or Chrome")
            //alert("you need to use a modern desktop version of Firefox or Chrome");
            this.parserstate = this.PARSERSTATE.STOP
            return;
        }
        this.mydebugger = JSCPP.run(this.code, this.input, this.config);
        //console.log(mydebugger.src);
    } catch (e) {
        View.Message(e.message);
        if (this.mydebugger !== undefined)
            View.Message(this.mydebugger.stop());
        this.parserstate = this.PARSERSTATE.STOP
        return;
    }
    View.Message("start");
    this.parserstate = startokstate;
}

Controller.prototype.Step = function ()
{
    if (this.parserstate === this.PARSERSTATE.STOP) {
        this.Start(this.PARSERSTATE.STEP)
    }
    if (this.parserstate === this.PARSERSTATE.STEP) {
        try {
            var done;
            done = this.mydebugger.next();
            myMicrocontroller.updateMemory(this.mydebugger.Variables());
            updateMemoryDisplay();
            //registers and diagram
            myMicrocontroller.Registers.updateRegisters(this.mydebugger.Registers());
            updateRegistersDisplay();
            this.updateLineHighlight();
            if (!done) {
                View.Message( this.mydebugger.nextLine());
            } else {
                parserstate = this.PARSERSTATE.STOP
                View.Message('finished'); 
            }
        } catch (e) {
            View.Message(e.message);
            parserstate = this.PARSERSTATE.STOP
        }
    }
}
Controller.prototype.Run = function ()
{
    if (this.parserstate === this.PARSERSTATE.STOP) {
        this.Start(this.PARSERSTATE.RUN)
    }
    if (this.parserstate === this.PARSERSTATE.RUNNING) {
        return;
    }

    if (this.parserstate === this.PARSERSTATE.RUN) {
        this.parserstate = this.PARSERSTATE.RUNNING
        self = this;
        this.runid = setInterval(function () {
            try {
                var done;
                done = self.mydebugger.next();
                myMicrocontroller.updateMemory(self.mydebugger.Variables());
                updateMemoryDisplay();
                //registers and diagram
                myMicrocontroller.Registers.updateRegisters(self.mydebugger.Registers());
                updateRegistersDisplay();
                self.updateLineHighlight();
                if (!done) {
                    //View.Message(self.mydebugger.nextLine());
                    self.mydebugger.nextLine();
                } else {//done
                    parserstate = self.PARSERSTATE.STOP
                    View.Message('finished');
                    clearInterval(self.runid)
                    return;
                }
            } catch (e) {
                View.Message(e.message);
                parserstate = self.PARSERSTATE.STOP
                clearInterval(self.runid);
                return;
            }
        }, View.getRunDelay());
    }
}
Controller.prototype.Stop = function (){
    if (this.parserstate !== this.PARSERSTATE.STOP)
        View.Message("stop"); //only show if not stopped
    this.parserstate = this.PARSERSTATE.STOP;
    if (this.linemarker !== undefined)
        codeEditor.getSession().removeMarker(this.linemarker)
    this.debug = null;
    clearInterval(this.runid);
}
Controller.prototype.fixCode = function (){
    var arr = [];
    for (var i = 0; i < codeEditor.session.getLength(); i++) {
        arr[i] = codeEditor.session.getLine(i);
        if (arr[i].trim().indexOf("#define") > -1) {
            //run thru code and replace macro name with actual
            var loc = arr[i].indexOf("#define")
            var len = arr[i].length;
            var str = arr[i].substring(loc+7, len-loc).trim();
            var start = str.indexOf("#define");
            var str = this.removeComment(str);
            loc = str.indexOf(" ");
            len = str.length;
            this.replaceMacro(str.substring(0,loc),str.substring(loc+1,len),i)
            arr[i] = "#include<iostream>"
        }
        if (arr[i].trim() === "")
            arr[i] = "#include<iostream>"
        if (arr[i].trim().indexOf("//")===0)
            arr[i] = "#include<iostream>"
        if (arr[i].indexOf("/*") > -1) { //replace a long comment
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

Controller.prototype.replaceMacro = function (a, b, row) { 
    //replace a with b, starting at row, 
    //works well -added comments to end of line
    //need to fix macros inside statement so that no ; is added
    var session = codeEditor.session;
    codeEditor.$search.setOptions({
        needle: a,
        caseSensitive: true,
        range: new Range(row + 1, 0, session.getLength(), 0),//only from line after macro 
        wholeWord: true,  //dont like having to make this false, as it may cause errors so no () in macros
        regExp: false
    });
    var ranges = codeEditor.$search.findAll(session)  //codeEditor.session same as codeEditor.getSession())
    codeEditor.replaceAll(b);
    //add macro as comment at end of line
    for (var i = 0; i < ranges.length; i++) {
        var comm = session.getLine(ranges[i].start.row).indexOf("//");
        var pos = { row: ranges[i].start.row, column: 0 }
        if (comm > -1) { //comment exists
            pos.column = comm + 2;
            session.insert(pos, "--" + a + " ")
        }
        else {
            pos.column = session.getLine(ranges[i].start.row).length;
            session.insert(pos, "// " + a)
        }
    }
}
Controller.prototype.removeComment = function (str) {
    //removes either type of comment -assumes block /*  */ type comment is on one line -probably shouldn't!
    var len = str.length;
    var comm = str.indexOf("//");
    if (comm > -1)
        return str.substring(0, comm);
    comm = str.indexOf("*/");
    if (comm > -1)
        return str.substring(0, comm);
    return str;
}

Controller.prototype.updateLineHighlight = function () {
    var s, r;
    s = this.mydebugger.nextNode();
    if (this.linemarker !== undefined)
        codeEditor.getSession().removeMarker(this.linemarker)
    r = new Range(s.sLine -1, s.sColumn - 1, s.sLine-1, s.eColumn - 1); //remove effect of dummy function at beginning
    this.linemarker = codeEditor.getSession().addMarker(r, 'debug-highlight', 'token');
}
Controller.prototype.showVariables = function () {
    //intially just show in textarea
    variablestxt.value = ""
    this.variables = this.mydebugger.Variables();
    for (var i = 0; i < this.variables.length; i++) {
        variablestxt.value += this.variables[i].scopelevel + " "
        variablestxt.value += this.variables[i].scopename + " "
        variablestxt.value += this.variables[i].gentype + " " //primitive or pointer
        variablestxt.value += this.variables[i].name + " "
        variablestxt.value += this.variables[i].type + " "
        variablestxt.value += this.variables[i].value
        variablestxt.value += '\n'
    }
}

Controller.prototype.writeRegister=function(reg,val){
    this.mydebugger.WriteRegister(reg, val); 
}
Controller.prototype.writeRegBit = function(reg,bit,val){
    //write the value intothe micros reg
    var newval = myMicrocontroller.writeRegBit(reg, bit, val);
    //send new val for whole register to JSCPP
    updateRegistersDisplay();
    //do not do this if PORT and DDRB is input as it must activate pullup resis ??
    try{
        this.mydebugger.writeRegister(reg, newval)
    } catch (e) {
        //dont worry, be happy
    }
}

//Controller.prototype.replaceMacro = function (a, b, row) {
//    //replace macro a with b, starting at row, 
//    //works well but want to add comments to end of line
//    var locs = [];
//    locs = codeEditor.findAll(a, {
//        caseSensitive: true,
//        range: new Range(row + 1, 0, codeEditor.session.getLength(), 0),
//        wholeWord: true,  //dont like having to make this false, as it may cause errors so no () in macros
//        regExp: false
//    })
//    codeEditor.replaceAll(b);
//}
