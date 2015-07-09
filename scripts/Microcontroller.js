"use strict";
var Microcontroller 
Microcontroller = function () {
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
    this.microPins = []; //not used??
}


//make all the details for a specific micro from json object
Microcontroller.prototype.makeMicro = function(partnum)
{
    this.microPartnumber = partnum;
    this.Registers.removeAllRegs();
    this.Memory.clear();
    this.microRegBitNamesArr.length = 0;
    this.microRegNamesStr = "";
    this.bitNamesDecl = "";
    this.microPins.length = 0;


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