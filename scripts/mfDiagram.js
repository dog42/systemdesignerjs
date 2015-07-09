"use strict";
var mfDiagram = function () {
    this.packages = [];//all the different packages
    this.binInputs = [];
    this.micros = [];
    this.anInputs = [];
    this.microsNodeList;
    this.ioNodeList;
    this.zoomer;
    this.microsjson = [];
    this.packagesjson = [];
    this.binaryInputsJSON = [];
}
//initialise diagram, event listeners, nodelists, open files
mfDiagram.prototype.init = function() {
    // create a Diagram component that wraps the "diagram" canvas
    diagram = Diagram.create($("#diagram")[0]);
    diagram.setLinkHeadShapeSize(2);
    diagram.setDefaultShape("Rectangle");
    diagram.setBackBrush("#E0E0E0");
    diagram.setRouteLinks(true);
    diagram.setRoundedLinks(true);
    diagram.setAllowInplaceEdit(true);
    diagram.setAllowUnconnectedLinks(false);
    //diagram.setShowGrid(true);
    diagram.setBehavior(MindFusion.Diagramming.Behavior.DrawLinks);// | MindFusion.Diagramming.Behavior.Modify);

    diagram.addEventListener(Events.nodeCreated, this.onNodeCreated);
    diagram.addEventListener(Events.nodeTextEdited, this.onNodeTextEdited);
    diagram.addEventListener(Events.linkCreated, this.onLinkCreated);
    diagram.addEventListener(Events.linkModified, this.onLinkModified);
    diagram.addEventListener(Events.linkDeleted, this.onLinkDeleted);
    diagram.addEventListener(Events.nodeClicked, this.onNodeClicked);
    diagram.addEventListener(Events.nodeDeleting, this.onNodeDeleting);
    //diagram.addEventListener(Events.nodePointed, this.onNodePointed);
    //diagram.addEventListener(Events.nodeDoubleClicked, this.onNodeDoubleClicked);


    // create a NodeListView component that wraps the "nodeList" canvas
    this.ioNodeList = MindFusion.Diagramming.NodeListView.create($("#ioNodeList")[0]);
    this.ioNodeList.setTargetView($("diagram")[0]);

    // create a NodeListView component that wraps the "nodeList" canvas
    this.microsNodeList = NodeListView.create($("#microsNodeList")[0]);
    this.microsNodeList.setTargetView($("diagram")[0]);

    // create an Overview component that wraps the "overview" canvas
    //overview = MindFusion.Diagramming.Overview.create($("#overview")[0]);
    //overview.setDiagram(diagram);

    //create an ZoomControl component that wraps the "zoomer" canvas
    //zoomer = MindFusion.Controls.ZoomControl.create($("#zoomer")[0]);
    //zoomer.setTarget(diagram);    // register event handlers

    //OPEN microcontrollers json file
    this.openPackagesFile();
    this.openMicrosFile();
    this.openBinaryInputsFile();
}

//File IO
mfDiagram.prototype.openPackagesFile = function () {
    var self = this;
    $.getJSON('json/avr8_packagedetails.json', function (d) {
        self.packagesjson = d;
    }).
    success(function () {
        //packagesLoaded = true;
        self.packages = self.packagesjson.packs.packages;
   }).
    complete(function () {
        //alert("complete");
    }).
    error(function (jqXHR, textStatus, errorThrown) {
        alert('error ' + textStatus + ' ' + errorThrown);
    });
}
mfDiagram.prototype.openMicrosFile = function () {
    var self = this; //because context for 'this' changes within the callback
    $.getJSON('json/avr8_micro.json', function (d) {
        self.microsjson = d;
    }).
    success(function () {
        //microsLoaded = true;
        self.micros = self.microsjson.microcontrollers.micros;
        //self.microPartsPackages.length = 0;
        //var length = microsjson.micros.micro.length; //number of diff micros
        //for (var i = 0; i < length; i++) {
        //    self.microPartsPackages.push({
        //        partnumber: microsjson.micros.micro[i].partnumber,
        //        packname: packagesjson.packages.package[i].packname
        //    });
        //}
        self.initMicrosNodeList();
    }).
    complete(function () {
        //alert("complete");
    }).
    error(function (jqXHR, textStatus, errorThrown) {
        alert('error ' + textStatus + ' ' + errorThrown);
    });
}
mfDiagram.prototype.openBinaryInputsFile = function () {
    var self = this; //because context for 'this' changes within the callback
    $.getJSON('json/binaryinputs.json', function (d) {
        self.binaryInputsJSON = d;
    }).
    success(function () {
        self.binInputs = self.binaryInputsJSON.binaryinputs.inputs;
        self.initIONodeList();
    }).
    complete(function () {
        //alert("complete");
    }).
    error(function (jqXHR, textStatus, errorThrown) {
        alert('error ' + textStatus + ' ' + errorThrown);
    });

}

