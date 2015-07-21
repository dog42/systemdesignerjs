﻿"use strict";
var CodeMaker;

CodeMaker = function (bdMicro) {
    // places to write the autogenerated code
    this.CS = [{
        "header": "",
        "defines": "",
        "includes": "",
        "iomacros": "",
        "proto": "",
        "adcconf": "",
        "serconf": "",
        "globals": "",
            "mainstart": "",
            "mainhwsetup": "",
            "ioconfigs": "",
            "mainvars": "",
            "runonce": "",
           //"whilestart": "",
            "loopcode": "",
            //"whileend": "",
            //"mainend":"",
        "funcs": ""
    }];
    
    this.projectname = "";
    this.username = "";
    this.crystal = 16000000;
    this.baud = 9600;
    this.hasInputs = false;
    this.hasADC = false;
    this.hasSerialOut = false;
    this.hasCharLCD = false;
    this.bdMicro = bdMicro;
    this.ilinks = this.bdMicro.getIncomingLinks();
    this.olinks = this.bdMicro.getOutgoingLinks();
    return this;
}
CodeMaker.prototype.makeFullCode = function () {
    //code = js_beautify(code);
    this.CS["header"] =this.header();
    this.CS["iomacros"] = this.iomacros();
    this.CS["defines"] = this.defines();
    this.CS["includes"] = this.includes();
    this.CS["proto"] = this.addFuncPrototypes();
    this.CS["adcconf"] = this.adcconfig();
    this.CS["serconf"] = this.serialoutput();
    this.CS["globals"] = this.addGlobalVars();

    this.CS["mainstart"] = this.buildMainStart();
    this.CS["mainhwsetup"] = this.buildMainHwSetup();
    this.CS["ioconfigs"] = this.ioconfigs();
    this.CS["mainvars"] = this.buildMainVars();
    this.CS["runonce"] = this.buildRunOnce();
    //this.CS["whilestart"] = this.buildWhile1Start();
    this.CS["loopcode"] = this.buildLoopCode();
    //this.CS["whileend"] = this.buildWhile1End();
    //this.CS["mainend"] = this.buildMainEnd();

    //var main = this.putTogetherMain();

    this.CS["funcs"] = js_beautify(this.buildFunctions());

    return this.putAllTogether();
}
CodeMaker.prototype.putAllTogether = function () {
    var code = this.CS["header"] +
        this.CS["defines"] +
        this.CS["includes"] +
        this.CS["iomacros"] +
        this.CS["proto"] +
        this.CS["adcconf"] +
        this.CS["serconf"] +
        this.CS["globals"] +
        this.putTogetherMain() + "\n\n"+
        this.CS["funcs"];
    return code;
}
CodeMaker.prototype.putTogetherMain = function () {
    var code = js_beautify(
        this.CS["mainstart"]+
        this.CS["mainhwsetup"] +
        this.CS["ioconfigs"] +
        this.CS["mainvars"] +
        this.CS["runonce"] +
        //this.CS["whilestart"] +
        this.CS["loopcode"]
        //this.CS["whileend"]+
        //this.CS["mainend"]
        );
    return code;
}

CodeMaker.prototype.getDateTime = function () {
    var currentTime = new Date();
    var hour = currentTime.getHours();
    var min = currentTime.getMinutes();
    var day = currentTime.getDate()
    var month = currentTime.getMonth() + 1;
    var year = currentTime.getFullYear()
    return day + "/" + month + "/" + year + "  " + hour + ":" + min;
}

