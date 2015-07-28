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
var currentNode;

var color = {
    "black": "#000000",
    "white": "#ffffff",
    "blue": "#0000FF",
    "green": "#00FF00",
    "red": "#FF0000",
    "yellow": "#FFFF00",
    "darkblue": "#08088A",
    "darkorange": "#B43104",
    "purple": "#6A0888",
    "brown": "#61210B",
    "plum": "#A901DB"
}

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

var response = new $.jqx.response();
var browser = response.browser;

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

var debug = true;
var version= 0.11

var microsloaded = false;
var packagesloaded = false;
var binaryinputsloaded = false;
var analoginputsloaded = false;


var QueryString = function () {
    // This function is anonymous, is executed immediately and 
    // the return value is assigned to QueryString!
    var query_string = {};
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        // If first entry with this name
        if (typeof query_string[pair[0]] === "undefined") {
            query_string[pair[0]] = decodeURIComponent(pair[1]);
            // If second entry with this name
        } else if (typeof query_string[pair[0]] === "string") {
            var arr = [query_string[pair[0]], decodeURIComponent(pair[1])];
            query_string[pair[0]] = arr;
            // If third or later entry with this name
        } else {
            query_string[pair[0]].push(decodeURIComponent(pair[1]));
        }
    }
    return query_string;
}();


$(document).ready(function (sender, args) { //jquery
    //the static things we need
    View = new View();
    mf = new mfDiagram(); //awesome Mindfusion !!
    // myMicrocontroller created above
    // myController created above
    myMicrocontrollerNode = new MicrocontrollerNode(myMicrocontroller)
    
    // the above items are  more or less blank static objects

    //if no diagram is loaded then they are fully created below by main_loadDefaultMicro

    //when loading diagrams however we need to repopulate  
    //myMicrocontroller and myMicrocontrollerNode and MyCodemaker
    
    View.InitLayout();       //sets up the window
    if (debug)
        View.InitDebug();
    main_initEditors();     //sets up ACE codeEditor
    mf.init();              //creates diagram and drop downs
    welcomeMessage()

    var textarea = document.getElementById("textarea");
    textarea.value = QueryString.diagram + QueryString.message


    
    //if (browser.accessName === "msie") {
    //    //load cjs.js
    //} else {
    //    var j = document.createElement('script');
    //    j.type = 'text/javascript';
    //    j.src = 'CJS.js';
    //    document.getElementsByTagName('head')[0].appendChild(j);
    //}

    var path = "";
    if (QueryString.message !== undefined)
        View.Message(QueryString.message)
    if (QueryString.path !== undefined)
        path=QueryString.subdir
    if (QueryString.diagram !== undefined)
        try{
            waitForFiles()
            //mf.openDiagramViaParam(QueryString.diagram)
            return;
        } catch (e) {
            var error = e;
        }
    //no file passed so just open this after a bit
    setTimeout(main_loadDefaultMicro, 1000);

});

function welcomeMessage() {
    View.Message("System Designer JS version:"+version,"purple")
}

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
    codeEditor.setAnimatedScroll(true);
    //codeEditor.renderer.setShowGutter(true);
    //codeEditor.renderer.setShowPrintMargin(false);
    //codeEditor.getSession().setUseSoftTabs(false);
    //codeEditor.setHighlightSelectedWord(true);
    //codeEditor.setHighlightActiveLine(false); //default=true
    codeEditor.on("change", function (e) {
        if (codeEditor.curOp && codeEditor.curOp.command.name) {
            if (myController.parserstate !== myController.PARSERSTATE.STOP)
                myController.Stop()
            View.Message("Editting","blue")
        }
        //else
        //    console.log("other change")
    })
    //tokenEditor = ace.edit("tokeneditor");
    //tokenEditor.setTheme("ace/theme/monokai");
    //tokenEditor.getSession().setMode("ace/mode/text");

    //aceEditor = ace.edit("aceEditor");
    //aceEditor.setTheme("ace/theme/monokai");
    //aceEditor.getSession().setMode("ace/mode/text");
}

function main_loadDefaultMicro() {
    myMicrocontroller.setupMicro("xplained(ATmega328P)")
    myMicrocontrollerNode.setNewMicro(myMicrocontroller);
    myCodeMaker = new CodeMaker(myMicrocontrollerNode.Node); //could change to set newNode
    var code = myCodeMaker.makeFullCode(); 
    View.DisplayCode(code);
    updateRegistersDisplay();
}

function waitForFiles() {
    if (microsloaded === true && packagesloaded===true && analoginputsloaded ===true && binaryinputsloaded) {
        //alert(microsloaded)
        mf.openDiagramViaParam(QueryString.diagram)
        return
    }
    //alert(microsloaded)
    window.setTimeout(waitForFiles, 500)
}