//initialise the nodelists
mfDiagram.prototype.initMicrosNodeList = function () {
    //make nodelist out of micros[] to display
    var i;
    for (i = 0; i < this.micros.length; i++) {
        var node = new ShapeNode(diagram);
        var pn = this.micros[i].partnumber;
        var pt = pn.indexOf('(') > -1 ? pn.indexOf('(') : pn.length - 1 //get rid of any ()
        pn = pn.substring(0, pt+1);
        node.setText(pn);
        node.setId("micro") //same as in SysDes
        node.setImageLocation("images/_img_micro_dip8.png");
        //node.setImageLocation("images/_img_micro_" + microsPartNumbersArr[i].packname + ".png");
        node.setShape("Rectangle");
        //node.setBrush("Red");
        node.setTextAlignment(Alignment.Center);
        node.setLineAlignment(Alignment.Center);
        this.microsNodeList.addNode(node, pn);
    }
}
mfDiagram.prototype.initIONodeList = function() {
    // add an LED
    var node = new SvgNode(diagram);
    node.setText("led_");
    node.setId("led") //same as in SysDes
    var svg = new SvgContent();
    svg.parse("images/_img_output_led.svg");
    node.setContent(svg);
    node.setShape("Rectangle");
    node.setAllowOutgoingLinks(false);
    //node.setBrush("Red");
    node.setTextAlignment(Alignment.Center);
    node.setLineAlignment(Alignment.Far);
    this.ioNodeList.addNode(node, "LED");

    //add the binary input devices
    for (var i = 0; i < this.binInputs.length; i++) {
        node = new SvgNode(diagram);
        node.setText(this.binInputs[i].text);
        node.setAllowIncomingLinks(false); //default for binaryinputs
        node.setId(this.binInputs[i].type);
        var svg = new SvgContent();
        svg.parse("images/" + this.binInputs[i].image);
        node.setContent(svg);
        node.setShape("Rectangle");
        node.setTextAlignment(Alignment.Center); //center of line
        node.setLineAlignment(Alignment.Far); //bottom line
        this.ioNodeList.addNode(node, this.binInputs[i].name); //use 'name' from XML file
    }    
    

    node = new ShapeNode(diagram);
    node.setText("LM35_"); //use 'text' from XML file
    node.setAllowIncomingLinks(false); //default for binaryinputs
    node.setId("lm35_analog__"); //use 'type' in XML file
    node.setImageLocation("images/_img_input_analog_lm35.jpg"); //'use 'image' from XML file
    node.setShape("Rectangle");
    node.setTextAlignment(Alignment.Center); //center of line
    node.setLineAlignment(Alignment.Far); //bottom line
    this.ioNodeList.addNode(node, "LM35"); //use 'name' from XML file
}

