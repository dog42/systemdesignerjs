"use strict";

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
                View.Message(s,"blue")
            }
        },
        debug: this.debug
    }
    this.mydebugger;
    this.runid;
    this.rundelay = 500;
    this.codecopy = "";
    this.mainProgramLine = 0;
}
// BUTTON COMMANDS
Controller.prototype.B = function () {
    mf.updateOutput("PORTB", 5, 1);
}
Controller.prototype.C = function () {
    mf.updateOutput("PORTB", 5, 0);
}

//running logic
Controller.prototype.Start = function(startokstate)
{
    this.codecopy = codeEditor.getValue();//back before running and put back at stop
    try {
        myMicrocontroller.Registers.clear();//set all registers to 0 
        //read any high inputs
        mf.readInputs()
        //set all outputs off
        mf.setOutputsOff()
        updateRegistersDisplay();
        myMicrocontroller.Memory.clear(); //remove all 
        updateMemoryDisplay();
        this.config.debug = true;
        View.Message("Start","green");
        var regsnbits = "uint16_t ADCW=0; \n"
        regsnbits += myMicrocontroller.getRegisterDecls()
        regsnbits += myMicrocontroller.bitNamesDecl;
        this.code = this.fixCode()
        //this.code = this.replaceMacros()
        this.code = this.code + regsnbits;
        if (browser.accessName === "msie") { //other older browswers need testing too ??
        View.Message("you need to use a modern desktop version of Firefox or Chrome", "red")
        return;
    }
        //this.input = document.getElementById("inputtxt").value;

        this.mydebugger = JSCPP.run(this.code, this.input, this.config);
        //console.log(mydebugger.src);
    } catch (e) {
        var msgloc
        if (e.line !== undefined)
            msgloc += " on line:" + e.line
        if (e.column !== undefined)
            msgloc += " in column:" + e.column
        var msg = e.message += msgloc
        if (e.message.indexOf("Expected")>-1) {
            msg=e.name + ": unexpected " + e.found + msgloc + " & also check previous line (;)"
        }
        View.Message(msg,red);
        if (this.mydebugger !== undefined)
            View.Message(this.mydebugger.stop(),"blue");
        this.parserstate = this.PARSERSTATE.STOP
        codeEditor.setValue(this.codecopy);//put original code back
        codeEditor.gotoLine(e.line)
        return;
    }
    this.parserstate = startokstate;
}
Controller.prototype.Step = function ()
{
    if (myController.parserstate === myController.PARSERSTATE.STOP) {
        myController.Start(myController.PARSERSTATE.STEP)
    }
    if (myController.parserstate === myController.PARSERSTATE.STEP) {
        View.Message("Step Mode: press Step, Run or Stop", "green")
        myController.onestep();
    }
    if (myController.parserstate === myController.PARSERSTATE.RUNNING) {
        myController.parserstate=myController.PARSERSTATE.STEP
    }
}
Controller.prototype.Run = function ()
{
    if (myController.parserstate === myController.PARSERSTATE.STOP) {
        myController.Start(myController.PARSERSTATE.RUN)
    }
    if (this.parserstate === this.PARSERSTATE.STEP) {
        myController.parserstate = myController.PARSERSTATE.RUNNING;
        myController.loop();
    }
    if (myController.parserstate === myController.PARSERSTATE.RUN) {
        myController.loop();
        
    }
}
Controller.prototype.loop = function(){
    if (myController.parserstate === myController.PARSERSTATE.RUN) {
        myController.parserstate = myController.PARSERSTATE.RUNNING
    }
    if (myController.parserstate !== myController.PARSERSTATE.RUNNING) {//pressed Stop or Step
        return
    }
    View.Message("Run Mode: press Step, Run or Stop", "green")
    myController.onestep();
    window.setTimeout(myController.loop,View.getRunDelay())
}
Controller.prototype.onestep = function(){
    try {
        var done;
        done = myController.mydebugger.next();
        myMicrocontroller.updateMemory(myController.mydebugger.Variables());
        updateMemoryDisplay();
        //registers and diagram
        myMicrocontroller.Registers.updateRegisters(myController.mydebugger.Registers());
        updateRegistersDisplay();
        myController.updateLineHighlight();
        if (!done) {
            //View.Message(myController.mydebugger.nextLine(),"green");
            //myController.mydebugger.nextLine();
        } else {//done
            myController.Stop()
            View.Message('Finished',"blue");
            clearInterval(myController.runid)
            return;
        }
    } catch (e) {
        myController.Stop()
        View.Message(e,"red");
        clearInterval(myController.runid);
        return;
    }
}
Controller.prototype.Stop = function (){
    //if (myController.parserstate !== myController.PARSERSTATE.STOP)
    View.Message("Stopped: press Step or Run", "green"); //only show if not stopped
    if (myController.linemarker !== undefined)
        codeEditor.getSession().removeMarker(myController.linemarker)
    myController.debug = null;
    //clearInterval(myController.runid);
    if (myController.parserstate !== myController.PARSERSTATE.STOP) {
        codeEditor.setValue(this.codecopy);//put original code back
        
        codeEditor.gotoLine(myController.mainProgramLine);//prefer to goto index of main()
        myController.parserstate = myController.PARSERSTATE.STOP;
    }
}
Controller.prototype.fixCode = function () {
    //need to replace and pack so that the 
    // code passed to the interpreter has exactly the same number of lines as the editor 
    var arr = [];
    for (var i = 0; i < codeEditor.session.getLength(); i++) {
        arr[i] = codeEditor.session.getLine(i);
        if (arr[i].indexOf("Main program") > -1)
            myController.mainProgramLine = i+1;
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
        if (arr[i].indexOf("#include <") > -1) {
            //delet all / and remove .h
            var s = arr[i]
            s = s.replace("/", "").replace(".h", "")
            arr[i]= s
        }   
    }
    return arr.join(['\n'])
}

