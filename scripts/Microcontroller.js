"use strict";
var Microcontroller 
Microcontroller = function () {
    this.microIndex =0;
    this.Registers = new Registers;
    this.Memory = new Memory(256,2048); //328 mem size
    this.Ports = []; // {index:0 , name:PORTA, value:} index refers to where in Registers.registers this port is found
    this.DDR = [];
    this.bdMicro = null; //the diagram node holding the micro

    this.microPartnumber = "xplained(ATmega328P)"; //removed from image when dropped from nodelist and placed here
    this.microPackage = "xplained";   //leads to image name to load
    this.microWidth = 55;
    this.microHeight = 115;
    //this.microRamStart = 256;
    //this.microRamSize = 2048;

    this.microEepromSize = 512;
    this.microCrystal = 16000000;
    this.microRegNamesStr = ""; //just the reg names with '|' separators for ACE codeEditor
    this.microRegBitNamesArr = []; // [,,,]
    this.bitNamesDecl = ""; // used to add to code on run so that JSCPP knows about bit names
    this.microPins = []; 
    this.adcPins = []; //arr of the names of adc pins A.0, A.1...
    this.adcValues = [];//voltage values
    this.adcSetup = [];  //configs for the adc option
    this.adcConf=[]
    this.adcRefValue = 5;
    this.recurse = false;
    this.ADCW = 0; //the value of the ADCword - this is updated when the slider is changed,
                    // but only if the slider matches the MUX3..0 in ADCMUX   
}

//make all the details for a specific micro from json object
Microcontroller.prototype.setupMicro = function(partnum)
{
    this.microPartnumber = partnum;
    //reset everything
    this.Registers.removeAllRegs();
    this.Memory.clear();
    this.Ports.length = 0;
    this.DDR.length = 0;

    this.microRegNamesStr = "";
    this.microRegBitNamesArr.length = 0;
    this.bitNamesDecl = "";
    this.microPins.length = 0;
    this.adcPins.length = 0;


    var reg = 0; 
    var bit = 0;
    var pin = 0;
    var n, a, d, bits;
    var exists = false;
    var na;
    var bn;
    var bitexists = false;
    
    //read the details for the micro from the json data
    for (var index = 0; index < mf.micros.length; index++)
    {
        if (mf.micros[index].partnumber.indexOf(partnum) === 0) //found micro
        {
            this.microIndex=index;
            var mm = mf.micros[index]
            this.microPackage = mm.package;
            var start = mm.ramstart;
            var size = mm.ramsize;
            this.Memory.newSize(start,size)
            this.microEepromSize = mm.eepromsize;
            this.microCrystal = mm.crystal;
            for (reg = 0; reg < mm.registers.regname.length; reg++)
            {
                n = mm.registers.regname[reg].name;
                a = mm.registers.regname[reg].address;
                d = mm.registers.regname[reg].description;
                bits = ["","","","","","","",""]; //holds the name for each bit of the register
                //get each bit for this register, add them to microRegBitNames
                exists = mm.registers.regname[reg].bitname;
                if (exists)//prob do not need to check as they are all unique!
                    for (bit=0; bit< mm.registers.regname[reg].bitname.length;bit++)
                    {
                        na = mm.registers.regname[reg].bitname[bit].name;
                        bn = mm.registers.regname[reg].bitname[bit].bit;
                        bitexists = false; //prob do not need to check as they are all unique!
                        for (var b = 0; b < this.microRegBitNamesArr.length; b++)
                            if (na === this.microRegBitNamesArr[b].name)
                                bitexists = true;
                        if (!bitexists)
                        {
                            bits[bn] = na;
                            this.microRegBitNamesArr.push({ name: na, bit: bn }); //add it to each array
                            this.bitNamesDecl += "\n avrregbit " + na + " = " + bit +";";
                        }
                    }
                this.Registers.addRegister(n, a, d, bits);
                if (n.indexOf("PORT") > -1)
                    this.Ports.push({ index:reg, name: n, value:0 });//name value pair
                if (n.indexOf("DDR") > -1)
                    this.DDR.push({ index:reg, name:n, value:255 });//name value pair - all DDR bits start as 1.
                this.microRegNamesStr += "|" + n; //the names used by ACE codeEditor
                //regDefines += "\n uint8_t " + n + " = 0;";
                //microRegisters.push({ name: n, address: a, description: d, bitnames:bits, value:0}); //all registers start life as 0b00000000
            }
           
            //get each pin and its functions
            this.microPins.length = mm.pins.pin.length + 1; //create new undefined array
            //microPins[0]="0"; //nothing in index0
            for (pin = 0; pin < mm.pins.pin.length; pin++)
            {
                this.microPins[pin] = mm.pins.pin[pin].f;
                for (var a = 0; a < this.microPins[pin].length; a++) { //check to see if adc pin
                    if (this.microPins[pin][a].indexOf('ADC') > -1) {
                        var channel = this.microPins[pin][a].substring(3,4)
                        this.adcPins[channel]=(this.microPins[pin][0])
                        break;
                    }
                }
            }
            break;
        }
    }

    //update keywords in ACE needs to come out of here
    // stackoverflow.com/questions/22166784/dynamically-update-syntax-highlighting-mode-rules-for-the-ace-editor
    codeEditor.session.setMode({
        path: "ace/mode/c_cpp",
        v: Date.now()
    })

    updateRegistersDisplay(); //needs to come out of here

}
Microcontroller.prototype.writeRegBit = function (port, pin, val) {
    this.Registers.writeRegBit(port,pin,val)
    return this.Registers.readRegister(port)
}
Microcontroller.prototype.updateMemory = function(arr){
    this.Memory.updateMemory(arr);
}
Microcontroller.prototype.updateRegisters = function(arr){
    this.Registers.updateRegisters(arr);
}