//diagram helpers
mfDiagram.prototype.getNodeById = function (id) {
    var arr = diagram.getNodes();
    for (var i = 0; i < arr.length; i++) {
        if (arr[i].getId() === id)
            return arr[i];
    }
    return false;
}
mfDiagram.prototype.createAnchorPoint = function (x, y, inok, outok, style, col, size, tag) {
    var ap = new AnchorPoint(x, y, inok, outok, style, col, size, tag);
    ap.setTag(tag);
    return ap;
}
mfDiagram.prototype.getMicroAnchorTag = function (link) {
    //returns e.g. C.3, no matter whether incoming or outgoing link
    if (myMicrocontrollerNode.Node === null)
        return;
    var apt;
    if (link.getDestination().getId() === "micro") {
        apt = link.getDestinationAnchor();
    }
    if (link.getOrigin().getId() === "micro") //from micro
    {
        apt = link.getOriginAnchor();
    }
    var pts = myMicrocontrollerNode.Node.getAnchorPattern().getPoints();
    var c = pts[apt].getTag();
    return c;
}
mfDiagram.prototype.getMicroPort = function (link, toMicro, chr) {
    //this will return 1 character from the anchor tag
    //chr=0 then it returns the letter for the port, 2 returns the pin (0..7)
    if (myMicrocontrollerNode.Node === null)
        return;
    var n;
    if (toMicro) {
        n = link.getDestinationAnchor();
    }
    else //from micro
    {
        n = link.getOriginAnchor();
    }
    var pts = myMicrocontrollerNode.Node.getAnchorPattern().getPoints();
    var c = pts[n].getTag().substring(chr, chr + 1);
    return c;
}
mfDiagram.prototype.updateOutput = function (portname, pin, level) {
    //change the color of the node and link of 1 output
    //var apts = myMicrocontrollerNode.microAnchorPattern.getPoints();
    var io = portname.charAt(4) + "." + pin;   //e.g. B3
    var olinks = myMicrocontrollerNode.Node.getOutgoingLinks();
    for (var i = 0; i < olinks.length; i++) {
        var t = olinks[i].getTag()
        if (t === io) {
            //recolor link and node
            if (level === 0) {
                olinks[0].setText('0')
                olinks[0].setTextColor(black)
                olinks[i].setStroke(black)
                olinks[i].getDestination().setBrush(white)
            } else {
                olinks[0].setText('1')
                olinks[0].setTextColor(red)
                olinks[i].setStroke(red)
                olinks[i].getDestination().setBrush(red)
            }
        }
    }


}
mfDiagram.prototype.binaryInputClicked = function (node) {
    var olinks = node.getOutgoingLinks();
    if (olinks.length > 0) {
        var dest = olinks[0].getDestinationAnchor();
        var portLetter = mf.getMicroPort(olinks[0], true, 0)
        var pin = mf.getMicroPort(olinks[0], true, 2)
        if (olinks[0].getText() === "1") {
            olinks[0].setText('0')
            olinks[0].setTextColor(black)
            olinks[0].setStroke(black)
            myController.writeRegBit("PIN" + portLetter, pin, 0)
        } else {
            olinks[0].setText('1')
            olinks[0].setTextColor(red)
            olinks[0].setStroke(red)
            myController.writeRegBit("PIN" + portLetter, pin, 1)
        }
    }
}
mfDiagram.prototype.analogInputClicked = function (node) {
    var olinks = node.getOutgoingLinks();
    if (olinks.length > 0) {
        var dest = olinks[0].getDestinationAnchor();
        var portLetter = mf.getMicroPort(olinks[0], true, 0)
        var pin = mf.getMicroPort(olinks[0], true, 2)
        //do more stuff here to manage analog value change
    }
}
//mfDiagram.prototype.updateOutputs = function(){
    //update all regs 
//}
//mfDiagram.prototype.readInputs = function () {
    //reads the state of all input pins connected to the micro and updates the register values
    //needed? as the diagram updates these automatically
//}

