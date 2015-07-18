"use strict";
var mfDiagram = function () {
    this.packages = [];//all the different packages
    this.binInputs = [];
    this.anaInputDevices = [];
    this.micros = [];
    this.anInputs = [];
    this.microsNodeList;
    this.ioNodeList;
    this.zoomer;
    this.microsjson = [];
    this.packagesjson = [];
    this.binaryInputsJSON = [];
    this.analogInputsJSON = [];
    this.fileJSON;
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
    diagram.addEventListener(Events.linkDoubleClicked, this.onLinkDoubleClicked);
    diagram.addEventListener(Events.linkModifying, this.onLinkModifying);
    diagram.addEventListener(Events.linkDeleting, this.onLinkDeleting);
    diagram.addEventListener(Events.nodeClicked, this.onNodeClicked);
    diagram.addEventListener(Events.nodeDeleted, this.onNodeDeleted);
    diagram.addEventListener(Events.nodeDeleting, this.onNodeDeleting);
    //diagram.addEventListener(Events.nodePointed, this.onNodePointed);
    //diagram.addEventListener(Events.nodeDoubleClicked, this.onNodeDoubleClicked);


    // create a NodeListView component that wraps the "nodeList" canvas
    this.ioNodeList = MindFusion.Diagramming.NodeListView.create($("#ioNodeList")[0]);
    this.ioNodeList.setTargetView($("diagram")[0]);

    // create a NodeListView component that wraps the "nodeList" canvas
    //this.microsNodeList = NodeListView.create($("#microsNodeList")[0]);
    //this.microsNodeList.setTargetView($("diagram")[0]);

    // create an Overview component that wraps the "overview" canvas
    //overview = MindFusion.Diagramming.Overview.create($("#overview")[0]);
    //overview.setDiagram(diagram);

    //create an ZoomControl component that wraps the "zoomer" canvas
    zoomer = MindFusion.Controls.ZoomControl.create($("#zoomer")[0]);
    zoomer.setTarget(diagram);    // register event handlers


    this.initIONodeList();//adds just the LED
    this.openMicrosFile();
    this.openPackagesFile();
    this.openBinaryInputsFile();
    this.openAnalogInputsFile();
}

//File IO

mfDiagram.prototype.openPackagesFile = function () {
    var self = this;
    var pkg = 'json/avr8_packagedetails.json'
    $.getJSON(pkg, function (d) {
        self.packagesjson = d;
    }).
    success(function () {
        //packagesLoaded = true;
        self.packages = self.packagesjson.packs.packages;
        packagesloaded = true;
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
        //alert("success");//microsLoaded = true;
        self.micros = self.microsjson.microcontrollers.micros;
        //self.microPartsPackages.length = 0;
        //var length = microsjson.micros.micro.length; //number of diff micros
        //for (var i = 0; i < length; i++) {
        //    self.microPartsPackages.push({
        //        partnumber: microsjson.micros.micro[i].partnumber,
        //        packname: packagesjson.packages.package[i].packname
        //    });
            //}
        self.initMicros()
            //setTimeout(self.initMicros,1000);
        microsloaded = true;
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
        var node;
        //add the binary input devices
        for (var i = 0; i < self.binInputs.length; i++) {
            node = new SvgNode(diagram);
            node.setText(self.binInputs[i].text);
            node.setAllowIncomingLinks(false); //default for binaryinputs
            node.setId(self.binInputs[i].type);
            var svg = new SvgContent();
            svg.parse("images/" + self.binInputs[i].image);
            node.setContent(svg);
            node.setShape("Rectangle");
            node.setTextAlignment(Alignment.Center); //center of line
            node.setLineAlignment(Alignment.Far); //bottom line
            self.ioNodeList.addNode(node, self.binInputs[i].name); //use 'name' from XML file
        }
        binaryinputsloaded = true;
    }).
    complete(function () {
        //alert("complete");
    }).
    error(function (jqXHR, textStatus, errorThrown) {
        alert('error ' + textStatus + ' ' + errorThrown);
    });

}
mfDiagram.prototype.openAnalogInputsFile = function () {
    var self = this; //because context for 'this' changes within the callback
    $.getJSON('json/analoginputs.json', function (d) {
        self.analogInputsJSON = d;
    }).
    success(function () {
        self.anaInputDevices = self.analogInputsJSON.analoginputs.inputs;
        var node;
        //add the analog input devices
        for (var i = 0; i < self.anaInputDevices.length; i++) {
            node = new SvgNode(diagram);
            node.setText(self.anaInputDevices[i].text);
            node.setAllowIncomingLinks(false); //default for analoginputs
            node.setId(self.anaInputDevices[i].type);
            var svg = new SvgContent();
            svg.parse("images/" + self.anaInputDevices[i].image);
            node.setContent(svg);
            node.setImageAlign(ImageAlign.Fit)
            node.setShape("Rectangle");
            node.setTextAlignment(Alignment.Center); //center of line
            node.setLineAlignment(Alignment.Far); //bottom line
            //self.ioNodeList.addNode(node, self.anaInputDevices[i].name); //use 'name' from XML file
        }
        analoginputsloaded = true;
    }).
    complete(function () {
        //alert("complete");
    }).
    error(function (jqXHR, textStatus, errorThrown) {
        alert('error ' + textStatus + ' ' + errorThrown);
    });

}