Controller.prototype.replaceMacro = function (a, b, row) { 
    //replace a with b, starting at row, 
    //works well -added comments to end of line
    //need to fix macros inside statement so that no ; is added
    //dont replacemacros inside comments
    var session = codeEditor.session;
    codeEditor.$search.setOptions({
        needle: a,
        caseSensitive: true,
        range: new Range(row + 1, 0, session.getLength(), 0),//only from line after macro 
        wholeWord: true,  //dont like having to make this false, as it may cause errors so no () in macros
        regExp: false
    });
    var ranges = codeEditor.$search.findAll(session)  //codeEditor.session same as codeEditor.getSession())
    b = b.trim();
    codeEditor.replaceAll(b);
    //add macro as comment at end of line
    for (var i = 0; i < ranges.length; i++) {
        var comm = session.getLine(ranges[i].start.row).indexOf("//");
        var pos = { row: ranges[i].start.row, column: 0 }
        if (comm > -1) { //comment exists
            pos.column = comm + 2;
            session.insert(pos, " " + a + "_ ")//needed an extra character_ to stop this being replaced as well
        }
        else {
            pos.column = session.getLine(ranges[i].start.row).length;
            session.insert(pos, "// " + a + "_ ")//needed an extra character_
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

Controller.prototype.writeRegister=function(reg,val){
    if (myController.mydebugger !== undefined)
        myController.mydebugger.WriteRegister(reg, val);
}
Controller.prototype.readRegister = function (reg) {
    if (myController.mydebugger !== undefined)
        return myController.mydebugger.ReadRegister(reg);
    return 0;
}
Controller.prototype.writeADCW = function (val) {
    for (var i = 0; i < this.memory.length; i++)
        if (this.memory[i].name === "ADCW")
            this.memory[i].value = val;
}
Controller.prototype.writeRegBit = function(reg,bit,val){
    //write the value intothe micros reg
    var newval = myMicrocontroller.writeRegBit(reg, bit, val);
    //send new val for whole register to JSCPP
    updateRegistersDisplay();
    //do not do this if PORT and DDRB is input as it must activate pullup resis ??
    try{
        myController.writeRegister(reg, newval)
    } catch (e) {
        View.Message(e.message);
        //dont worry, be happy
    }
}
