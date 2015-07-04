"use strict";
var Microcontroller 
Microcontroller = function () {
    this.Registers = new Registers;
    this.Memory = new Memory(256,2048); //328 mem size

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
    
    //read the deatils for the micro from the json data
    for (var index = 0; index < microsjson.micros.micro.length; index++)
    {
        if (partnum === microsjson.micros.micro[index].partnumber) //found micro
        {
            this.microPackage = microsjson.micros.micro[index].package;
            var start = microsjson.micros.micro[index].ramstart;
            var size = microsjson.micros.micro[index].ramsize;
            this.Memory.newSize(start,size)
            this.microEepromSize = microsjson.micros.micro[index].eepromsize;
            this.microCrystal = microsjson.micros.micro[index].crystal;
            for (reg=0; reg < microsjson.micros.micro[index].registers.regname.length; reg++)
            {
                n = microsjson.micros.micro[index].registers.regname[reg].name;
                a = microsjson.micros.micro[index].registers.regname[reg].address;
                d = microsjson.micros.micro[index].registers.regname[reg].description;
                bits = ["","","","","","","",""]; //holds the name for each bit of the register
                //get each bit for this register, add them to microRegBitNames
                exists = microsjson.micros.micro[index].registers.regname[reg].bitname;
                if (exists)//prob do not need to check as they are all unique!
                    for (bit=0; bit< microsjson.micros.micro[index].registers.regname[reg].bitname.length;bit++)
                    {
                        na = microsjson.micros.micro[index].registers.regname[reg].bitname[bit].name;
                        bn = microsjson.micros.micro[index].registers.regname[reg].bitname[bit].bit;
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
                this.microRegNamesStr += "|" + n; //the names used by ACE codeEditor
                //regDefines += "\n uint8_t " + n + " = 0;";
                //microRegisters.push({ name: n, address: a, description: d, bitnames:bits, value:0}); //all registers start life as 0b00000000
            }
           
            //get each pin and its functions
            this.microPins.length = microsjson.micros.micro[index].pins.pin.length + 1; //create new undefined array
            //microPins[0]="0"; //nothing in index0
            for (pin = 0; pin < microsjson.micros.micro[index].pins.pin.length; pin++)
            {
                this.microPins[pin] = microsjson.micros.micro[index].pins.pin[pin].f;
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


Microcontroller.prototype.containsBit = function(a, obj) {
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