CodeMaker.prototype.header = function () {
    var code = "/***** Project Header *****/\n"
    code += "// Project Name: " + this.projectname+ "\n"
    code += "// Author: " + this.username+ "\n"
    code += "// Date: " + this.getDateTime()+ "\n"
    code += "// Code auto-generated by systemdesignerjs\n";
    code += "//      from www.techideas.co.nz\n";
    code += "\n";
    return code;
}
CodeMaker.prototype.defines = function () {
    var code = "/***** Hardware defines *****/\n";
    code += "//make sure this matches your oscillator setting \n"
    code += "#define F_CPU " + this.crystal + "//crystal ";
    code += "\n"
    if (this.hasSerialOut) {
        code += "#define BAUD " + this.baud + "//baudrate";
        code += "\n"
        code += "#define BRGEN F_CPU/16/BAUD-1"
        code += "\n"
    }
    code += "\n"
    return code;
}
CodeMaker.prototype.includes = function () {
    var code = "/***** Includes *****/\n"
    code += "//#include <avr/io.h> \n"
    code += "//#include <stdint.h> \n"
    code += "#include <util/delay.h>  \n"
    code += "//#include <avr/interrupt.h>  \n"
    code += "//#include <avr/eeprom.h>  \n"
    code += "//#include <stdio.h>  \n"
    code += "//#include <string.h>  \n"
    code += "//#include <avr/pgmspace.h>  \n"
    code += "\n"
    return code;
}
CodeMaker.prototype.iomacros = function () {
    var code = "/***** Hardware macros *****/\n";
    code += "//Hardware macros for outputs\n";
    var tag;
    var name;
    for (var i = 0; i < this.olinks.length; i++) {
        tag = this.olinks[i].getTag();
        name = this.olinks[i].getDestination().getText();
        code += "#define " + "set_" + name + "   PORT" + tag.charAt(0) + " |= (1<<P" + tag.charAt(0) + tag.charAt(2) + ")\n"    //force output high\n";
        code += "#define " + "clr_" + name + "   PORT" + tag.charAt(0) + " &= ~(1<<P" + tag.charAt(0) + tag.charAt(2) + ")\n"    //force output low\n";
        code += "#define " + "toggle_" + name + "   PORT" + tag.charAt(0) + " ^= (1<<P" + tag.charAt(0) + tag.charAt(2) + ")\n"    //toggle output\n";
    }
    code += "//Hardware macros for inputs\n";
    for (var i = 0; i < this.ilinks.length; i++) {
        if (this.ilinks[i].getOrigin().getId().indexOf("binary") > 0) {
            tag = this.ilinks[i].getTag();
            name = this.ilinks[i].getOrigin().getText();
            this.hasInputs = true;
            code += "#define " + name + "_IsLow   ~PIN" + tag.charAt(0) + " & (1<<P" + tag.charAt(0) + tag.charAt(2) + ")\n"    //true if pin is low\n";
            code += "#define " + name + "_IsHigh   PIN" + tag.charAt(0) + " & (1<<P" + tag.charAt(0) + tag.charAt(2) + ")\n"    //true if pin is high\n";
        }
    }
    code += "//Hardware macros for ADC inputs\n";
    this.hasADC = false;//recheck
    for (var i = 0; i < this.ilinks.length; i++) {
        if (this.ilinks[i].getOrigin().getId().indexOf("analog") > 0) {
            tag = this.ilinks[i].getTag();
            //only add if an adcchannel
            if (myMicrocontroller.getAdcChannel(tag) > -1) {
                name = this.ilinks[i].getOrigin().getText();
                this.hasADC = true;
                this.hasInputs = true;
                code += "#define " + name + " "
                code += tag.charAt(2) + "     //macro to refer to ADC channel\n"; //only goes by pin# at the moment which isn't correct for tiny45
            }
        }
    }
    code += "\n";
    return code;
}
CodeMaker.prototype.addFuncPrototypes = function () {
    var code = "/***** Prototypes for functions *****/\n";
    code += "\n";
    return code;
}
CodeMaker.prototype.addGlobalVars = function () {
    var code = "/***** Declare & initialise global variables *****/\n";
    code += "\n";
    return code;
}
CodeMaker.prototype.buildMainStart = function () {
    var code = "/***** Main program *****/\n";
    code += "int main()";
    code += "\n";
    code += "{";
    code += "\n";
    return code;
}
CodeMaker.prototype.buildMainHwSetup = function () {
    var code = "/***** Initial hardware setups go here *****/\n";
    if (this.hasADC) {
        code += "init_ADC(); //setup the ADC to work\n";
    }
    if (this.hasSerialOut) {
        code += "init_USART(); //setup the TXD to work\n";
    }
    code += "\n";
    return code;
}
CodeMaker.prototype.ioconfigs = function () {
    var code = "/***** IO Hardware Config *****/\n";
    code += "// Initially make all micro pins outputs\n";
    $.each(myMicrocontroller.Registers.getRegisters(), function (key, txt) {
        if (txt.name.indexOf("DDR") >= 0)
            code += txt.name + " = 0xff;             //set as outputs\n";
    });
    var tag;
    if (this.hasInputs) {
        code += "// make these pins inputs\n";
        for (var i = 0; i < this.ilinks.length; i++) {
            tag = this.ilinks[i].getTag();
            code += "DDR" + tag.charAt(0) + " &= ~(1<<P" + tag.charAt(0) + tag.charAt(2) + ");\n";    //set pin to input\n";
        }
    }
    for (var i = 0; i < this.ilinks.length; i++) {
        if (this.ilinks[i].getOrigin().getId().indexOf("_binary_") > 0) {
            tag = this.ilinks[i].getTag();
            code += "PORT" + tag.charAt(0) + " |= (1<<P" + tag.charAt(0) + tag.charAt(2) + ");    //activate internal pullup resistor\n";    // for " + link.getOrigin().getText());
        }
    }
    code += "\n";
    return code;
}
CodeMaker.prototype.adcconfig = function () {
    var code="";
    if (this.hasADC) {
        code = "/***** Configure ADC *****/\n";
        code += "void init_ADC()\n";
        code += "{\n";
        code += "//At 16MHZ set prescaler to 128 to get 125Khz clock\n";
        code += "ADCSRA |= ((1<<ADPS2)|(1<<ADPS1)|(1<<ADPS0));\n";
        code += "//At 1MHz set prescaler to 8 to get 125Khz clock\n";
        code += "//ADCSRA |= ((1<<ADPS1)|(1<<ADPS0));\n";
        code += "//AVcc as voltage reference with external capacitor on ARef\n";
        code += "//ADMUX |= (1<<REFS1);      //uncomment this line for internal voltage\n";
        code += "ADMUX |= (1<<REFS0);\n";
        code += "ADCSRA |= (1<<ADEN);       //Power on the ADC\n";
        code += "ADCSRA |= (1<<ADSC);       //Start initial conversion\n";
        code += "}\n";
        code += "// get a single adc reading from one channel\n";
        code += "uint16_t read_adc(uint8_t channel)\n";
        code += "{\n";
        code += "ADMUX &= 0xF0;                  //Clear previously read channel\n";
        code += "ADMUX |= channel;               //Set to new channel to read\n";
        code += "ADCSRA |= (1<<ADSC);            //Starts a new conversion\n";
        code += "while(ADCSRA & (1<<ADSC));      //Wait until the conversion is done\n";
        code += "return ADCW;                    //Returns the value from the channel\n";
        code += "}\n";
        code = js_beautify(code) + "\n\n";
    }
    return code;
}
CodeMaker.prototype.serialoutput = function () {
    var code = "";
    if (this.hasSerialOut) {
        code = "/***** Setup serial *****/\n";
        code += "// Setup serial port to send serial data\n";
        code += "void init_USART()\n";
        code += "{\n";
        code += "UBRR0H = (uint8_t)(BRGEN>>8); //Set baud rate\n";
        code += "UBRR0L = (uint8_t)(BRGEN); //Set baud rate\n";
        code += "UCSR0C |= (1<<USBS0); //2 stopbits\n";
        code += "UCSR0C |= (3<<UCSZ00); // 8data\n";
        code += "//UCSR0C |= (1 << UPM01) //parity\n";
        code += "//UCSR0C |= (1 << UPM00) //odd parity\n";
        code += "UCSR0B = (1<<TXEN0);        // Enable transmitter only\n";
        code += "}\n";
        code += "/******************/\n";
        code += "//Send 1 byte of data\n";
        code += "void usart_tx(uint8_t data)\n";
        code += "{\n";
        code += "//UDRE0 is set when buffer is empty, cleared while transmitting data\n";
        code += "//must default to 1 when TXEN0 is set\n";
        code += "while (!( UCSR0A & (1<<UDRE0))) // While not 1 wait (1 is data reg empty)\n";
        code += "{\n";
        code += "}\n";
        code += "UDR0 = data;// Put data into buffer, sends the data\n";
        code += "}\n";
        code += "\n";
        code= js_beautify(code) + "\n\n";
    }
    return code;
}
CodeMaker.prototype.buildMainVars = function () {
    var code = "/***** Main variables go here *****/\n";
    code += "\n";
    return code;
}
CodeMaker.prototype.buildRunOnce = function () {
    var code = "/***** Run once code goes here *****/\n";
    code += "\n";
    return code;
}
//CodeMaker.prototype.buildWhile1Start = function () {
//    return code;
//}
CodeMaker.prototype.buildLoopCode = function () {
    var code = "/***** Loop code *****/\n"
    code += "while(1)";
    code += "\n";
    code += "{";
    code += "\n";
    code += "\n"
    code += "\n"
    code += "} //end while(1)\n";
    code += "}   //end of main \n";
    return code;
}
//CodeMaker.prototype.buildWhile1End = function () {
//}
//CodeMaker.prototype.buildMainEnd = function () {
//    // code += "\n";  //cr are removed by beautify so dont add any here
//    return code;
//}
CodeMaker.prototype.buildFunctions = function(){
    var code = "/***** Functions *****/\n";
    return code;
}

