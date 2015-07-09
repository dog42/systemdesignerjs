"use strict";

var Diagram = MindFusion.Diagramming.Diagram;
var Events = MindFusion.Diagramming.Events;
var DiagramLink = MindFusion.Diagramming.DiagramLink;
var ShapeNode = MindFusion.Diagramming.ShapeNode;
var SvgNode = MindFusion.Diagramming.SvgNode;
var SvgContent = MindFusion.Diagramming.SvgContent;
var AnchorPattern = MindFusion.Diagramming.AnchorPattern;
var AnchorPoint = MindFusion.Diagramming.AnchorPoint;
var MarkStyle = MindFusion.Diagramming.MarkStyle;
var Rect = MindFusion.Drawing.Rect;
var ImageAlign = MindFusion.Diagramming.ImageAlign;
var Alignment = MindFusion.Diagramming.Alignment;
var NodeListView = MindFusion.Diagramming.NodeListView;


var black = "#000000";
var white = "#ffffff"
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
//var tokenEditor;
//var aceEditor;

var diagram;

var mf; //myMfDiagram;
var myMicrocontrollerNode; //the diagram node holding the micro
var myCodeMaker;
var myMicrocontroller = new Microcontroller();//need a micro at the beginning for bindings to work
var myController = new Controller();

//$(document).ready(function (){ //jquery
Sys.Application.add_load(function (sender, args) {

    layout_init();          //sets up the window

    main_initEditors();   //sets up ACE codeEditor
    //open the files


    mf = new mfDiagram(); //mindfusion stuff
    mf.init();      //creates diagram and drop downs

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
    myMicrocontroller.makeMicro("xplained(ATmega328P)")
    myMicrocontrollerNode = new MicrocontrollerNode(myMicrocontroller);//make a diagram node for the micro
    myCodeMaker = new CodeMaker(myMicrocontrollerNode.Node); //using the diagram create some startup code
    myCodeMaker.makeFullCode(); 
    displayCode();
    updateRegistersDisplay();

}


//DISPLAYS PROGRAM CODE
function displayCode() {
    codeEditor.setValue(myCodeMaker.code);
    codeEditor.gotoLine(1); 
}

function updateRegistersDisplay() {
    $("#regs-jqxgrid").jqxGrid('updatebounddata');
}
function updateMemoryDisplay() {
    $("#vars-jqxgrid").jqxGrid('updatebounddata');
}




//identify browser
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


// memory bindings
var vars =
{
    localdata: myMicrocontroller.getMemoryArr(),
    datatype: "array",
    datafields:
    [
        { name: 'type', type: 'string' },
        { name: 'name', type: 'string' },
        { name: 'valuedec', type: 'number' }
    ],
    //sortcolumn: 'name',
    //sortdirection: 'desc'
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
        { text: 'Type', datafield: 'type', width: 42 },
        { text: 'Name', datafield: 'name', width: 70 },
        { text: 'Val', datafield: 'valuedec', width: 42 }
        //{ text: 'Val(bin)', datafield: 'valuebin', width: 95 },
        //{ text: 'Val', datafield: 'valuedec', width: 40 },
        //{ text: 'Description', datafield: 'description', width: 240 }
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



//Grid events
$('#regs-jqxgrid').on('bindingcomplete', function (event) {
    var args = event.args;
    //update the outputs on the diagram with any PORT changes
    var regs = myMicrocontroller.Registers.registers
    var ports = myMicrocontroller.Ports;
    for (var i=0; i<ports.length; i++) //for each port
    {
        var j = ports[i].index;
        var newval = regs[j].valuedec;
        var oldval = ports[i].value;
        var change = newval ^ oldval;
        if (regs[j].valuedec ^ ports[i].value > 0) { //see if any bit has changed
            ports[i].value = newval;//store the new val for next time around
            //for each bit that has changed
            for (var k = 0; k < 8; k++) {
                //var c = change & 1 << k;
                if ((change & 1 << k) > 0) {
                    var newbitval = (newval & 1 << k)>>k;
                    var portname = regs[j].name;
                    mf.updateOutput(portname, k, newbitval)
                }
            }
        }
    }
    //alert(event.args);
});

//$('#regs-jqxgrid').on('onvaluechanged', function (event) { //doesnt fire on binding changes
//    var args = event.args;
//    alert(event.args);
//});


function sort() {
    $("#regs-jqxgrid").jqxGrid('sortby', 'addrhex', 'desc');
}