Microcontroller.prototype.regChanged = function () {
    if (myMicrocontroller.recurse)//need to block
        return
    myMicrocontroller.recurse = true;
    //View #regs-jqxgrid'.on'bindingcomplete'
    //we dont know what has changed just that a change has taken place
    //1. check if adc conversion to take place get bit ADSC of ADCSRA
    var bit = this.Registers.readRegBit("ADCSRA", 6) //"ADSC"=6)
    if (bit) {//adc conversion flagged if true
        //find currently selected adcChannel from ADMUX
        var ADMUX = myController.readRegister("ADMUX")
        ADMUX = ADMUX & 0x0F; //get lower 4 bits
        myMicrocontroller.getAdcValue(ADMUX)
        //reset the reg to 0
        this.writeRegBit("ADCSRA", 6, 0) //ADSC=6
        myController.writeRegBit("ADCSRA", 6, 0)
        updateRegistersDisplay()
        var x = true;
    }
    var regs = this.Registers.registers

    //2. update the outputs on the diagram with any changes to a PORT register
    var ports = myMicrocontroller.Ports;
    for (var i = 0; i < ports.length; i++) //check if a port has changed
    {
        var j = ports[i].index; //see whatthe port arr has stored in it
        var newval = regs[j].valuedec;
        var oldval = ports[i].value;
        var change = newval ^ oldval;
        if (regs[j].valuedec ^ ports[i].value > 0) { //see if any bit has changed
            ports[i].value = newval;//store the new val for next time around
            //for each bit that has changed
            for (var k = 0; k < 8; k++) {
                //var c = change & 1 << k;
                if ((change & 1 << k) > 0) {
                    var newbitval = (newval & 1 << k) >> k;
                    var portname = regs[j].name;
                    mf.updateOutput(portname, k, newbitval) //?? only id DDRX.Y is 1 (output)
                }
            }
        }
    }
    myMicrocontroller.recurse = false;
}
Microcontroller.prototype.newAdcValue = function (voltage, adcChannel) {
    //convert pin to adcChannel - really only needed for ATtiny45
    //var adcChannel = parseInt(ch,10);
    //get ADMUX register bits MUX3..MUX0 
    if (this.adcValues === null || this.adcValues === undefined)
        for (var i = 0; i < this.adcPins.length; i++)
            this.adcValues[i]= 0;
    this.adcValues[adcChannel] = voltage;
}

Microcontroller.prototype.getAdcValue = function (adcChannel){
    //identify the vRef value (1.1/ 2.45 VCC)
    //assume 1.1
    //convert voltage to number
    var a = (this.adcValues[adcChannel] / myMicrocontroller.adcRefValue * 1023)
    a |= 0; // |0 (or with 0) to truncate
    if (a > 1023)
        a = 1023;//max
    //add checking that adc is converting
    //add a delay here
    myMicrocontroller.ADCW = a;
    var adcl = a & 0xFF;
    var adch = a >> 8;
    //write the new value into the intepreter
    myController.writeRegister("ADCL", adcl)
    myController.writeRegister("ADCH", adch)
    //write the value into memory
    myController.writeRegister("ADCW", a) //not really a reg but can write to anything
    myMicrocontroller.Memory.writeADCW(a);
    updateMemoryDisplay();
    //write the value into the registers
    myMicrocontroller.Registers.setRegValue("ADCL", adcl)
    myMicrocontroller.Registers.setRegValue("ADCH", adch)
    updateRegistersDisplay();
}
Microcontroller.prototype.getAdcChannel = function (pinName) {
    for (var ch = 0; ch < this.adcPins.length; ch++) {
        if (this.adcPins[ch] === pinName)
            return ch;
    }
    return -1;
}
//Microcontroller.prototype.hasAdcChannel = function (portpin) { //eg C.3
//    for (var ch = 0; ch < this.adcPins.length; ch++) {
//        if (this.adcPins[ch] === portpin)
//            return ch;
//        else
//            return -1
//    }
//}
Microcontroller.prototype.getRefVoltage = function () {
    //var adcsetup = mf.micros[this.microIndex].adcsetup;
    //var refsetup=[]
    //var reg, bit, i
    //for (var c = 0; c < adcsetup.length; c++) {
    //    i = adcsetup[c].bit.substring(4,5)
    //    i = parseInt(i)
    //    refsetup[i] = this.Registers.get
    //        ({ reg: adcsetup[c].reg, bit: adcsetup[c].bit })
    //}
    //for (var c = 0; c < mm.adcconf.length; c++) {
    //    this.adcConf.push({ bit: mm.adcconf[c].bit, ref: mm.adcconf[c].ref })
    //}

    ////find out which registers and bits to look at from adcsetup
    //for (var r =0; r<this.adcSetup.length)
}
Microcontroller.prototype.containsBit = function (a, obj) {
    for (var i = 0; i < a.length; i++) {
        if (a[i] === obj) {
            return true;
        }
    }
    return false;
}
Microcontroller.prototype.getRegistersArr = function () {
    return this.Registers.getRegisters();
}
Microcontroller.prototype.getRegisterDecls = function () {
    return this.Registers.getRegisterDecls();
}
Microcontroller.prototype.getMicroRegBitNamesStr = function(){
    return microRegBitNamesStr;
}
Microcontroller.prototype.getMemoryArr = function(){
    return this.Memory.getMemory();
}
Microcontroller.prototype.getSRAMArr = function () {
    return this.SRAM;
}