//initialise the nodelists
mfDiagram.prototype.initMicros = function () {
    //make nodelist out of micros[] to display
    var i;
    for (i = 0; i < mf.micros.length; i++) {
        var node = new ShapeNode(diagram);
        var pn = mf.micros[i].partnumber;
        var pt = pn.indexOf('(') > -1 ? pn.indexOf('(') : pn.length - 1 //get rid of any ()
        pn = pn.substring(0, pt+1);
        node.setText(pn);
        node.setId("micro") 
        node.setImageLocation("images/_img_micro_dip8.png");
        //node.setImageLocation("images/_img_micro_" + microsPartNumbersArr[i].packname + ".png");
        node.setShape("Rectangle");
        node.setTextAlignment(Alignment.Center);
        node.setLineAlignment(Alignment.Center);
        mf.ioNodeList.addNode(node, pn);
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
    node.setBrush(red);
    node.setTextAlignment(Alignment.Center);
    node.setLineAlignment(Alignment.Far);
    this.ioNodeList.addNode(node, "LED");

    //analog
    //node = new ShapeNode(diagram);
    //node.setText("LM35_"); //use 'text' from XML file
    //node.setAllowIncomingLinks(false); //default for binaryinputs
    //node.setId("lm35_analog__"); //use 'type' in XML file
    //node.setImageLocation("images/_img_input_analog_lm35.jpg"); //'use 'image' from XML file
    //node.setShape("Rectangle");
    //node.setTextAlignment(Alignment.Center); //center of line
    //node.setLineAlignment(Alignment.Far); //bottom line
    //this.ioNodeList.addNode(node, "LM35"); //use 'name' from XML file
}

//diagram helpers
mfDiagram.prototype.getNodeById = function (id) {
    var arr = diagram.getNodes();
    //search all nodes for eact match
    for (var i = 0; i < arr.length; i++) {
        if (arr[i].getId() === id)
            return arr[i];
    }
    //now search for micro node
    if (id==="micro")
        for (var i = 0; i < arr.length; i++) {
            if (arr[i].getId().indexOf("micro-")>-1)
                return arr[i];
        }
    return false;
}
mfDiagram.prototype.createAnchorPoint = function (x, y, inok, outok, style, col, size, tag) {
    var ap = new AnchorPoint(x, y, inok, outok, style, col, size, tag);
    ap.setTag(tag);
    return ap;
}
mfDiagram.prototype.updateOutput = function (portname, pin, level) {
    //when a port register bit has changed thisfunc is called
    //change the color of the node and link of 1 output
    //var apts = myMicrocontrollerNode.microAnchorPattern.getPoints();
    var io = portname.charAt(4) + "." + pin;   //e.g. B3
    var olinks = myMicrocontrollerNode.Node.getOutgoingLinks();
    for (var i = 0; i < olinks.length; i++) {
        var t = olinks[i].getTag()
        if (t === io) {
            //recolor link and node
            if (level === 0) {
                mf.setLinkColorText(olinks[i], 0, 0)
                //olinks[i].setText('0')
                //olinks[i].setTextColor(black)
                //olinks[i].setStroke(black)
                olinks[i].getDestination().setBrush(white)
            } else {
                mf.setLinkColorText(olinks[i], 5, 1)
                //olinks[i].setText('1')
                //olinks[i].setTextColor(red)
                //olinks[i].setStroke(red)
                var col = olinks[i].getDestination().getTag();
                olinks[i].getDestination().setBrush(col) //some color depending upon the node preset
            }
        }
    }
}
mfDiagram.prototype.binaryInputClicked = function (node,portpin) {
    var olinks = node.getOutgoingLinks();
    if (olinks.length > 0) {
        //var dest = olinks[0].getDestination Anchor();//after opening a saved file this is returning the wrong link until the linkis moved and them updated
        //var portLetter = mf.getMicro Port(olinks[0], true, 0)
        //var pin = mf.getMicro Port(olinks[0], true, 2)
        var val;
        var text;
        if (olinks[0].getText() === "1") {
            val = 0;
            text = "0";
            myController.writeRegBit("PIN" + portpin.charAt(0), portpin.charAt(2), 0)
        } else {
            val = 5;
            text="1"
            myController.writeRegBit("PIN" + portpin.charAt(0), portpin.charAt(2), 1)
        }
        this.setLinkColorText(olinks[0],val,text)
    }
}
mfDiagram.prototype.setLinkColorText = function (link, value, text) {
    //value will be number from 0 to 5.0
    link.setText(text);
    var black = { r: 0, g: 0, b: 0 };
    var red = { r: 255, g: 0, b: 0 };
    var newColor = this.makeGradientColor(black, red, value * 20);
    link.setStroke(newColor.cssColor)
    link.setTextColor(newColor.cssColor)
}
mfDiagram.prototype.makeGradientColor = function (color1, color2, percent) {
    var newColor = {};

    function makeChannel(a, b) {
        return (a + Math.round((b - a) * (percent / 100)));
    }

    function makeColorPiece(num) {
        num = Math.min(num, 255);   // not more than 255
        num = Math.max(num, 0);     // not less than 0
        var str = num.toString(16);
        if (str.length < 2) {
            str = "0" + str;
        }
        return (str);
    }

    newColor.r = makeChannel(color1.r, color2.r);
    newColor.g = makeChannel(color1.g, color2.g);
    newColor.b = makeChannel(color1.b, color2.b);
    newColor.cssColor = "#" +
                        makeColorPiece(newColor.r) +
                        makeColorPiece(newColor.g) +
                        makeColorPiece(newColor.b);
    return (newColor);
}
mfDiagram.prototype.analogInputClicked = function (node,portpin) {
    var olinks = node.getOutgoingLinks();
    if (olinks.length > 0) {//if link to micro exists
        //var dest = olinks[0].getDestination Anchor();
        //var portLetter = mf.getMicro Port(olinks[0], true, 0)
        //var pin = mf.getMicro Port(olinks[0], true, 2)
       // var port = portLetter+"."+pin;
        //open or show this adc window if an adc pin
        for (var ch = 0; ch < myMicrocontroller.adcPins.length; ch++){
            if (myMicrocontroller.adcPins[ch]===portpin){
                View.showAdcWindow(ch, node)
            }
        }
        //do more stuff here to manage analog value change
    }
}

mfDiagram.prototype.readInputs = function () {
    //when diagram created, loaded or run
    var ilinks = myMicrocontrollerNode.ilinks;
    //reads the state of all input pins connected to the micro and updates the register values
    var portpin;
    for (var i = 0; i < ilinks.length; i++) {
        portpin = ilinks[i].getTag();
        //var anchor = ilinks[i].getDestination Anchor();
        //var portLetter = mf.getMicro Port(ilinks[i], true, 0)
        //var pin = mf.getMicro Port(ilinks[i], true, 2)
        if (ilinks[i].getText() === "1") {
            myController.writeRegBit("PIN" + portpin.charAt(0), portpin.charAt(2), 1)
        } else {
            myController.writeRegBit("PIN" + portpin.charAt(0), portpin.charAt(2), 0)
        }
    }
}
mfDiagram.prototype.setOutputsOff = function () {
    //reads the state of all input pins connected to the micro and updates the register values
    var olinks = myMicrocontrollerNode.olinks;
    var portpin;
    for (var i = 0; i < olinks.length; i++) {
        portpin = olinks[i].getTag();
        //var portLetter = mf.getMicro Port(olinks[i], false, 0)
        //var pin = mf.getMicro Port(olinks[i], false, 2)
        mf.setLinkColorText(olinks[i],0,0)//needs testing here on running
        //olinks[i].setText('0')
        //olinks[i].setTextColor(black)
        //olinks[i].setStroke(black)
    }
}

//Diagram Event Processing
mfDiagram.prototype.updateView = function () {
    myController.Stop();
    var code= myCodeMaker.nodeChange();
    View.DisplayCode(code);
}
mfDiagram.prototype.onLinkCreated = function (sender, args) {
    myMicrocontrollerNode.makeLinkTag(args.link)
    mf.updateView();
    var tag = args.link.getTag();
    if (args.link.getDestination().getId()==="led") {
        mf.setLinkColorText(args.link, 0, 0)
    }
    if (args.link.getOrigin().getId().indexOf("_binary_") > -1) {
        mf.setLinkColorText(args.link, 5, '1')
        myController.writeRegBit("PIN" + tag.charAt(0), tag.charAt(2), 1)
    }
}
mfDiagram.prototype.onLinkDoubleClicked = function (sender, args) {
    alert(args.link.getTag())
}
mfDiagram.prototype.onLinkModified = function (sender, args) {
    myMicrocontrollerNode.makeLinkTag(args.link)
    mf.updateView();
}
mfDiagram.prototype.onLinkModifying = function (sender, args) {
    myMicrocontrollerNode.makeLinkTag(args.link)
    mf.updateView();
    if (args.link.getOrigin().getId().indexOf("_analog") > -1) {//adc input
        //var adcChannel = mf.getMicro Port(args.link, true, 2)//wrong
        var tag = args.link.getTag();
        var adcChannel = myMicrocontroller.getAdcChannel(tag)
        View.closeAdcWindow(adcChannel)
    }
}
mfDiagram.prototype.onLinkDeleted = function (sender, args) {
    //redo code
    mf.updateView();
}
mfDiagram.prototype.onLinkDeleting = function (sender, args) {
    if (args.link.getOrigin().getId().indexOf("_analog") > -1) {//adc input
        //var adcChannel = mf.getMicro Port(args.link, true, 2)//wrong
        var tag = args.link.getTag();
        var adcChannel = myMicrocontroller.getAdcChannel(tag)
        View.closeAdcWindow(adcChannel)
    }
}
mfDiagram.prototype.onNodeTextEdited = function (sender, args) {
    //make sure no spaces in text
    var code = myCodeMaker.nodeChange();
    View.DisplayCode(code);
}
mfDiagram.prototype.onNodeDoubleClicked = function (sender, args) {
    //binary node - change state
    //analog node - popup slider
    var newnode = args.getNode();
}
mfDiagram.prototype.onNodeClicked = function (sender, args) {
    currentNode = args.getNode();
    var olinks = currentNode.getOutgoingLinks()
    var ilinks = currentNode.getIncomingLinks();
    if (olinks.length === 0 && ilinks.length === 0)
        return;
    if (args.mouseButton === 0){//left button
        if (myController !== null ){//&& myController.parserstate != myController.PARSERSTATE.STOP  ) {
            if (currentNode.getId().indexOf("_binary") > -1) {
                var portpin = olinks[0].getTag();
                mf.binaryInputClicked(currentNode, portpin)//binary node - change state
            }
            if (currentNode.getId().indexOf("_analog") > -1) {
                var portpin = olinks[0].getTag();
                mf.analogInputClicked(currentNode, portpin);//analog node - popup slider
            }
        }
    }
    else if (args.mouseButton === 2) {//rightbutton
        if (currentNode.getId() === "led") {
            var pt = new MindFusion.Drawing.Point;
            pt.x = args.mousePosition.x;
            pt.y = args.mousePosition.y;
            //var scrollX = diagram.getScrollX(); //doesnt do anything //??
            //var scrollY = diagram.getScrollY(); //doesnt do anything //??
            //var p = diagram.docToClient(pt)
            var splitoffset = $("#splitterWest").jqxSplitter('panels')[0].size
            //var scrollTop = $(window).scrollTop();
            //var scrollLeft = $(window).scrollLeft();
            //View.nodeContextMenu.jqxMenu('open', p.x + splitoffset + 20, p.y + 10);
            View.nodeContextMenu.jqxMenu('open', splitoffset + 50, 200); //just a fixed position for the moment
            return false;
        }
    }
}
mfDiagram.prototype.onNodeCreated = function (sender, args) {
    //called when a node is dropped on the diagram
    var newnode = args.getNode();
    if (newnode.getId().indexOf("micro-") > -1) {
        if (myMicrocontrollerNode !== undefined)
            if( myMicrocontrollerNode.Node != null || myMicrocontrollerNode.Node != undefined) {
                var deleteMicro = confirm("There can only be one micro in the diagram");
                diagram.removeItem(newnode);
                return;
            }
        //diagram.clearAll(); //dont clear all - just remove micro
        try {diagram.removeItem(myMicrocontrollerNode.Node)}
        catch (e) {
            var error = e;
        }
        //if (myMicrocontrollerNode.Node !== null && mf.getNodeById(myMicrocontrollerNode.Node.getId())) {
        //    diagram.removeItem(myMicrocontrollerNode.Node);
        //}
        var newpartnum = newnode.getText();
        diagram.removeItem(newnode);//dont want the dropped node, create our own
        myMicrocontroller.setupMicro(newpartnum);
        myMicrocontrollerNode.setNewMicro(myMicrocontroller);//make a diagram node for the micro
        myCodeMaker = new CodeMaker(myMicrocontrollerNode.Node);
        var code = myCodeMaker.makeFullCode();
        View.DisplayCode(code);
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
    if (node.getId().indexOf("micro-") > -1) {
        var deleteMicro = false;
        if (myMicrocontrollerNode.Node != null)
            deleteMicro = confirm("This will remove the micro and all links");
        if (deleteMicro === false) {
            args.setCancel(true);
            return;
        }
        myMicrocontrollerNode.Node = null; //best way to handle this??
        //diagram.removeItem(myMicrocontrollerNode.Node)
        diagram.removeItem(myMicrocontrollerNode.codeNode)
    }
    //diagram.removeItem(myMicrocontrollerNode.Node)//dont remove ??
    return;
}
mfDiagram.prototype.onNodeDeleted = function (sender, args) {
    var node = args.getNode();
    if (node.getId().indexOf("micro-") > -1) {
        if (myCodeMaker !== undefined){
            View.DisplayCode("");
        }
    }
    //diagram.removeItem(myMicrocontrollerNode.Node)//dont remove ??
    return;
}

//ADC
mfDiagram.prototype.displayAdcVoltage = function (voltage, adcChannel,maxvoltage) {
    var portpin = myMicrocontroller.adcPins[adcChannel];
    //var olink = node.getOutgoingLinks()[0];
    //get the link on this portpin
    var links=diagram.getLinks();
    for (var l = 0; l < links.length; l++) {
        if (links[l].getTag() === portpin) {
            links[l].setText(voltage.toFixed(2))//disp voltage on link
        }
    }
    //o
    //var pin = mf.getMicro Port(olink,true,2)
    //get the channel, send to micro
    //var ch = myMicrocontroller.getAdcChannel(olink.getTag())
    //myMicrocontroller.newAdcValue(voltage,channel)
}


//make the IO components
mfDiagram.prototype.makeLED = function (x,y) {
    var led = diagram.getFactory().createSvgNode(new Rect(x, y, 20, 10));  
    led.setId("led") 
    var svg = new SvgContent();
    svg.parse("images/_img_output_led.svg");
    led.setContent(svg);
    led.setBrush(white);//where should we store color for its change
    led.setTag(red)
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

//Opening files 
mfDiagram.prototype.openDiagramViaParam = function (name) {
    //from html parameters
    var self = this;
    var file = name
    $.get(file, function (d) {
        self.fileJSON = d;
    }).
    success(function () {
        //packagesLoaded = true;
        //alert("success")
        //var decodeddata = opensave.Base64_decode(self.fileJSON)
        diagram.fromJson(self.fileJSON)
        
        mf.postFileOpenSetup()
    }).
    complete(function () {
        //alert("complete");
    }).
    error(function (jqXHR, textStatus, errorThrown) {
        alert('error ' + textStatus + ' ' + errorThrown);
    });
}
mfDiagram.prototype.openDiagramFromFile = function (buttonID) {
    //from the button
    var filename = buttonID.filename;
    var data = buttonID.data64
    var decodeddata = opensave.Base64_decode(data)
    diagram.fromJson(decodeddata)
    mf.postFileOpenSetup()
}
mfDiagram.prototype.postFileOpenSetup = function () {
    //common to opening files
    myController.Stop();
    //the diagram should have two nodes called - if no micro node exit //??
    var node = mf.getNodeById("micro")
    var codeNode = mf.getNodeById("codenode");
    //we need the partnumber of the micro
    var id = node.getId()
    var partnum = id.substring(6, id.length)
    
   // myMicrocontrollerNode.getPackageDetails();
   // node.setAnchorPattern(myMicrocontrollerNode.microAnchorPattern)
    myMicrocontrollerNode.Node = node;
    myMicrocontrollerNode.codeNode = codeNode
    //creates all blanks but we have existing code
    myCodeMaker = new CodeMaker(myMicrocontrollerNode.Node);
    myCodeMaker.updateFromSource(myMicrocontrollerNode.codeNode.getText())
    codeEditor.setValue(myMicrocontrollerNode.codeNode.getText());
    codeEditor.gotoLine(1);
    //alert("loaded")
    myMicrocontroller.setupMicro(partnum)
}
//Saving files
mfDiagram.prototype.saveDiagramFile = function (buttonID) {
    //var bi = opensave.getButtonInfo(buttonID)
    var retObj = new Object();
    retObj.filename = "myproject.txt";
    myMicrocontrollerNode.codeNode.setText(codeEditor.getValue())
    retObj.data = diagram.toJson()
    return retObj;
}
mfDiagram.prototype.saveCCodeToFile = function (buttonID) {
    //var bi = opensave.getButtonInfo(buttonID)
    var retObj = new Object();
    retObj.filename = "program.c";
    retObj.data = codeEditor.getValue();
    return retObj;
}

//unused
mfDiagram.prototype.onNodePointed = function (sender, args) {
    //mouse over - see state?
    var node = args.getNode();
}

