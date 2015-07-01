"use strict";

var Diagram = MindFusion.Diagramming.Diagram;
var Events = MindFusion.Diagramming.Events;
var DiagramLink = MindFusion.Diagramming.DiagramLink;
var ShapeNode = MindFusion.Diagramming.ShapeNode;
var AnchorPattern = MindFusion.Diagramming.AnchorPattern;
var AnchorPoint = MindFusion.Diagramming.AnchorPoint;
var MarkStyle = MindFusion.Diagramming.MarkStyle;
var Rect = MindFusion.Drawing.Rect;
var ImageAlign = MindFusion.Diagramming.ImageAlign;
var Alignment = MindFusion.Diagramming.Alignment;

var diagram = null;

var black = "#000000";
var blue = "#0000FF";
var green = "#00FF00";
var red = "#FF0000";
var yellow = "#FFFF00";
var darkblue = "#08088A";
var darkorange = "#B43104";
var purple = "#6A0888";
var brown = "#61210B";
var plum = "#A901DB"

var codeEditor;
var tokenEditor;
var aceEditor;

var microsjson = []; //the file with all the data on the microcontrollers 
var packagesjson = [];
var microsLoaded = false;
var packagesLoaded = false;
var microsPartNumbersArr = [];//all the different microcontrollers in the json

var myMicrocontrollerNode; //the diagram node holding the micro
var myCodeMaker;
var code = "";
var myMicrocontroller = new Microcontroller();//need a micro at the beginning for bindings to work

//$(document).ready(function (){ //jquery
Sys.Application.add_load(function (sender, args) {

    layout_init();          //sets up the window
    mindfusion_init();      //creates diagram and drop downs
    main_initEditors();
    //registers = new Registers();
    //wait a bit and load the default
   setTimeout(main_loadDefaultMicro, 800); 

    //testing
   //setTimeout(parserTests_test,1000);
   
});

function main_initEditors()
{
    codeEditor = ace.edit("codeeditor");
    codeEditor.setTheme("ace/theme/monokai");
    codeEditor.getSession().setMode("ace/mode/c_cpp");
    //codeEditor.getSession().setFoldStyle('manual');
    //codeEditor.setSelectionStyle('line');
    codeEditor.setHighlightActiveLine(true);
    codeEditor.setShowInvisibles(true);
    //codeEditor.setDisplayIndentGuides(true);
    codeEditor.renderer.setHScrollBarAlwaysVisible(true);
    codeEditor.setAnimatedScroll(false);
    //codeEditor.renderer.setShowGutter(true);
    //codeEditor.renderer.setShowPrintMargin(false);
    //codeEditor.getSession().setUseSoftTabs(false);
    //codeEditor.setHighlightSelectedWord(true);
    //codeEditor.setHighlightActiveLine(false); //default=true

    //tokenEditor = ace.edit("tokeneditor");
    //tokenEditor.setTheme("ace/theme/monokai");
    //tokenEditor.getSession().setMode("ace/mode/text");

    //aceEditor = ace.edit("aceEditor");
    //aceEditor.setTheme("ace/theme/monokai");
    //aceEditor.getSession().setMode("ace/mode/text");
}

function main_loadDefaultMicro() {
    //myMicrocontroller = new Microcontroller(); //generates default micro an 'xplained'
    myMicrocontroller.makeMicro("xplained(ATmega328P)")
    myMicrocontrollerNode = new MicrocontrollerNode(myMicrocontroller);//make a diagram node for the micro

    myCodeMaker = new CodeMaker(myMicrocontrollerNode); //using the diagram create some startup code
    code = myCodeMaker.getFullCode(); 
    displayCode();
    
    //var x = myMicrocontroller.getRegisters();
    updateRegistersDisplay();
}



function makeDisplayCode() {
    myCodeMaker = new CodeMaker(myMicrocontrollerNode);
    code = myCodeMaker.getFullCode();
    displayCode();

}

//DISPLAYS PROGRAM CODE
function displayCode() {
    codeEditor.setValue(code);
    codeEditor.gotoLine(1); 
}

function updateRegistersDisplay() {
    $("#regs-jqxgrid").jqxGrid('updatebounddata');
    //recolor LEDs
    //add changes to JSCPP
}