CodeMaker.prototype.nodeChange = function () {
    //update the ones that might have changed
    myCodeMaker.updateFromSource(codeEditor.getValue())//first store all user code changes here, they will loose the changes in the areas below
    this.CS["iomacros"] = this.iomacros();      //**might change
    this.CS["adcconf"] = this.adcconfig();      //**might change //but what if the user has modified the options in here //??
    this.CS["serconf"] = this.serialoutput();   //**might change //but what if the user has modified the options in here //??
    this.CS["mainhwsetup"] = this.buildMainHwSetup(); //**part of main it might change
    this.CS["ioconfigs"] = this.ioconfigs();      //**part of main it might change

    return this.putAllTogether();
}

CodeMaker.prototype.updateFromSource = function (code) {
    var splits = code.split("/***** ")
    for (var s = 0; s < splits.length; s++) {//why does split create an e 
        splits[s] = "/***** " + splits[s]
        if (splits[s].indexOf("/***** Project")>-1)
            this.CS["header"] = splits[s]
        if (splits[s].indexOf("/***** Hardware defines") > -1)
            this.CS["defines"] = splits[s]
        if (splits[s].indexOf("/***** Includes") > -1)
            this.CS["includes"] = splits[s]
        if (splits[s].indexOf("/***** Hardware macros") > -1)
            this.CS["iomacros"] = splits[s]
        if (splits[s].indexOf("/***** Configure ADC") > -1)
            this.CS["adcconf"] = splits[s]
        if (splits[s].indexOf("/***** Setup serial") > -1)
            this.CS["serconf"] = splits[s]
        if (splits[s].indexOf("/***** Prototypes") > -1)
            this.CS["proto"] = splits[s]
        if (splits[s].indexOf("/***** Declare &") > -1)
            this.CS["globals"] = splits[s]
        if (splits[s].indexOf("/***** Main program") > -1)
            this.CS["mainstart"] = splits[s]
        if (splits[s].indexOf("/***** Initial hardware") > -1)
            this.CS["mainhwsetup"] = splits[s]
        if (splits[s].indexOf("/***** IO hardware") > -1)
            this.CS["ioconfigs"] = splits[s]
        if (splits[s].indexOf("/***** Main variables") > -1)
            this.CS["mainvars"] = splits[s]
        if (splits[s].indexOf("/***** Run once") > -1)
            this.CS["runonce"] = splits[s]
        if (splits[s].indexOf("/***** Loop code") > -1)
            this.CS["loopcode"] = splits[s]
        if (splits[s].indexOf("/***** Functions") > -1)
            this.CS["funcs"] = splits[s]
    }
    //these dont change??- everything changes!!
    //this.CS["whilestart"] = this.buildWhile1Start();
    //this.CS["whileend"] = this.buildWhile1End();
    //this.CS["mainend"] = this.buildMainEnd();
}