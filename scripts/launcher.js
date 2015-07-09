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
var View;

var diagram;
var zoomer;

var mf; //myMfDiagram;
var myMicrocontrollerNode; //the diagram node holding the micro
var myCodeMaker;
var myMicrocontroller = new Microcontroller();//need a micro at the beginning for bindings to work
var myController = new Controller();

var theme = 'darkblue'


$(document).ready(function (sender, args) { //jquery

    View = new View();

    View.InitLayout();          //sets up the window

    main_initEditors();   //sets up ACE codeEditor

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
    View.DisplayCode();
    updateRegistersDisplay();
}




function updateRegistersDisplay() {
    $("#regs-jqxgrid").jqxGrid('updatebounddata');
}
function updateMemoryDisplay() {
    $("#vars-jqxgrid").jqxGrid('updatebounddata');
}





