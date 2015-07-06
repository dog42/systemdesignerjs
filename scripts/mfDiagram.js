"use strict";
var mfDiagram = function () {
    this.microPartsPackages = [];//all the different microcontrollers and packages in the json

    this.microsNodeList;
    this.ioNodeList;
    this.zoomer;
}

mfDiagram.prototype.init = function() {
    // create a Diagram component that wraps the "diagram" canvas
    diagram = Diagram.create($("#diagram")[0]);
    diagram.setLinkHeadShapeSize(2);
    diagram.setDefaultShape("Rectangle");
    diagram.setBackBrush("#E0E0E0");
    diagram.setRouteLinks(true);
    diagram.setRoundedLinks(true);
    //diagram.setShowGrid(true);
    diagram.setBehavior(MindFusion.Diagramming.Behavior.DrawLinks);

    diagram.addEventListener(Events.nodeCreated, this.onNodeCreated);

    // create a NodeListView component that wraps the "nodeList" canvas
    this.ioNodeList = MindFusion.Diagramming.NodeListView.create($("#ioNodeList")[0]);
    this.ioNodeList.setTargetView($("diagram")[0]);
    this.initIONodeList();

    // create a NodeListView component that wraps the "nodeList" canvas
    this.microsNodeList = NodeListView.create($("#microsNodeList")[0]);
    this.microsNodeList.setTargetView($("diagram")[0]);

    // create an Overview component that wraps the "overview" canvas
    //overview = MindFusion.Diagramming.Overview.create($("#overview")[0]);
    //overview.setDiagram(diagram);

    //create an ZoomControl component that wraps the "zoomer" canvas
    this.zoomer = MindFusion.Controls.ZoomControl.create($("#zoomer")[0]);
    this.zoomer.setTarget(diagram);    // register event handlers

    //OPEN microcontrollers json file
    this.openPackagesFile();
    this.openMicrosFile();
}

mfDiagram.prototype.initIONodeList = function() {
    // add some nodes to the NodeListView
    var node = new ShapeNode(diagram);
    node.setText("led_");
    node.setId("led") //same as in SysDes
    node.setImageLocation("images/_img_output_led.png");
    node.setShape("Rectangle");
    node.setAllowOutgoingLinks(false);
    node.setBrush("Red");
    node.setTextAlignment(Alignment.Center);
    node.setLineAlignment(Alignment.Far);
    this.ioNodeList.addNode(node, "LED");

    node = new SvgNode(diagram);
    node.setText("tactSw_"); //use 'text' from XML file
    node.setAllowIncomingLinks(false); //default for binaryinputs
    node.setId("tact_binary__"); //use 'type' in XML file
    var svg = new SvgContent();
    svg.parse("images/_img_input_binary_tactswitch.svg");
    node.setContent(svg);
    node.setShape("Rectangle");
    node.setTextAlignment(Alignment.Center); //center of line
    node.setLineAlignment(Alignment.Far); //bottom line
    this.ioNodeList.addNode(node, "TACT SWITCH"); //use 'name' from XML file

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

mfDiagram.prototype.getMicroPort = function (link, toMicro, chr) {
    //this will return 1 character from the anchor tag
    var n;
    if (toMicro) {
        n = link.getDestinationAnchor();
    }
    else //from micro
    {
        n = link.getOriginAnchor();
    }
    var pts = myMicrocontrollerNode.getAnchorPattern().getPoints();
    var port = pts[n].getTag().substring(chr, chr + 1);
    return port;
}

mfDiagram.prototype.openPackagesFile = function () {
    var self = this;
    $.getJSON('json/avr8_packagedetails.json', function (d) {
        packagesjson = d;
    }).
    success(function () {
        packagesLoaded = true;
    }).
    complete(function () {
        //alert("complete");
    }).
    error(function (jqXHR, textStatus, errorThrown) {
        alert('error ' + textStatus + ' ' + errorThrown);
    });
}

mfDiagram.prototype.getAllMicros = function () {
    //load micro partnumbers into micros[] from the json file
    var length = this.microsjson.micros.micro.length; //number of diff micros
    var i = 0;
    for (i = 0; i < length; i++) {
        this.microsPartNumbersArr.push({
            partnumber: this.microsjson.micros.micro[i].partnumber,
            packname: this.packagesjson.packages.package[i].packname
        });
    }
}

mfDiagram.prototype.getNodeById = function (id) {
    var arr = diagram.getNodes();
    for (var i = 0; i < arr.length; i++) {
        if (arr[i].getId() === id)
            return arr[i];
    }
    return false;
}

mfDiagram.prototype.initMicrosNodeList = function () {
    //make nodelist out of micros[] to display
    var i;
    for (i = 0; i < this.microPartsPackages.length; i++) {
        var node = new ShapeNode(diagram);
        var pn = this.microPartsPackages[i].partnumber;
        var pt = pn.indexOf('(') > -1 ? pn.indexOf('(') : pn.length - 1 //get rid of any ()
        pn = pn.substring(0, pt);
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

mfDiagram.prototype.openMicrosFile = function () {
    var self = this; //because context for 'this' changes within the callback
    $.getJSON('json/avr8_micro.json', function (d) {
        microsjson = d;
    }).
    success(function () {
        this.microsLoaded = true;
        self.microPartsPackages.length = 0;
        var length = microsjson.micros.micro.length; //number of diff micros
        for (var i = 0; i < length; i++) {
            self.microPartsPackages.push({
                partnumber: microsjson.micros.micro[i].partnumber,
                packname: packagesjson.packages.package[i].packname
            });
        }
        self.initMicrosNodeList();
    }).
    complete(function () {
        //alert("complete");
    }).
    error(function (jqXHR, textStatus, errorThrown) {
        alert('error ' + textStatus + ' ' + errorThrown);
    });
}

mfDiagram.prototype.onNodeCreated = function(sender, args) {//called when a node is dropped on the diagram
    var newnode = args.getNode();
    if (newnode.getId() === "micro") {
        var deleteMicro = false;
        if (myMicrocontrollerNode != null)
            deleteMicro = confirm("This will remove the micro and all links");
        if (deleteMicro === false) {
            return;
        }
        //diagram.clearAll(); //dont clear all - just remove micro
        var n = mf.getNodeById(myMicrocontrollerNode.getId())
        if (n) {
            diagram.removeItem(n);
        }
        var partnum = newnode.getText();
        diagram.removeItem(newnode);//dont want this node create our own
        myMicrocontroller.makeMicro(partnum);
        myMicrocontrollerNode = new MicrocontrollerNode(myMicrocontroller);//make a diagram node for the micro
        updateRegistersDisplay();
        return;
    }
    if (newnode.getId() === "led") {
        var ap = createAnchorPoint(0, 50, true, false, MarkStyle.Rectangle, blue, 2, "led")
        var pat = new AnchorPattern([ap]);
        newnode.setAnchorPattern(pat);
        newnode.setBounds(new Rect(newnode.bounds.x, newnode.bounds.y, 20, 10));
    }

    //number the new node in sequence by its type
    var count = 0;
    Array.forEach(diagram.getNodes(), function (node) {
        if (node.getId() === newnode.getId())
            count++;
    });
    newnode.setText(newnode.getText() + count);
}

mfDiagram.prototype.createAnchorPoint = function (x, y, inok, outok, style, col, size, tag) {
    var ap = new AnchorPoint(x, y, inok, outok, style, col, size, tag);
    ap.setTag(tag);
    return ap;
}