//Diagram Event Processing
mfDiagram.prototype.onLinkCreated = function (sender, args) {
    myMicrocontrollerNode.makeLinkTag(args.link)
    myCodeMaker.nodeChange();
    View.DisplayCode();
    //var link = args.getLink();
}
mfDiagram.prototype.onLinkModified = function (sender, args) {
    myMicrocontrollerNode.makeLinkTag(args.link)
    myCodeMaker.nodeChange();
    View.DisplayCode();
    //var link = args.getLink();
}
mfDiagram.prototype.onLinkDeleted = function (sender, args) {
    //redo code
    myCodeMaker.nodeChange();
    View.DisplayCode();
}
mfDiagram.prototype.onNodeTextEdited = function (sender, args) {
    //make sure no spaces in text
    myCodeMaker.nodeChange();
    View.DisplayCode();
}
mfDiagram.prototype.onNodeDoubleClicked = function (sender, args) {
    //binary node - change state
    //analog node - popup slider
    var newnode = args.getNode();
}
mfDiagram.prototype.onNodeClicked = function (sender, args) {
    //binary node - change state
    //analog node - popup slider
    var node = args.getNode();
    if (myController !== null ){//&& myController.parserstate != myController.PARSERSTATE.STOP  ) {
        if (node.getId().indexOf("_binary")){
            mf.binaryInputClicked(node)
        }
        if (node.getId().indexOf("_analog")){
            mf.analogInputClicked(node);
        }
    }
}
mfDiagram.prototype.onNodeCreated = function (sender, args) {
    //called when a node is dropped on the diagram
    var newnode = args.getNode();
    if (newnode.getId() === "micro") {
        if (myMicrocontrollerNode.Node != null || myMicrocontrollerNode.Node != undefined) {
            var deleteMicro = confirm("There can only be one micro in the diagram");
            diagram.removeItem(newnode);
            return;
        }
        //diagram.clearAll(); //dont clear all - just remove micro
        if (myMicrocontrollerNode.Node !== null && mf.getNodeById(myMicrocontrollerNode.Node.getId())) {
            diagram.removeItem(myMicrocontrollerNode.Node);
        }
        var partnum = newnode.getText();
        diagram.removeItem(newnode);//dont want this node create our own
        myMicrocontroller.makeMicro(partnum);
        myMicrocontrollerNode = new MicrocontrollerNode(myMicrocontroller);//make a diagram node for the micro
        myCodeMaker = new CodeMaker(myMicrocontrollerNode.Node);
        updateRegistersDisplay();
        return;
    }
    if (newnode.getId() === "led") {
        var x=newnode.bounds.x
        var y = newnode.bounds.y
        diagram.removeItem(newnode);
        newnode = mf.makeLED(x, y)
    }

    //number the new node in sequence by its type
    var count = 0;
    var nodes = diagram.getNodes();
    for (var i = 0; i < nodes.length; i++) {
        if (nodes[i].getId() === newnode.getId())
                    count++;
    }
    newnode.setText(newnode.getText() + count);
}
mfDiagram.prototype.onNodeDeleting = function (sender, args) {
    var node = args.getNode();
    if (node.getId() === "micro") {
        var deleteMicro = false;
        if (myMicrocontrollerNode.Node != null)
            deleteMicro = confirm("This will remove the micro and all links");
        if (deleteMicro === false) {
            args.setCancel(true);
            return;
        }
    }
    //diagram.removeItem(myMicrocontrollerNode.Node)
    //myMicrocontrollerNode.Node = null;//??
    return;
}

//make the IO components
mfDiagram.prototype.makeLED = function (x,y) {
    var led = diagram.getFactory().createSvgNode(new Rect(x, y, 20, 10));  
    led.setId("led") //same as in SysDes
    var svg = new SvgContent();
    svg.parse("images/_img_output_led.svg");
    led.setContent(svg);
    led.setBrush("Red");
    led.setShape("Rectangle");
    led.setAllowOutgoingLinks(false);
    var ap = mf.createAnchorPoint(0, 35, true, false, MarkStyle.Rectangle, blue, 2, "led")
    var pat = new AnchorPattern([ap]);
    led.setAnchorPattern(pat);
    led.setText("led_");
    led.setTextAlignment(Alignment.Center);
    led.setLineAlignment(Alignment.Far);
    return led;
}
mfDiagram.prototype.makeBinInput = function (x, y, type) {
    var json = binaryInputsJSON;
    //look up type in json
    var length = this.binaryInputsJSON;
    var binInput = diagram.getFactory().createSvgNode(new Rect(x, y, 20, 20));
    binInput.setId(id)
}

//unused
mfDiagram.prototype.onNodePointed = function (sender, args) {
    //mouse over - see state?
    var node = args.getNode();
}

