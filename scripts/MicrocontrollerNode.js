"use strict";
var MicrocontrollerNode;

MicrocontrollerNode = function (micro) {
    //sets up a blank device with nodes
    //does not add them to the diagram
    this.microcontroller = micro;
    this.microPackage = micro.microPackage;
    this.microWidth;
    this.microHeight;
    this.microAnchorPattern;

    this.Node = new MindFusion.Diagramming.ShapeNode(diagram);
    this.Node.setShape("Rectangle");
    this.Node.setImageAlign(ImageAlign.Stretch);
    
    this.codeNode = new MindFusion.Diagramming.ShapeNode(diagram);
    this.codeNode.setShape("Rectangle");

    this.olinks = this.Node.getOutgoingLinks();
    this.ilinks = this.Node.getIncomingLinks();
}
MicrocontrollerNode.prototype.setNewMicro = function (micro) {
    //structures the device and the nodes
    this.microcontroller = micro;
    this.microPackage = micro.microPackage;
    this.microWidth;
    this.microHeight;
    this.microAnchorPattern;

    //this.Node = new MindFusion.Diagramming.ShapeNode(diagram);
    this.Node.setImageLocation("images/_img_micro_" + this.microPackage + ".png");
    this.Node.setId("micro-" + micro.microPartnumber);
    //this.Node.getImage(); //??
    this.getPackageDetails();
    this.Node.setBounds(new Rect(60, 40, this.microWidth, this.microHeight));
    this.Node.setAnchorPattern(this.microAnchorPattern);
    

    //?? check that it exists?
    this.codeNode.setBounds(new Rect(60, 40 + this.microHeight+10, this.microWidth, this.microHeight));
    this.codeNode.setId("codenode");
    this.codeNode.setVisible(false);

    diagram.addItem(this.Node);
    diagram.addItem(this.codeNode);

    this.olinks = this.Node.getOutgoingLinks();
    this.ilinks = this.Node.getIncomingLinks();

    if (this.microPackage === "xplained")
        this.newXplained();
}
MicrocontrollerNode.prototype.readBinaryInputs = function () {
    //read all input pins and return an arr of their states [{PORT,PIN,STATE}]
}
MicrocontrollerNode.prototype.readAnalogInputs = function () {
    //read all input pins and return an arr of their states [{PORT,PIN,VALUE}]
}
MicrocontrollerNode.prototype.getPackageDetails = function () {
    var length = mf.packages.length; //number of diff micros
    this.microAnchorPattern = new AnchorPattern([]);
    for (var index = 0; index < length; index++) {
        if (this.microPackage === mf.packages[index].packname) {
            this.microWidth = mf.packages[index].nodewidth;
            this.microHeight = mf.packages[index].nodeheight;
            var x, y, i, o, ms, col, pt, pin;
            //create anchor points
            for (var point = 0; point < mf.packages[index].anchorpoint.length; point++) {
                pin = mf.packages[index].anchorpoint[point].pin - 1;
                x = mf.packages[index].anchorpoint[point].x;
                y = mf.packages[index].anchorpoint[point].y;
                i = mf.packages[index].anchorpoint[point].i;
                o = mf.packages[index].anchorpoint[point].o;
                ms = "MarkStyle." + mf.packages[index].anchorpoint[point].ms;
                col = mf.packages[index].anchorpoint[point].col.toLowerCase();
                col = col.substr(0, col.length);
                pt = new AnchorPoint(x, y, i, o, 4, col, 2)//, ms, col, 2, microPins[pin][0]);
                pt.setTag(this.microcontroller.microPins[pin][0]);
                this.microAnchorPattern.points.push(pt);
            }
        }
    }

}
MicrocontrollerNode.prototype.getMicroAnchorTag = function (link) {
    //returns e.g. C.3, no matter whether incoming or outgoing link
}
MicrocontrollerNode.prototype.makeLinkTag = function (link) {
    if (this.Node === null)//no micro
        return;
    var linktag;
    var apt;
    if (link.getDestination().getId().indexOf("micro") > -1) {
        apt = link.getDestinationAnchor();
    }
    else if (link.getOrigin().getId().indexOf("micro") > -1){
        apt = link.getOriginAnchor();
    }
    else {
        return
    }
    var pts = this.Node.getAnchorPattern().getPoints();
    try {
        linktag = pts[apt].getTag();
        link.setTag(linktag);
        return linktag;
    } catch (e) {
        var error = e;
    }
    //var linktag = this.getMicroAnchorTag(link);
    //var mflinktag = mf.getMicroAnchorTag(link)
    //link.setTag(linktag);
}
MicrocontrollerNode.prototype.newXplained = function () {
    //new LED
    var ledB5 = mf.makeLED(140, 50)
    ledB5.setText("led_0");
    //ledB5.setBrush(white)//off
    //ledB5.setTag(red) //on color
    //ledB5.setId("led")

    var ledB5link = diagram.getFactory().createDiagramLink(this.Node, ledB5);
    ledB5link.setOriginAnchor(20);
    ledB5link.route();
    this.makeLinkTag(ledB5link);
    mf.setLinkColorText(ledB5link, 0, 0)
    

    //new tactsw
    var swB7 = diagram.getFactory().createSvgNode(new Rect(100, 180, 20, 20));
    var svg = new SvgContent();
    svg.parse("images/_img_input_binary_tactswitch.svg");
    swB7.setContent(svg);
    swB7.setText("tactSw_0"); //use 'text' from XML file
    swB7.setAllowIncomingLinks(false); //default for binaryinputs
    swB7.setId("tact_binary__"); //use 'type' in XML file
   // swB7.setImageLocation("images/_img_input_binary_tactswitch.svg"); //'use 'image' from XML file
    swB7.setShape("Rectangle");
    swB7.setTextAlignment(Alignment.Center); //center of line
    swB7.setLineAlignment(Alignment.Far); //bottom line

    var swB7link = diagram.getFactory().createDiagramLink(swB7, this.Node);
    swB7link.setDestinationAnchor(6);
    //swB7link.setStrokeThickness(2);
    //swB7link.setStroke(red)
    swB7link.route();
    this.makeLinkTag(swB7link);
    mf.setLinkColorText(swB7link, 5, 1)
    //swB7link.setText("1")
    //set sw0 bit7 high
    myMicrocontroller.Registers.writeRegBit("PINB", 7, 1);
}