// memory bindings
var vars =
{
    localdata: myMicrocontroller.getMemoryArr(),
    datatype: "array",
    datafields:
    [
        { name: 'address', type: 'string' },
        { name: 'name', type: 'string' },
        { name: 'valuedec', type: 'number' }
    ],
    sortcolumn: 'addrhex',
    sortdirection: 'desc'
};
var varsAdapter = new $.jqx.dataAdapter(vars);
$("#vars-jqxgrid").jqxGrid(
{
    width: 500,
    height: '100%',
    source: varsAdapter,
    columnsresize: true,
    sortable: true,
    columnsreorder: true,
    columns: [
        { text: 'Addr', datafield: 'addrhex', width: 42 },
        { text: 'Name', datafield: 'name', width: 70 },
        { text: 'Val', datafield: 'valuehex', width: 42 },
        { text: 'Val(bin)', datafield: 'valuebin', width: 95 },
        { text: 'Val(dec)', datafield: 'valuedec', width: 40 },
        { text: 'Description', datafield: 'description', width: 240 }
    ]
});


var ram =
{
    localdata: myMicrocontroller.getSRAMArr(),
    datatype: "array",
    datafields:
    [
        { name: 'name', type: 'string' },
        { name: 'type', type: 'string' }
    ],
    sortcolumn: 'addrhex',
    sortdirection: 'desc'
};
var SRAMAdapter = new $.jqx.dataAdapter(ram);
$("#sram-jqxgrid").jqxGrid(
{
    width: 500,
    height: '100%',
    source: SRAMAdapter,
    columnsresize: true,
    sortable: true,
    columnsreorder: true,
    columns: [
        { text: 'Addr', datafield: 'addrhex', width: 42 },
        { text: 'Name', datafield: 'name', width: 70 },
        { text: 'Val', datafield: 'valuehex', width: 42 },
        { text: 'Val(bin)', datafield: 'valuebin', width: 95 },
        { text: 'Val(dec)', datafield: 'valuedec', width: 40 },
        { text: 'Description', datafield: 'description', width: 240 }
    ]
});


function sort() {
    $("#vars-jqxgrid").jqxGrid('sortby', 'addrhex', 'desc');
    $("#sram-jqxgrid").jqxGrid('sortby', 'addrhex', 'desc');
}

function Variables_SetVarValue(variable, newvalue) {
    //error check for bit > 7?
    for (var index = 0; index < Memory.length; index++) {
        if (variable === Memory[index].name) {
            Memory[index].valuedec = newvalue;
            $("#vars-jqxgrid").jqxGrid('updatebounddata');
            return true;
        }
    }
    return false; //cannot find variable
}

//Registers bindings
//https://www.jqwidgets.com/jquery-widgets-documentation/documentation/jqxdataadapter/jquery-data-adapter.htm

var regs =
{
    localdata: myMicrocontroller.getRegistersArr(),
    datatype: "array",
    datafields:
    [
        { name: 'name', type: 'string' },
        { name: 'addrhex', type: 'string' },
        { name: 'valuehex', type: 'string' },
        { name: 'valuebin', type: 'string' },
        { name: 'valuedec', type: 'number' },
        { name: 'description', type: 'number' }
    ],
    sortcolumn: 'addrhex',
    sortdirection: 'desc'
};

var regsAdapter = new $.jqx.dataAdapter(regs);

$("#regs-jqxgrid").jqxGrid(
{
    width: 500,
    height: '100%',
    source: regsAdapter,
    columnsresize: true,
    sortable: true,
    columnsreorder: true,
    columns: [
        { text: 'Addr', datafield: 'addrhex', width: 42 },
        { text: 'Name', datafield: 'name', width: 70 },
        { text: 'Val', datafield: 'valuehex', width: 42 },
        { text: 'Val(bin)', datafield: 'valuebin', width: 95 },
        { text: 'Val(dec)', datafield: 'valuedec', width: 40 },
        { text: 'Description', datafield: 'description', width: 240 }
    ]
});

function sort() {
    $("#regs-jqxgrid").jqxGrid('sortby', 'addrhex', 'desc');
}

